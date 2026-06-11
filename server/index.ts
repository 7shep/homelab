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
serve({ fetch: app.fetch, port });
console.log(`homelab api listening on :${port}`);
