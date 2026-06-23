const session = require('express-session');
const connectPgSimple = require('connect-pg-simple');
const pool = require('../db/pool');
const { sessionSecret, sessionMaxAgeMs, nodeEnv } = require('./env');

const PgSession = connectPgSimple(session);

function createSessionMiddleware() {
  return session({
    store: new PgSession({
      pool,
      tableName: 'session',
      createTableIfMissing: true,
      errorLog: (...args) => console.error('[session-store]', ...args),
    }),
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      maxAge: sessionMaxAgeMs,
      httpOnly: true,
      secure: nodeEnv === 'production',
      sameSite: 'lax',
    },
  });
}

module.exports = { createSessionMiddleware };
