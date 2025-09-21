import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ReservationModule } from '../modules/reservation/reservation.module';
import { AdminModule } from '../modules/admin/admin.module';
import { Reservation } from '../shared/entities/reservation.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'sqlite',
        database: configService.get('DATABASE_PATH', 'reservations.db'),
        entities: [Reservation],
        migrations: ['migrations/*.js'],
        migrationsRun: configService.get('NODE_ENV') === 'production',
        synchronize:
          configService.get('NODE_ENV') !== 'production' ||
          configService.get('TYPEORM_SYNCHRONIZE') === 'true', // Enable in development or when explicitly set
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    ReservationModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
