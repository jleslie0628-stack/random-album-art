import { serve } from 'serve-static'; // You may need: npm install serve-static
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const staticServe = serve(path.join(__dirname, 'dist/client'));

const server = http.createServer((req, res) => {
  // Try to serve static files first
  staticServe(req, res, () => {
    // If not found, import the SSR handler
    import('./dist/server/server.js').then((app) => {
      // Assuming your server.js exports a standard Node request handler
      app.default(req, res);
    }).catch(err => {
      res.statusCode = 500;
      res.end('Server error');
    });
  });
});

server.listen(process.env.PORT || 3000);
