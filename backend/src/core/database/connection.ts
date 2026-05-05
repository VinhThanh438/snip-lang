import mongoose from 'mongoose';
import { config } from '../config';
import { logger } from '../logger';

/**
 * Cached connection for serverless environments.
 * In serverless, each function invocation may create a new module scope,
 * but the connection can be reused across warm invocations via the global cache.
 */
let cached: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } = {
  conn: null,
  promise: null,
};

export async function connectDatabase(): Promise<void> {
  if (cached.conn && mongoose.connection.readyState === 1) return;

  if (!cached.promise) {
    mongoose.connection.on('connected', () => {
      logger.info('MongoDB connected');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error', { error: err.message });
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    cached.promise = mongoose.connect(config.mongodb.uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
  }

  cached.conn = await cached.promise;
}

export async function disconnectDatabase(): Promise<void> {
  if (cached.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
  }
}
