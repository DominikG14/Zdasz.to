import 'dotenv/config';

const connection = process.env.DATABASE_URL || 'postgres://docker:docker@127.0.0.1:5433/db';

const config = {
  client: 'pg',
  connection,
  migrations: { directory: './src/db/migrations', extension: 'js', tableName: 'knex_migrations' },
  seeds: { directory: './src/db/seeds', extension: 'js' },
};

export default { development: config, production: config };
