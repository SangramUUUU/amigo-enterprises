/**
 * Vercel rewrites /api/* to /api/express, so Express sees the wrong path.
 * Restore the original /api/... path before routing.
 */
function vercelPathFix(req, res, next) {
  if (!process.env.VERCEL) return next();

  const current = req.url || '';

  // Already the real API path
  if (current.startsWith('/api/') && !current.startsWith('/api/express')) {
    return next();
  }

  // From vercel.json: /api/express?path=auth/login
  try {
    const parsed = new URL(current, 'http://localhost');
    const pathParam = parsed.searchParams.get('path');
    if (pathParam) {
      parsed.searchParams.delete('path');
      const qs = parsed.searchParams.toString();
      req.url = `/api/${pathParam}${qs ? `?${qs}` : ''}`;
      return next();
    }
  } catch (_) {
    /* fall through */
  }

  // Header fallbacks
  const headers = [
    req.headers['x-vercel-original-url'],
    req.headers['x-original-url'],
    req.headers['x-forwarded-uri'],
    req.headers['x-invoke-path'],
  ];

  for (const raw of headers) {
    if (!raw || typeof raw !== 'string') continue;
    try {
      const pathname = raw.startsWith('http') ? new URL(raw).pathname : raw.split('?')[0];
      if (pathname.startsWith('/api/') && pathname !== '/api/express') {
        req.url = pathname;
        return next();
      }
    } catch (_) {
      /* try next header */
    }
  }

  next();
}

module.exports = vercelPathFix;
