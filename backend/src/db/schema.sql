CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  name        TEXT         NOT NULL,
  email       VARCHAR(255) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  address     VARCHAR(400) NOT NULL CHECK (char_length(address) <= 400),
  role        VARCHAR(20)  NOT NULL DEFAULT 'user'
                CHECK (role IN ('admin', 'user', 'owner')),
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stores (
  id          SERIAL PRIMARY KEY,
  name        TEXT         NOT NULL,
  email       VARCHAR(255) NOT NULL UNIQUE,
  address     VARCHAR(400) NOT NULL CHECK (char_length(address) <= 400),
  owner_id    INTEGER      REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ratings (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store_id    INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  rating      SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, store_id)
);

CREATE INDEX IF NOT EXISTS idx_stores_owner    ON stores(owner_id);
CREATE INDEX IF NOT EXISTS idx_ratings_store   ON ratings(store_id);
CREATE INDEX IF NOT EXISTS idx_ratings_user    ON ratings(user_id);
