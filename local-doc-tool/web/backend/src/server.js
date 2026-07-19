import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.map': 'application/json; charset=utf-8',
};

function sendJson(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  res.end(body);
}

/**
 * Resolve a request pathname to an absolute file path inside staticDir.
 * Returns null if the resolved path escapes staticDir (traversal attempt).
 */
function resolveStatic(staticDir, pathname) {
  const root = path.resolve(staticDir);
  const rel = decodeURIComponent(pathname);
  const target = path.resolve(root, '.' + (rel === '/' ? '/index.html' : rel));
  if (target !== root && !target.startsWith(root + path.sep)) {
    return null;
  }
  return target;
}

/**
 * createServer({ staticDir, registry, deps }) -> unstarted http.Server.
 * The caller is responsible for calling .listen(). Serves static assets from
 * staticDir and exposes a placeholder GET /api/health. No retrieval/claude
 * logic — later stories add routes and wire in `registry`/`deps`.
 */
export function createServer({ staticDir, registry, deps } = {}) {
  const handler = (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const { pathname } = url;

    if (req.method === 'GET' && pathname === '/api/health') {
      return sendJson(res, 200, { ok: true });
    }

    if (req.method === 'GET' || req.method === 'HEAD') {
      const filePath = resolveStatic(staticDir, pathname);
      if (filePath === null) {
        res.writeHead(403, { 'content-type': 'text/plain; charset=utf-8' });
        return res.end('Forbidden');
      }
      let stat;
      try {
        stat = fs.statSync(filePath);
      } catch {
        res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
        return res.end('Not Found');
      }
      if (stat.isDirectory()) {
        res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
        return res.end('Not Found');
      }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'content-type': MIME[ext] ?? 'application/octet-stream' });
      if (req.method === 'HEAD') return res.end();
      return fs.createReadStream(filePath).pipe(res);
    }

    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Not Found');
  };

  return http.createServer(handler);
}
