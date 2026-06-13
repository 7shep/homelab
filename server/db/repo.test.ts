// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { makeTestDb } from './testDb';
import { makeRepo, type Repo } from './repo';

let repo: Repo;
let close: () => Promise<void>;

beforeEach(async () => {
  const { db, client } = await makeTestDb();
  repo = makeRepo(db);
  close = () => client.close();
});

afterEach(async () => {
  await close();
});

describe('project repo', () => {
  it('creates and lists a project with derived status', async () => {
    const created = await repo.createProject({ name: 'Media Stack', description: null });
    expect(created.slug).toBe('media-stack');

    const list = await repo.listProjects();
    expect(list).toHaveLength(1);
    expect(list[0].status).toBe('healthy');
    expect(list[0].componentCount).toBe(0);
  });

  it('rejects a duplicate slug', async () => {
    await repo.createProject({ name: 'Media Stack', description: null });
    await expect(
      repo.createProject({ name: 'media stack', description: null })
    ).rejects.toThrow(/slug/i);
  });

  it('derives project status from worst component', async () => {
    const p = await repo.createProject({ name: 'P', description: null });
    await repo.createComponent(p.id, {
      name: 'web', kind: 'app', status: 'healthy', target: null, notes: null
    });
    await repo.createComponent(p.id, {
      name: 'db', kind: 'service', status: 'critical', target: null, notes: null
    });
    const detail = await repo.getProject(p.id);
    expect(detail?.status).toBe('critical');
    expect(detail?.components).toHaveLength(2);
  });

  it('updates and deletes a project (cascading components)', async () => {
    const p = await repo.createProject({ name: 'P', description: null });
    await repo.createComponent(p.id, {
      name: 'web', kind: 'app', status: 'healthy', target: null, notes: null
    });
    await repo.updateProject(p.id, { name: 'Renamed', description: 'x' });
    const renamed = await repo.getProject(p.id);
    expect(renamed?.name).toBe('Renamed');

    await repo.deleteProject(p.id);
    expect(await repo.getProject(p.id)).toBeNull();
  });
});
