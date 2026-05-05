/**
 * Queue module — kept for backwards compatibility.
 * In serverless (Vercel), queues are not used.
 * Analysis is performed inline instead.
 */

import { logger } from '../logger';

export const QUEUE_NAMES = {
  AI_ANALYSIS: 'ai-analysis',
} as const;

export function createQueue(_name: string) {
  logger.debug('Queue not available in serverless mode');
  return null;
}

export function createWorker<T>(
  _queueName: string,
  _processor: (job: { data: T; id?: string }) => Promise<void>
) {
  logger.debug('Worker not available in serverless mode');
  return null;
}
