import pg from 'pg';

const { Pool } = pg;

let pgConnectionConfigs;

if (process.env.ENV === 'PRODUCTION') {
  pgConnectionConfigs = {
    user: 'postgres',
    password: process.env.DB_PASSWORD,
    host: 'localhost',
    database: 'dating',
    port: 5432,
  };
} else {
  pgConnectionConfigs = {
    user: 'andrewlim',
    host: 'localhost',
    database: 'dating',
    port: 5432,
  };
}

const pool = new Pool(pgConnectionConfigs);

export default pool;
