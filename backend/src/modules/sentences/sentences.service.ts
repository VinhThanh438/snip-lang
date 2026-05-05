import crypto from 'crypto';
import { SentenceModel } from '../../core/database/models/sentence.model';
import { SentenceAnalysisModel } from '../../core/database/models/sentence-analysis.model';
import { getRedisClient, CacheKeys } from '../../core/redis/client';
import { analyzeSentenceWithAI } from '../../core/ai/gemini.service';
import { config } from '../../core/config';
import { Errors } from '../../core/errors';
import { logger } from '../../core/logger';
import { SaveSentenceDto, GetSentencesQuery } from './sentences.types';

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

/**
 * Perform AI analysis inline (serverless-compatible).
 * No queue/worker needed — runs directly in the request handler.
 */
async function analyzeInline(sentenceId: string, text: string, textHash: string): Promise<void> {
  try {
    await SentenceModel.findByIdAndUpdate(sentenceId, { analysisStatus: 'processing' });

    // Check if analysis already exists for this text
    const existingAnalysis = await SentenceAnalysisModel.findOne({ textHash });
    if (existingAnalysis) {
      await SentenceModel.findByIdAndUpdate(sentenceId, {
        analysisStatus: 'completed',
        analysisId: existingAnalysis._id,
      });
      logger.info(`Analysis reused for sentence ${sentenceId}`);
      return;
    }

    const startTime = Date.now();
    const aiResult = await analyzeSentenceWithAI(text);
    const processingTimeMs = Date.now() - startTime;

    const analysis = await SentenceAnalysisModel.create({
      sentenceId,
      textHash,
      translation: aiResult.translation,
      grammar: aiResult.grammar,
      vocabulary: aiResult.vocabulary,
      context: aiResult.context,
      similarSentences: aiResult.similarSentences,
      aiModel: config.gemini.model,
      processingTimeMs,
    });

    await SentenceModel.findByIdAndUpdate(sentenceId, {
      analysisStatus: 'completed',
      analysisId: analysis._id,
    });

    // Cache in Redis if available
    const redis = getRedisClient();
    if (redis) {
      await redis.setex(
        CacheKeys.analysis(textHash),
        config.cache.analysisTtlSeconds,
        analysis._id.toString()
      );
    }

    logger.info(`Analysis completed for sentence ${sentenceId} in ${processingTimeMs}ms`);
  } catch (err) {
    logger.error(`Analysis failed for sentence ${sentenceId}`, { error: (err as Error).message });
    await SentenceModel.findByIdAndUpdate(sentenceId, { analysisStatus: 'failed' });
  }
}

export async function saveSentence(userId: string, dto: SaveSentenceDto) {
  const textHash = hashText(dto.text);
  const sourceDomain = extractDomain(dto.sourceUrl || '');

  // Check cache first (Redis if available, then DB)
  const redis = getRedisClient();
  if (redis) {
    const cachedAnalysis = await redis.get(CacheKeys.analysis(textHash));
    if (cachedAnalysis) {
      const existingAnalysis = await SentenceAnalysisModel.findOne({ textHash });
      if (existingAnalysis) {
        const sentence = await SentenceModel.create({
          userId,
          text: dto.text,
          textHash,
          sourceUrl: dto.sourceUrl || '',
          sourceTitle: dto.sourceTitle || '',
          sourceDomain,
          analysisStatus: 'completed',
          analysisId: existingAnalysis._id,
        });
        return sentence;
      }
    }
  } else {
    // No Redis — check DB directly for existing analysis
    const existingAnalysis = await SentenceAnalysisModel.findOne({ textHash });
    if (existingAnalysis) {
      const sentence = await SentenceModel.create({
        userId,
        text: dto.text,
        textHash,
        sourceUrl: dto.sourceUrl || '',
        sourceTitle: dto.sourceTitle || '',
        sourceDomain,
        analysisStatus: 'completed',
        analysisId: existingAnalysis._id,
      });
      return sentence;
    }
  }

  const sentence = await SentenceModel.create({
    userId,
    text: dto.text,
    textHash,
    sourceUrl: dto.sourceUrl || '',
    sourceTitle: dto.sourceTitle || '',
    sourceDomain,
    analysisStatus: 'pending',
  });

  // Inline analysis (no queue needed for serverless)
  // Run without awaiting so the response returns quickly.
  // In serverless the function stays alive until all promises resolve.
  analyzeInline(sentence._id.toString(), dto.text, textHash);

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
