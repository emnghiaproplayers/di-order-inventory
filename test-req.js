const http = require('http');

const testRequest = (qty) => {
  const data = JSON.stringify({ productId: 'prod-1', qty });
  const req = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/orders',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
    }
  }, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => console.log(`QTY: ${qty}, Status: ${res.statusCode}, Body: ${body}`));
  });
  req.write(data);
  req.end();
};

testRequest(10);
testRequest(-5);
