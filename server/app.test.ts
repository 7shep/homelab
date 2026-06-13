// @vitest-environment node
import { beforeEach, describe, expect, it } from 'vitest';
import { makeTestDb } from './db/testDb';
import { makeRepo } from './db/repo';
import { createApp } from './app';

let app: ReturnType<typeof createApp>;

beforeEach(async () => {
  const { db } = await makeTestDb();
  app = createApp(makeRepo(db));
});

async function post(path: string, body: unknown) {
  return app.request(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });
}

const json = <T = any>(res: Response): Promise<T> => res.json() as Promise<T>;

describe('projects API', () => {
  it('creates, lists, and fetches a project', async () => {
    const created = await post('/api/projects', { name: 'Media Stack' });
    expect(created.status).toBe(201);
    const project = await json(created);
    expect(project.slug).toBe('media-stack');

    const list = await app.request('/api/projects');
    expect(await json(list)).toHaveLength(1);

    const detail = await app.request(`/api/projects/${project.id}`);
    expect(detail.status).toBe(200);
    expect((await json(detail)).components).toEqual([]);
  });

  it('returns 400 on invalid input', async () => {
    const res = await post('/api/projects', { name: '' });
    expect(res.status).toBe(400);
  });

  it('returns 409 on duplicate slug', async () => {
    await post('/api/projects', { name: 'Media Stack' });
    const res = await post('/api/projects', { name: 'media stack' });
    expect(res.status).toBe(409);
  });

  it('returns 404 for an unknown project', async () => {
    const res = await app.request('/api/projects/00000000-0000-0000-0000-000000000000');
    expect(res.status).toBe(404);
  });

  it('adds a component and reflects derived status', async () => {
    const project = await json(await post('/api/projects', { name: 'P' }));
    const comp = await post(`/api/projects/${project.id}/components`, {
      name: 'db', kind: 'service', status: 'critical'
    });
    expect(comp.status).toBe(201);

    const detail = await json(await app.request(`/api/projects/${project.id}`));
    expect(detail.status).toBe('critical');
    expect(detail.components).toHaveLength(1);
  });
});
