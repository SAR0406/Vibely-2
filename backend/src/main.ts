import './otel-setup';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';

import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import compression from 'compression';
import { RedisIoAdapter } from './common/adapters/redis-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  // Security Headers
  app.use(helmet());
  app.use(compression());

  // WebSocket Adapter (Redis) - Optional for development
  const redisIoAdapter = new RedisIoAdapter(app);
  const redisConnected = await redisIoAdapter.connectToRedis();

  if (redisConnected) {
    app.useWebSocketAdapter(redisIoAdapter);
  } else {
    app.get(Logger).warn('Using default Socket.IO adapter (no Redis)');
  }

  // Global Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable CORS for frontend
  app.enableCors({
    origin: '*', // In production, replace with specific frontend URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(5000);
}
bootstrap();
