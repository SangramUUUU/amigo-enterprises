const serverless = require('serverless-http');

let handler;

function fixVercelPath(req) {
  if (!process.env.VERCEL) return;

  const url = req.url || '/';

  if (url.startsWith('/api/') && !url.startsWith('/api/express')) {
    return;
  }

  try {
    const parsed = new URL(url, 'http://localhost');
    const pathParam = parsed.searchParams.get('path');
    if (pathParam) {
      parsed.searchParams.delete('path');
      const qs = parsed.searchParams.toString();
      req.url = `/api/${pathParam}${qs ? `?${qs}` : ''}`;
      return;
    }
  } catch (_) {
    /* continue */
  }

  const candidates = [
    req.headers['x-vercel-original-url'],
    req.headers['x-original-url'],
    req.headers['x-forwarded-uri'],
    req.headers['x-invoke-path'],
    req.headers['x-matched-path'],
  ];

  for (const raw of candidates) {
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
      /* try next */
    }
  }
}

function getHandler() {
  if (!handler) {
    const app = require('../../backend/src/app');
    handler = serverless(app, {
      binary: [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/octet-stream',
      ],
    });
  }
  return handler;
}

module.exports = (req, res) => {
  fixVercelPath(req);
  return getHandler()(req, res);
};
