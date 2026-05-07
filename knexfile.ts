import type { Knex } from 'knex';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

const config: Knex.Config = {
  client: 'pg',
  connection: {
    host: requireEnv('DATABASE_HOST'),
    port: Number(requireEnv('DATABASE_PORT')),
    database: requireEnv('DATABASE_NAME'),
    user: requireEnv('DATABASE_USER'),
    password: requireEnv('DATABASE_PASSWORD'),
    ssl:
      (process.env.DATABASE_SSL ?? 'false').toLowerCase() === 'true'
        ? { rejectUnauthorized: false }
        : undefined,
  },
  migrations: {
    directory: './db/migrations',
    extension: 'ts',
  },
  seeds: {
    directory: './db/seeds',
    extension: 'ts',
  },
};

export default config;

