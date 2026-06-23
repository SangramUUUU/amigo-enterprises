/**
 * Vercel rewrites /api/* to /api/express?path=..., so Express sees the wrong path.
 * Restore the original /api/... path before routing.
 */
function restoreVercelPath(req) {
  if (!process.env.VERCEL || !req) return;

  const current = req.url || '';

  if (current.startsWith('/api/') && !current.startsWith('/api/express')) {
    return;
  }

  try {
    const parsed = new URL(current, 'http://localhost');
    const pathParam = parsed.searchParams.get('path');
    if (pathParam) {
      parsed.searchParams.delete('path');
      const qs = parsed.searchParams.toString();
      req.url = `/api/${pathParam}${qs ? `?${qs}` : ''}`;
      return;
    }
  } catch (_) {
    /* fall through */
  }

  const headers = [
    req.headers?.['x-vercel-original-url'],
    req.headers?.['x-original-url'],
    req.headers?.['x-forwarded-uri'],
    req.headers?.['x-invoke-path'],
    req.headers?.['x-matched-path'],
  ];

  for (const raw of headers) {
    if (!raw || typeof raw !== 'string') continue;
    try {
      const pathname = raw.startsWith('http')
        ? new URL(raw).pathname + new URL(raw).search
        : raw;
      if (pathname.startsWith('/api/') && !pathname.startsWith('/api/express')) {
        req.url = pathname;
        return;
      }
    } catch (_) {
      /* try next header */
    }
  }
}

function vercelPathFix(req, res, next) {
  restoreVercelPath(req);
  next();
}

function vercelPathGuard(req, res, next) {
  if (process.env.VERCEL && req.url?.startsWith('/api/express')) {
    return res.status(404).json({ error: 'PATH_NOT_RESTORED', url: req.url });
  }
  next();
}

module.exports = vercelPathFix;
module.exports.restoreVercelPath = restoreVercelPath;
module.exports.vercelPathGuard = vercelPathGuard;
