import { DataSource } from 'typeorm';

const AppDataSource = new DataSource({
  type: 'sqlite',
  database: process.env.DATABASE_PATH || 'reservations.db',
  entities: ['dist/apps/call-reservation-tool/src/shared/entities/*.js'],
  migrations: ['dist/apps/call-reservation-tool/src/migrations/*.js'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
});

export default AppDataSource;
