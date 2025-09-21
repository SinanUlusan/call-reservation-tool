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
  const isDevelopment = process.env.NODE_ENV !== 'production';

  const corsOptions = {
    origin: isDevelopment
      ? true
      : function (origin, callback) {
          // Allow requests with no origin (like mobile apps or curl requests)
          if (!origin) return callback(null, true);

          const allowedOrigins = [
            process.env.FRONTEND_URL || 'http://localhost:3000',
            'http://localhost:3000',
            'http://localhost:3001',
            'https://calenmate.vercel.app',
            'https://calenmate-bm6mgvm32-sinanulusans-projects.vercel.app',
            'https://calenmate-git-main-sinanulusans-projects.vercel.app',
            'https://calenmate-sinanulusans-projects.vercel.app',
            /^https:\/\/calenmate.*\.vercel\.app$/, // Vercel preview URLs
            /^https:\/\/.*\.vercel\.app$/, // All Vercel apps
          ];

          // Check if origin is allowed
          const isAllowed = allowedOrigins.some((allowedOrigin) => {
            if (typeof allowedOrigin === 'string') {
              return origin === allowedOrigin;
            } else if (allowedOrigin instanceof RegExp) {
              return allowedOrigin.test(origin);
            }
            return false;
          });

          if (isAllowed) {
            callback(null, true);
          } else {
            console.log('CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
          }
        },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Access-Control-Request-Method',
      'Access-Control-Request-Headers',
    ],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  };

  app.enableCors(corsOptions);

  // Log CORS configuration
  Logger.log(
    `🔧 CORS enabled for ${isDevelopment ? 'development' : 'production'} mode`
  );

  // Add CORS debugging middleware
  app.use((req, res, next) => {
    Logger.log(`🌐 Request from origin: ${req.headers.origin || 'no-origin'}`);
    Logger.log(`🌐 Request method: ${req.method}`);
    Logger.log(`🌐 Request path: ${req.path}`);
    next();
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

  Logger.log(`🔧 Starting application on port: ${port}`);
  Logger.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  Logger.log(`🔧 Database path: ${process.env.DATABASE_PATH || 'default'}`);
  Logger.log(`🔧 Frontend URL: ${process.env.FRONTEND_URL || 'not set'}`);
  Logger.log(`🔧 All env vars:`, {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_PATH: process.env.DATABASE_PATH,
    TYPEORM_SYNCHRONIZE: process.env.TYPEORM_SYNCHRONIZE,
    FRONTEND_URL: process.env.FRONTEND_URL,
  });

  await app.listen(port, '0.0.0.0');

  Logger.log(
    `🚀 Application is running on: http://0.0.0.0:${port}/${globalPrefix}`
  );
  Logger.log(
    `📚 API Documentation available at: http://0.0.0.0:${port}/${globalPrefix}/docs`
  );
}

bootstrap().catch((error) => {
  Logger.error('Failed to start application', error);
  process.exit(1);
});
