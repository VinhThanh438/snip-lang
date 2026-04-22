import { Queue, Worker, QueueEvents } from 'bullmq';
import { getRedisClient } from '../redis/client';
import { logger } from '../logger';

const connection = { url: '' };

export function createQueue(name: string): Queue {
  return new Queue(name, {
    connection: getRedisClient(),
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 50 },
    },
  });
}

export function createWorker<T>(
  queueName: string,
  processor: (job: { data: T; id?: string }) => Promise<void>
): Worker {
  const worker = new Worker(
    queueName,
    async (job) => {
      logger.info(`Processing job ${job.id} from queue ${queueName}`);
      await processor({ data: job.data as T, id: job.id });
    },
    {
      connection: getRedisClient(),
      concurrency: 5,
    }
  );

  worker.on('completed', (job) => {
    logger.info(`Job ${job.id} completed in queue ${queueName}`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`Job ${job?.id} failed in queue ${queueName}`, { error: err.message });
  });

  return worker;
}

export const QUEUE_NAMES = {
  AI_ANALYSIS: 'ai-analysis',
} as const;
