import { logger } from '@nepse-dashboard/logger';
import { captureException } from '@sentry/bun';
import { createClient, type RedisClientType } from 'redis';
import env from '../env.js';

class Redis {
  private client: RedisClientType;
  private connected = false;
  private static instance: Redis;

  constructor() {
    this.client = createClient({
      url: env.REDIS_URL,
      socket: {
        reconnectStrategy: (retries: number) => Math.min(retries * 50, 1000),
      },
    });

    this.client.on('error', (err: Error) => {
      logger.error(`Redis Client Error ${err.message}`);
      captureException(err);
    });
    this.client.on('connect', () => {
      this.connected = true;
      logger.info('Redis connected successfully');
    });
    this.client.on('disconnect', () => {
      this.connected = false;
      logger.warn('Redis disconnected');
    });
  }

  static async getInstance(): Promise<Redis> {
    if (!Redis.instance) {
      Redis.instance = new Redis();
      await Redis.instance.client.connect();
    }
    return Redis.instance;
  }

  getClient(): RedisClientType {
    if (!this.connected) {
      captureException(new Error('Redis not connected'));
      throw new Error('Redis not connected');
    }
    return this.client;
  }
}

export const redis = await Redis.getInstance().then((util) => util.getClient());
