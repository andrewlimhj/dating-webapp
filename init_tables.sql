DROP TABLE IF EXISTS matching;
DROP TABLE IF EXISTS matched;
DROP TABLE IF EXISTS messages;

CREATE TABLE IF NOT EXISTS user_account (
  id SERIAL PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  password TEXT,
  profession TEXT,
  gender TEXT,
  country TEXT,
  date_of_birth DATE,
  photo_link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS matching (
  id SERIAL PRIMARY KEY,
  from_user_account_id INTEGER,
  to_user_account_id INTEGER,
  liked BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS matched (
  id SERIAL PRIMARY KEY,
  a_user_account_id INTEGER,
  b_user_account_id INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  roomid INTEGER,
  sender TEXT,
  message TEXT,
  send_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
)