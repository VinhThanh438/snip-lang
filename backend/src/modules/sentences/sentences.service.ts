import crypto from 'crypto';
import { SentenceModel } from '../../core/database/models/sentence.model';
import { SentenceAnalysisModel } from '../../core/database/models/sentence-analysis.model';
import { createQueue, QUEUE_NAMES } from '../../core/queue';
import { getRedisClient, CacheKeys } from '../../core/redis/client';
import { config } from '../../core/config';
import { Errors } from '../../core/errors';
import { SaveSentenceDto, GetSentencesQuery } from './sentences.types';

const analysisQueue = createQueue(QUEUE_NAMES.AI_ANALYSIS);

function hashText(text: string): string {
  return crypto.createHash('sha256').update(text.toLowerCase().trim()).digest('hex');
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return '';
  }
}

export async function saveSentence(userId: string, dto: SaveSentenceDto) {
  const textHash = hashText(dto.text);
  const sourceDomain = extractDomain(dto.sourceUrl || '');

  const sentence = await SentenceModel.create({
    userId,
    text: dto.text,
    textHash,
    sourceUrl: dto.sourceUrl || '',
    sourceTitle: dto.sourceTitle || '',
    sourceDomain,
    analysisStatus: 'pending',
  });

  const redis = getRedisClient();
  const cachedAnalysis = await redis.get(CacheKeys.analysis(textHash));

  if (cachedAnalysis) {
    const existingAnalysis = await SentenceAnalysisModel.findOne({ textHash });
    if (existingAnalysis) {
      await SentenceModel.findByIdAndUpdate(sentence._id, {
        analysisStatus: 'completed',
        analysisId: existingAnalysis._id,
      });
      return { ...sentence.toObject(), analysisStatus: 'completed', analysisId: existingAnalysis._id };
    }
  }

  await analysisQueue.add('analyze', {
    sentenceId: sentence._id.toString(),
    text: dto.text,
    textHash,
  });

  return sentence;
}

export async function getSentences(userId: string, query: GetSentencesQuery) {
  const { page, limit, search, status, domain, isFavorited } = query;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {
    userId,
    isArchived: false,
  };

  if (status) filter.analysisStatus = status;
  if (domain) filter.sourceDomain = domain;
  if (isFavorited !== undefined) filter.isFavorited = isFavorited;
  if (search) filter.$text = { $search: search };

  const [sentences, total] = await Promise.all([
    SentenceModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    SentenceModel.countDocuments(filter),
  ]);

  return {
    sentences,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
    },
  };
}

export async function getSentenceById(userId: string, sentenceId: string) {
  const sentence = await SentenceModel.findOne({ _id: sentenceId, userId, isArchived: false }).lean();
  if (!sentence) throw Errors.NotFound('Sentence');

  if (sentence.analysisStatus !== 'completed' || !sentence.analysisId) {
    return { sentence, analysis: null };
  }

  const analysis = await SentenceAnalysisModel.findById(sentence.analysisId).lean();
  return { sentence, analysis };
}

export async function deleteSentence(userId: string, sentenceId: string): Promise<void> {
  const sentence = await SentenceModel.findOne({ _id: sentenceId, userId });
  if (!sentence) throw Errors.NotFound('Sentence');

  await SentenceModel.findByIdAndUpdate(sentenceId, { isArchived: true });
}

export async function toggleFavorite(userId: string, sentenceId: string) {
  const sentence = await SentenceModel.findOne({ _id: sentenceId, userId, isArchived: false });
  if (!sentence) throw Errors.NotFound('Sentence');

  const updated = await SentenceModel.findByIdAndUpdate(
    sentenceId,
    { isFavorited: !sentence.isFavorited },
    { new: true }
  ).lean();

  return updated;
}
