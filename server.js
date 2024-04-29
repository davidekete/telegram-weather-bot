const http = require('http');
require('./src/bot');
const port = 3000;

http
  .createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('My Telegram bot is running\n');
  })
  .listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
