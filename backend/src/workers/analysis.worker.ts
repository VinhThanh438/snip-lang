import { createWorker, QUEUE_NAMES } from '../core/queue';
import { SentenceModel } from '../core/database/models/sentence.model';
import { SentenceAnalysisModel } from '../core/database/models/sentence-analysis.model';
import { analyzeSentenceWithAI } from '../core/ai/gemini.service';
import { getRedisClient, CacheKeys } from '../core/redis/client';
import { config } from '../core/config';
import { logger } from '../core/logger';

interface AnalysisJobData {
  sentenceId: string;
  text: string;
  textHash: string;
}

export function startAnalysisWorker() {
  const worker = createWorker<AnalysisJobData>(QUEUE_NAMES.AI_ANALYSIS, async (job) => {
    const { sentenceId, text, textHash } = job.data;
    const startTime = Date.now();

    await SentenceModel.findByIdAndUpdate(sentenceId, { analysisStatus: 'processing' });

    const redis = getRedisClient();

    const existingAnalysis = await SentenceAnalysisModel.findOne({ textHash });
    if (existingAnalysis) {
      await SentenceModel.findByIdAndUpdate(sentenceId, {
        analysisStatus: 'completed',
        analysisId: existingAnalysis._id,
      });
      logger.info(`Analysis reused from cache for sentence ${sentenceId}`);
      return;
    }

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

    await redis.setex(
      CacheKeys.analysis(textHash),
      config.cache.analysisTtlSeconds,
      analysis._id.toString()
    );

    logger.info(`Analysis completed for sentence ${sentenceId} in ${processingTimeMs}ms`);
  });

  return worker;
}
