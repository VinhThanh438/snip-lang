/**
 * Analysis worker — kept for backwards compatibility.
 * In serverless (Vercel), this is a no-op.
 * AI analysis runs inline in sentences.service.ts instead.
 */

import { logger } from '../core/logger';

export function startAnalysisWorker() {
  logger.debug('Worker not available in serverless mode — analysis runs inline');
  return {
    close: async () => {},
  };
}
