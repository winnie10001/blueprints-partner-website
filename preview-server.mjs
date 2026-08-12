import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';

const root = resolve(import.meta.dirname);
const port = Number(process.env.PORT || 4173);
const submissions = new Map();
const types = { '.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.mp4':'video/mp4','.ttf':'font/ttf' };

const server = createServer(async (request, response) => {
  if (request.url === '/api/enquiry' && request.method === 'POST') {
    let body = '';
    for await (const chunk of request) body += chunk;
    const payload = JSON.parse(body || '{}');
    const email = String(payload.email || '').trim().toLowerCase();
    if (!email || !payload.name || !payload.service || !payload.building || !payload.timeline) {
      response.writeHead(400, { 'Content-Type':'application/json' });
      return response.end(JSON.stringify({ message:'Please complete the required fields.' }));
    }
    if (payload.companySite) {
      response.writeHead(400, { 'Content-Type':'application/json' });
      return response.end(JSON.stringify({ message:'Unable to accept this enquiry.' }));
    }
    if (submissions.has(email)) {
      response.writeHead(409, { 'Content-Type':'application/json' });
      return response.end(JSON.stringify({ message:'We already received an enquiry from this email recently. Email us if you need to add information.' }));
    }
    submissions.set(email, Date.now());
    response.writeHead(201, { 'Content-Type':'application/json' });
    return response.end(JSON.stringify({ message:'Thank you. We will contact you within 1–3 business days.' }));
  }

  const pathname = decodeURIComponent((request.url || '/').split('?')[0]);
  const target = resolve(root, pathname === '/' ? 'index.html' : `.${pathname}`);
  if (!target.startsWith(`${root}${sep}`) && target !== resolve(root, 'index.html')) {
    response.writeHead(403); return response.end('Forbidden');
  }
  try {
    const info = await stat(target);
    const file = info.isDirectory() ? resolve(target, 'index.html') : target;
    const data = await readFile(file);
    response.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
    response.end(data);
  } catch {
    response.writeHead(404); response.end('Not found');
  }
});

server.listen(port, '127.0.0.1', () => console.log(`Blueprints Partner preview: http://localhost:${port}`));
