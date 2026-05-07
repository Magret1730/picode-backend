import { ConfigService } from '@nestjs/config';
import knex, { type Knex } from 'knex';

export const KNEX = Symbol('KNEX');

export const knexProvider = {
  provide: KNEX,
  inject: [ConfigService],
  useFactory: (config: ConfigService): Knex => {
    const sslEnabled =
      (config.get<string>('DATABASE_SSL') ?? 'false').toLowerCase() === 'true';

    return knex({
      client: 'pg',
      connection: {
        host: config.get<string>('DATABASE_HOST'),
        port: Number(config.get<string>('DATABASE_PORT') ?? 5432),
        database: config.get<string>('DATABASE_NAME'),
        user: config.get<string>('DATABASE_USER'),
        password: config.get<string>('DATABASE_PASSWORD'),
        ssl: sslEnabled ? { rejectUnauthorized: false } : undefined,
      },
      pool: { min: 0, max: 10 },
    });
  },
};

