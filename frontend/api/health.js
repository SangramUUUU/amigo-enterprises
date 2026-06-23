module.exports = (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).end(
    JSON.stringify({
      status: 'ok',
      handler: 'health.js',
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
      nodeEnv: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    })
  );
};
