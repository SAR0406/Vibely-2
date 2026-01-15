import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { Logger } from '@nestjs/common';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter> | null = null;
  private readonly logger = new Logger(RedisIoAdapter.name);
  private isRedisConnected = false;

  async connectToRedis(): Promise<boolean> {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      this.logger.log(`Attempting to connect to Redis at ${redisUrl}...`);

      const pubClient = createClient({ url: redisUrl });
      const subClient = pubClient.duplicate();

      // Set a connection timeout
      const timeout = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Redis connection timeout')), 5000);
      });

      await Promise.race([
        Promise.all([pubClient.connect(), subClient.connect()]),
        timeout,
      ]);

      this.adapterConstructor = createAdapter(pubClient, subClient);
      this.isRedisConnected = true;
      this.logger.log('✅ Redis Adapter connected successfully');
      return true;
    } catch (error) {
      this.logger.warn(`⚠️ Redis connection failed: ${error.message}`);
      this.logger.warn('📢 Running without Redis adapter (single-instance mode)');
      this.isRedisConnected = false;
      return false;
    }
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    if (this.isRedisConnected && this.adapterConstructor) {
      server.adapter(this.adapterConstructor);
    }
    return server;
  }
}

