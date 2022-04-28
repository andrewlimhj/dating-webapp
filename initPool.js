import pg from 'pg';

const { Pool } = pg;

let pgConnectionConfigs;

/* --------------------------------- heroku --------------------------------- */
if (process.env.DATABASE_URL) {
  // pg will take in the entire value and use it to connect
  pgConnectionConfigs = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  };
  /* ----------------------------------- aws ---------------------------------- */
} else if (process.env.ENV === 'PRODUCTION') {
  pgConnectionConfigs = {
    user: 'postgres',
    password: process.env.DB_PASSWORD,
    host: 'localhost',
    database: 'dating',
    port: 5432,
  };
  /* ------------------------------- local host ------------------------------- */
} else {
  pgConnectionConfigs = {
    user: 'yickkiuliamleung',
    host: 'localhost',
    database: 'dating',
    port: 5432,
  };
}

const pool = new Pool(pgConnectionConfigs);

export default pool;
