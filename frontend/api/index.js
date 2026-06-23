const serverless = require('serverless-http');
const app = require('../../backend/src/app');

module.exports = serverless(app, {
  binary: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/octet-stream',
  ],
});
