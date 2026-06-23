const serverless = require('serverless-http');

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
    });
  }
  return handler;
}

module.exports = (req, res) => getHandler()(req, res);
