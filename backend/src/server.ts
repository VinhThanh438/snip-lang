import app from './app';
import { connectDatabase } from './core/database/connection';
import { getRedisClient } from './core/redis/client';
import { startAnalysisWorker } from './workers/analysis.worker';
import { config } from './core/config';
import { logger } from './core/logger';

async function bootstrap() {
  try {
    await connectDatabase();
    getRedisClient();

    const worker = startAnalysisWorker();
    logger.info('Analysis worker started');

    const server = app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port} [${config.env}]`);
    });

    const shutdown = async (signal: string) => {
      logger.info(`${signal} received — shutting down gracefully`);
      server.close(async () => {
        await worker.close();
        logger.info('Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    logger.error('Failed to start server', { error: (err as Error).message });
    process.exit(1);
  }
}

bootstrap();
