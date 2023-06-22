import http from 'http';
import fs from 'fs';

const port = process.env.PORT || 3000;  // Use the port that Heroku provides or fall back to 3000

export const startServer = () => {
  const server = http.createServer(function (req, res) {
    fs.readFile('index.html', function (err, data) {
      if (err) {
        res.writeHead(404);
        res.end(JSON.stringify(err));
        return;
      }
      res.writeHead(200);
      res.end(data);
    });
  });

  server.on('listening', function () {
    console.log(`ok, server is running at http://127.0.0.1:${port}`);
  });

  server.on('request', function (req, res) {
    fs.readFile('index.html', function (err, data) {
      if (err) {
        res.writeHead(404);
        res.end(JSON.stringify(err));
        return;
      }
      res.writeHead(200);
      res.end(data);
    });
  });

  server.listen(port);
}

