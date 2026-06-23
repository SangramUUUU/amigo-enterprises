const serverless = require('serverless-http');
const { restoreVercelPath } = require('../../backend/src/middleware/vercelPathFix');

let handler;

function getHandler() {
  if (!handler) {
    const app = require('../../backend/src/app');
    handler = serverless(app, {
      binary: [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/octet-stream',
      ],
      request(request, event) {
        restoreVercelPath(request);
        if (event?.url) {
          try {
            const parsed = new URL(event.url, 'http://localhost');
            if (
              parsed.pathname.startsWith('/api/')
              && !parsed.pathname.startsWith('/api/express')
            ) {
              request.url = parsed.pathname + parsed.search;
            }
          } catch (_) {
            /* ignore */
          }
        }
      },
    });
  }
  return handler;
}

module.exports = (req, res) => getHandler()(req, res);
