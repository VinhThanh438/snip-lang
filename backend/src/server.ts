import app from './app';
import { config } from './core/config';
import { logger } from './core/logger';

// For local development: start a traditional server
if (!config.isVercel) {
  const bootstrap = async () => {
    try {
      const server = app.listen(config.port, () => {
        logger.info(`Server running on port ${config.port} [${config.env}]`);
      });

      const shutdown = async (signal: string) => {
        logger.info(`${signal} received — shutting down gracefully`);
        server.close(async () => {
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
  };

  bootstrap();
}

// Export for Vercel serverless
export default app;
