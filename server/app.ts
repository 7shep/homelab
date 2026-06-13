import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { Repo } from './db/repo';
import { componentInput, projectInput } from './validation';

export function createApp(repo: Repo) {
  const api = new Hono();

  const onValidationError = (result: { success: boolean; error?: unknown }, c: any) => {
    if (!result.success) {
      const zerr = result.error as { issues: { message: string }[] };
      return c.json({ error: { message: zerr.issues[0]?.message ?? 'Invalid input' } }, 400);
    }
  };

  api.get('/projects', async (c) => c.json(await repo.listProjects()));

  api.post('/projects', zValidator('json', projectInput, onValidationError), async (c) => {
    const input = c.req.valid('json');
    try {
      return c.json(await repo.createProject(input), 201);
    } catch (err) {
      if ((err as { code?: string }).code === 'SLUG_CONFLICT') {
        return c.json({ error: { message: (err as Error).message } }, 409);
      }
      throw err;
    }
  });

  api.get('/projects/:id', async (c) => {
    const project = await repo.getProject(c.req.param('id'));
    if (!project) return c.json({ error: { message: 'Project not found' } }, 404);
    return c.json(project);
  });

  api.patch('/projects/:id', zValidator('json', projectInput, onValidationError), async (c) => {
    try {
      const updated = await repo.updateProject(c.req.param('id'), c.req.valid('json'));
      if (!updated) return c.json({ error: { message: 'Project not found' } }, 404);
      return c.json(updated);
    } catch (err) {
      if ((err as { code?: string }).code === 'SLUG_CONFLICT') {
        return c.json({ error: { message: (err as Error).message } }, 409);
      }
      throw err;
    }
  });

  api.delete('/projects/:id', async (c) => {
    const ok = await repo.deleteProject(c.req.param('id'));
    if (!ok) return c.json({ error: { message: 'Project not found' } }, 404);
    return c.body(null, 204);
  });

  api.post(
    '/projects/:id/components',
    zValidator('json', componentInput, onValidationError),
    async (c) => {
      const created = await repo.createComponent(c.req.param('id'), c.req.valid('json'));
      if (!created) return c.json({ error: { message: 'Project not found' } }, 404);
      return c.json(created, 201);
    }
  );

  api.patch(
    '/components/:id',
    zValidator('json', componentInput, onValidationError),
    async (c) => {
      const updated = await repo.updateComponent(c.req.param('id'), c.req.valid('json'));
      if (!updated) return c.json({ error: { message: 'Component not found' } }, 404);
      return c.json(updated);
    }
  );

  api.delete('/components/:id', async (c) => {
    const ok = await repo.deleteComponent(c.req.param('id'));
    if (!ok) return c.json({ error: { message: 'Component not found' } }, 404);
    return c.body(null, 204);
  });

  const app = new Hono();
  app.route('/api', api);
  return app;
}
