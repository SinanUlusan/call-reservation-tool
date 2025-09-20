/**
 * Call Reservation Tool - Main Application Entry Point
 * A NestJS backend service for managing call reservations
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix for all routes
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // Enable CORS for frontend integration
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'https://calenmate-bm6mgvm32-sinanulusans-projects.vercel.app',
      'https://calenmate-git-main-sinanulusans-projects.vercel.app',
      'https://calenmate-sinanulusans-projects.vercel.app',
      /^https:\/\/calenmate.*\.vercel\.app$/, // Vercel preview URLs
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  // Swagger documentation setup
  const config = new DocumentBuilder()
    .setTitle('Call Reservation Tool API')
    .setDescription(
      'A comprehensive API for managing call reservations with admin controls and user notifications'
    )
    .setVersion('1.0')
    .addTag('reservations', 'Reservation management endpoints')
    .addTag('admin', 'Admin-specific operations')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Call Reservation Tool API Documentation',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
  Logger.log(
    `📚 API Documentation available at: http://localhost:${port}/${globalPrefix}/docs`
  );
  Logger.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap().catch((error) => {
  Logger.error('Failed to start application', error);
  process.exit(1);
});
