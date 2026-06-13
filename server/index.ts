import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { db } from './db/client';
import { makeRepo } from './db/repo';
import { createApp } from './app';

const app = createApp(makeRepo(db));

// In production, serve the built frontend from dist/.
app.use('/*', serveStatic({ root: './dist' }));
app.get('/*', serveStatic({ path: './dist/index.html' }));

const port = Number(process.env.PORT ?? 8787);
// Bind to loopback by default so the API (which has no auth yet) is not exposed
// on the LAN. Override with HOST=0.0.0.0 only behind a trusted reverse proxy.
const hostname = process.env.HOST ?? '127.0.0.1';
serve({ fetch: app.fetch, port, hostname });
console.log(`homelab api listening on http://${hostname}:${port}`);
