# Project Registry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a project registry where users create, edit, list, and inspect projects that contain typed components (app/service/worker/cron/server/domain), backed by a real Postgres API, with a project detail page that becomes the hub for future features.

**Architecture:** A Node/Hono REST API persists projects and components in Postgres via Drizzle ORM (tests run against pglite). The existing Vite + React Native Web frontend is refactored into a `react-router-dom` shell; new screens (list, detail, form) talk to the API through a thin typed fetch client and custom hooks. Project status is derived server-side from component statuses.

**Tech Stack:** TypeScript, React 19, React Native Web, react-router-dom, Vite, Hono, Drizzle ORM, Postgres 16 (pglite for tests), Zod, Vitest.

**Reference spec:** `docs/superpowers/specs/2026-06-11-project-registry-design.md`

---

## Conventions

- All commands run from the repo root (the worktree root).
- `npm test -- --run` runs the full Vitest suite once (no watch).
- Commit after every task. Use the message shown in the task's commit step.
- IDs are generated with `crypto.randomUUID()` in app code, never DB defaults.

---

## Task 1: Install dependencies and scaffold config

**Files:**
- Modify: `package.json` (dependencies, scripts)
- Create: `.env.example`
- Create: `tsconfig.server.json`
- Modify: `.gitignore`

- [ ] **Step 1: Install runtime dependencies**

Run:
```bash
npm install hono @hono/node-server @hono/zod-validator zod drizzle-orm pg react-router-dom
```
Expected: packages added, no errors.

- [ ] **Step 2: Install dev dependencies**

Run:
```bash
npm install -D drizzle-kit @electric-sql/pglite tsx @types/pg
```
Expected: packages added, no errors.

- [ ] **Step 3: Add npm scripts**

In `package.json`, replace the `"scripts"` block with:
```json
  "scripts": {
    "dev": "vite",
    "dev:api": "tsx watch server/index.ts",
    "build": "tsc --noEmit && tsc --noEmit -p tsconfig.server.json && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "db:up": "docker compose up -d db",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "tsx server/db/migrate.ts"
  },
```

- [ ] **Step 4: Create `tsconfig.server.json`**

The root `tsconfig.json` only includes `src` and restricts `types` to
`vitest/globals`, so the backend (which uses Node globals and lives outside
`src`) needs its own type-check config.
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "types": ["node"]
  },
  "include": ["server", "shared", "drizzle.config.ts"]
}
```

- [ ] **Step 5: Create `.env.example`**

```
# Postgres connection string used by the API and drizzle-kit
DATABASE_URL=postgres://homelab:homelab@localhost:5432/homelab
# Port the Hono API listens on
PORT=8787
```

- [ ] **Step 6: Append to `.gitignore`**

Add these lines to `.gitignore` (if not already present):
```
.env
```

- [ ] **Step 7: Verify install**

Run: `npm test -- --run`
Expected: existing 3 tests still PASS.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json .env.example tsconfig.server.json .gitignore
git commit -m "chore: add backend and router dependencies (issue #2)"
```

---

## Task 2: Shared domain types

**Files:**
- Create: `shared/types.ts`

- [ ] **Step 1: Write the shared types**

Create `shared/types.ts`:
```ts
export type HealthState = 'healthy' | 'warning' | 'critical';

export const COMPONENT_KINDS = [
  'app',
  'service',
  'worker',
  'cron',
  'server',
  'domain'
] as const;

export type ComponentKind = (typeof COMPONENT_KINDS)[number];

export type Component = {
  id: string;
  projectId: string;
  name: string;
  kind: ComponentKind;
  status: HealthState;
  target: string | null;
  notes: string | null;
  config: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

/** A project as returned in list responses (no components, derived status). */
export type ProjectSummary = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: HealthState;
  componentCount: number;
  createdAt: string;
  updatedAt: string;
};

/** A project as returned in the detail response (with components). */
export type ProjectDetail = ProjectSummary & {
  components: Component[];
};

/** Worst-of reducer for deriving project status from component statuses. */
export function deriveStatus(statuses: HealthState[]): HealthState {
  if (statuses.includes('critical')) return 'critical';
  if (statuses.includes('warning')) return 'warning';
  return 'healthy';
}
```

- [ ] **Step 2: Write a test for `deriveStatus`**

Create `shared/types.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { deriveStatus } from './types';

describe('deriveStatus', () => {
  it('returns healthy for no statuses', () => {
    expect(deriveStatus([])).toBe('healthy');
  });
  it('returns healthy when all healthy', () => {
    expect(deriveStatus(['healthy', 'healthy'])).toBe('healthy');
  });
  it('returns warning when worst is warning', () => {
    expect(deriveStatus(['healthy', 'warning'])).toBe('warning');
  });
  it('returns critical when any critical', () => {
    expect(deriveStatus(['healthy', 'warning', 'critical'])).toBe('critical');
  });
});
```

- [ ] **Step 3: Run the test**

Run: `npm test -- --run shared/types.test.ts`
Expected: 4 tests PASS.

- [ ] **Step 4: Commit**

```bash
git add shared/types.ts shared/types.test.ts
git commit -m "feat: add shared domain types for registry"
```

---

## Task 3: Docker Compose + Drizzle schema

**Files:**
- Create: `docker-compose.yml`
- Create: `drizzle.config.ts`
- Create: `server/db/schema.ts`

- [ ] **Step 1: Create `docker-compose.yml`**

```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: homelab
      POSTGRES_PASSWORD: homelab
      POSTGRES_DB: homelab
    ports:
      - '5432:5432'
    volumes:
      - homelab-db:/var/lib/postgresql/data

volumes:
  homelab-db:
```

- [ ] **Step 2: Create `server/db/schema.ts`**

```ts
import {
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid
} from 'drizzle-orm/pg-core';
import { COMPONENT_KINDS } from '../../shared/types';

export const healthEnum = pgEnum('health_state', [
  'healthy',
  'warning',
  'critical'
]);
export const kindEnum = pgEnum('component_kind', COMPONENT_KINDS);

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const components = pgTable('components', {
  id: uuid('id').primaryKey(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  kind: kindEnum('kind').notNull(),
  status: healthEnum('status').notNull().default('healthy'),
  target: text('target'),
  notes: text('notes'),
  config: jsonb('config').notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});
```

- [ ] **Step 3: Create `drizzle.config.ts`**

```ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './server/db/schema.ts',
  out: './server/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'postgres://homelab:homelab@localhost:5432/homelab'
  }
});
```

- [ ] **Step 4: Generate the migration**

Run: `npm run db:generate`
Expected: a SQL migration file appears in `server/db/migrations/`.

- [ ] **Step 5: Verify the migration SQL**

Read the generated file in `server/db/migrations/`. Confirm it creates the
`health_state` and `component_kind` enums and the `projects` and `components`
tables with the `project_id` foreign key and `ON DELETE CASCADE`.

- [ ] **Step 6: Commit**

```bash
git add docker-compose.yml drizzle.config.ts server/db/schema.ts server/db/migrations
git commit -m "feat: add docker compose, drizzle schema, and initial migration"
```

---

## Task 4: Database client and migrate script

**Files:**
- Create: `server/db/client.ts`
- Create: `server/db/migrate.ts`

- [ ] **Step 1: Create `server/db/client.ts`**

```ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const connectionString =
  process.env.DATABASE_URL ?? 'postgres://homelab:homelab@localhost:5432/homelab';

export const pool = new Pool({ connectionString });
export const db = drizzle(pool, { schema });
export type Db = typeof db;
```

- [ ] **Step 2: Create `server/db/migrate.ts`**

```ts
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db, pool } from './client';

async function main() {
  await migrate(db, { migrationsFolder: './server/db/migrations' });
  await pool.end();
  console.log('migrations applied');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 3: Type-check the server**

Run: `npx tsc --noEmit -p tsconfig.server.json`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add server/db/client.ts server/db/migrate.ts
git commit -m "feat: add database client and migrate script"
```

---

## Task 5: Repository layer (data access) with pglite tests

**Files:**
- Create: `server/db/repo.ts`
- Create: `server/db/testDb.ts`
- Test: `server/db/repo.test.ts`

This task isolates all SQL/ORM access behind a repository so routes stay thin
and tests can run against an in-memory pglite database.

- [ ] **Step 1: Create the test database helper `server/db/testDb.ts`**

```ts
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import * as schema from './schema';

/** Create a fresh, migrated in-memory database for a test. */
export async function makeTestDb() {
  const client = new PGlite();
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder: './server/db/migrations' });
  return { db, client };
}
```

- [ ] **Step 2: Write failing repository tests `server/db/repo.test.ts`**

The `// @vitest-environment node` docblock on the first line makes this file run
in Node (not jsdom) so pglite's WASM/Node code path works.
```ts
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
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm test -- --run server/db/repo.test.ts`
Expected: FAIL — `makeRepo` is not defined.

- [ ] **Step 4: Implement `server/db/repo.ts`**

```ts
import { eq, sql } from 'drizzle-orm';
import type { PgDatabase } from 'drizzle-orm/pg-core';
import type {
  Component,
  ComponentKind,
  HealthState,
  ProjectDetail,
  ProjectSummary
} from '../../shared/types';
import { deriveStatus } from '../../shared/types';
import { components, projects } from './schema';

export type AnyDb = PgDatabase<any, any, any>;

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

type CreateProjectInput = { name: string; description: string | null };
type UpdateProjectInput = { name: string; description: string | null };
type ComponentInput = {
  name: string;
  kind: ComponentKind;
  status: HealthState;
  target: string | null;
  notes: string | null;
};

function rowToComponent(row: typeof components.$inferSelect): Component {
  return {
    id: row.id,
    projectId: row.projectId,
    name: row.name,
    kind: row.kind,
    status: row.status,
    target: row.target,
    notes: row.notes,
    config: (row.config ?? {}) as Record<string, unknown>,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  };
}

export function makeRepo(db: AnyDb) {
  async function ensureSlugFree(slug: string): Promise<void> {
    const existing = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.slug, slug));
    if (existing.length > 0) {
      const err = new Error(`A project with slug "${slug}" already exists`);
      (err as Error & { code?: string }).code = 'SLUG_CONFLICT';
      throw err;
    }
  }

  return {
    async listProjects(): Promise<ProjectSummary[]> {
      const rows = await db.select().from(projects);
      const result: ProjectSummary[] = [];
      for (const p of rows) {
        const comps = await db
          .select({ status: components.status })
          .from(components)
          .where(eq(components.projectId, p.id));
        result.push({
          id: p.id,
          name: p.name,
          slug: p.slug,
          description: p.description,
          status: deriveStatus(comps.map((c) => c.status as HealthState)),
          componentCount: comps.length,
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString()
        });
      }
      return result;
    },

    async getProject(id: string): Promise<ProjectDetail | null> {
      const [p] = await db.select().from(projects).where(eq(projects.id, id));
      if (!p) return null;
      const compRows = await db
        .select()
        .from(components)
        .where(eq(components.projectId, id));
      const comps = compRows.map(rowToComponent);
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        status: deriveStatus(comps.map((c) => c.status)),
        componentCount: comps.length,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
        components: comps
      };
    },

    async createProject(input: CreateProjectInput): Promise<ProjectSummary> {
      const slug = slugify(input.name);
      if (!slug) throw new Error('Project name must contain a letter or number');
      await ensureSlugFree(slug);
      const id = crypto.randomUUID();
      const [row] = await db
        .insert(projects)
        .values({ id, name: input.name, slug, description: input.description })
        .returning();
      return {
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description,
        status: 'healthy',
        componentCount: 0,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString()
      };
    },

    async updateProject(id: string, input: UpdateProjectInput): Promise<ProjectDetail | null> {
      const [existing] = await db.select().from(projects).where(eq(projects.id, id));
      if (!existing) return null;
      const slug = slugify(input.name);
      if (!slug) throw new Error('Project name must contain a letter or number');
      if (slug !== existing.slug) await ensureSlugFree(slug);
      await db
        .update(projects)
        .set({ name: input.name, slug, description: input.description, updatedAt: new Date() })
        .where(eq(projects.id, id));
      return this.getProject(id);
    },

    async deleteProject(id: string): Promise<boolean> {
      const [existing] = await db.select().from(projects).where(eq(projects.id, id));
      if (!existing) return false;
      await db.delete(projects).where(eq(projects.id, id));
      return true;
    },

    async createComponent(projectId: string, input: ComponentInput): Promise<Component | null> {
      const [p] = await db.select().from(projects).where(eq(projects.id, projectId));
      if (!p) return null;
      const id = crypto.randomUUID();
      const [row] = await db
        .insert(components)
        .values({ id, projectId, ...input, config: {} })
        .returning();
      return rowToComponent(row);
    },

    async updateComponent(id: string, input: ComponentInput): Promise<Component | null> {
      const [existing] = await db.select().from(components).where(eq(components.id, id));
      if (!existing) return null;
      const [row] = await db
        .update(components)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(components.id, id))
        .returning();
      return rowToComponent(row);
    },

    async deleteComponent(id: string): Promise<boolean> {
      const [existing] = await db.select().from(components).where(eq(components.id, id));
      if (!existing) return false;
      await db.delete(components).where(eq(components.id, id));
      return true;
    }
  };
}

export type Repo = ReturnType<typeof makeRepo>;
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test -- --run server/db/repo.test.ts`
Expected: all 4 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add server/db/repo.ts server/db/testDb.ts server/db/repo.test.ts
git commit -m "feat: add registry repository layer with pglite tests"
```

---

## Task 6: API routes and Hono app

**Files:**
- Create: `server/validation.ts`
- Create: `server/app.ts`
- Create: `server/index.ts`
- Test: `server/app.test.ts`

- [ ] **Step 1: Create `server/validation.ts`**

```ts
import { z } from 'zod';
import { COMPONENT_KINDS } from '../shared/types';

export const projectInput = z.object({
  name: z.string().min(1, 'Name is required').max(120),
  description: z.string().max(2000).nullish().transform((v) => v ?? null)
});

export const componentInput = z.object({
  name: z.string().min(1, 'Name is required').max(120),
  kind: z.enum(COMPONENT_KINDS),
  status: z.enum(['healthy', 'warning', 'critical']).default('healthy'),
  target: z.string().max(500).nullish().transform((v) => v ?? null),
  notes: z.string().max(2000).nullish().transform((v) => v ?? null)
});
```

- [ ] **Step 2: Create the Hono app factory `server/app.ts`**

```ts
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
```

- [ ] **Step 3: Write failing app tests `server/app.test.ts`**

```ts
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

describe('projects API', () => {
  it('creates, lists, and fetches a project', async () => {
    const created = await post('/api/projects', { name: 'Media Stack' });
    expect(created.status).toBe(201);
    const project = await created.json();
    expect(project.slug).toBe('media-stack');

    const list = await app.request('/api/projects');
    expect((await list.json())).toHaveLength(1);

    const detail = await app.request(`/api/projects/${project.id}`);
    expect(detail.status).toBe(200);
    expect((await detail.json()).components).toEqual([]);
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
    const project = await (await post('/api/projects', { name: 'P' })).json();
    const comp = await post(`/api/projects/${project.id}/components`, {
      name: 'db', kind: 'service', status: 'critical'
    });
    expect(comp.status).toBe(201);

    const detail = await (await app.request(`/api/projects/${project.id}`)).json();
    expect(detail.status).toBe('critical');
    expect(detail.components).toHaveLength(1);
  });
});
```

- [ ] **Step 4: Run tests to verify they fail**

Run: `npm test -- --run server/app.test.ts`
Expected: FAIL — `createApp` not defined (until Step 2 saved) / module resolution.

- [ ] **Step 5: Create the server entry `server/index.ts`**

```ts
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
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm test -- --run server/app.test.ts`
Expected: all 5 tests PASS.

- [ ] **Step 7: Type-check the server**

Run: `npx tsc --noEmit -p tsconfig.server.json`
Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add server/validation.ts server/app.ts server/index.ts server/app.test.ts
git commit -m "feat: add registry REST API with Hono and validation"
```

---

## Task 7: Vite dev proxy

**Files:**
- Modify: `vite.config.ts`

- [ ] **Step 1: Read the current `vite.config.ts`**

Run: open `vite.config.ts` and note its current contents.

- [ ] **Step 2: Add a server proxy**

Ensure the config's `defineConfig` object includes a `server.proxy` entry that
forwards `/api` to the Hono server. The resulting config must include:
```ts
  server: {
    proxy: {
      '/api': 'http://localhost:8787'
    }
  }
```
Merge this into the existing exported config object without removing the
existing `plugins` or other settings.

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add vite.config.ts
git commit -m "chore: proxy /api to the hono server in dev"
```

---

## Task 8: Frontend API client and hooks

**Files:**
- Create: `src/api/client.ts`
- Create: `src/api/hooks.ts`
- Test: `src/api/client.test.ts`

- [ ] **Step 1: Write the failing client test `src/api/client.test.ts`**

```ts
import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from './client';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('api client', () => {
  it('returns parsed JSON on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify([{ id: '1' }]), {
          status: 200,
          headers: { 'content-type': 'application/json' }
        })
      )
    );
    const result = await api.listProjects();
    expect(result).toEqual([{ id: '1' }]);
  });

  it('throws the API error message on failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: { message: 'nope' } }), {
          status: 409,
          headers: { 'content-type': 'application/json' }
        })
      )
    );
    await expect(api.createProject({ name: 'x', description: null })).rejects.toThrow('nope');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- --run src/api/client.test.ts`
Expected: FAIL — cannot resolve `./client`.

- [ ] **Step 3: Implement `src/api/client.ts`**

```ts
import type {
  Component,
  ComponentKind,
  HealthState,
  ProjectDetail,
  ProjectSummary
} from '../../shared/types';

export type ProjectInput = { name: string; description: string | null };
export type ComponentInput = {
  name: string;
  kind: ComponentKind;
  status: HealthState;
  target: string | null;
  notes: string | null;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { 'content-type': 'application/json' },
    ...init
  });
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const message = body?.error?.message ?? `Request failed (${res.status})`;
    throw new Error(message);
  }
  return body as T;
}

export const api = {
  listProjects: () => request<ProjectSummary[]>('/projects'),
  getProject: (id: string) => request<ProjectDetail>(`/projects/${id}`),
  createProject: (input: ProjectInput) =>
    request<ProjectSummary>('/projects', { method: 'POST', body: JSON.stringify(input) }),
  updateProject: (id: string, input: ProjectInput) =>
    request<ProjectDetail>(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
  deleteProject: (id: string) =>
    request<void>(`/projects/${id}`, { method: 'DELETE' }),
  createComponent: (projectId: string, input: ComponentInput) =>
    request<Component>(`/projects/${projectId}/components`, {
      method: 'POST',
      body: JSON.stringify(input)
    }),
  updateComponent: (id: string, input: ComponentInput) =>
    request<Component>(`/components/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
  deleteComponent: (id: string) =>
    request<void>(`/components/${id}`, { method: 'DELETE' })
};
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- --run src/api/client.test.ts`
Expected: 2 tests PASS.

- [ ] **Step 5: Implement data hooks `src/api/hooks.ts`**

```ts
import { useCallback, useEffect, useState } from 'react';
import type { ProjectDetail, ProjectSummary } from '../../shared/types';
import { api } from './client';

type AsyncState<T> = { data: T | null; loading: boolean; error: string | null };

export function useProjects() {
  const [state, setState] = useState<AsyncState<ProjectSummary[]>>({
    data: null,
    loading: true,
    error: null
  });

  const reload = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }));
    api
      .listProjects()
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((err) => setState({ data: null, loading: false, error: err.message }));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { ...state, reload };
}

export function useProject(id: string | undefined) {
  const [state, setState] = useState<AsyncState<ProjectDetail>>({
    data: null,
    loading: true,
    error: null
  });

  const reload = useCallback(() => {
    if (!id) return;
    setState((s) => ({ ...s, loading: true, error: null }));
    api
      .getProject(id)
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((err) => setState({ data: null, loading: false, error: err.message }));
  }, [id]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { ...state, reload };
}
```

- [ ] **Step 6: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/api/client.ts src/api/hooks.ts src/api/client.test.ts
git commit -m "feat: add frontend api client and data hooks"
```

---

## Task 9: Extract shared UI primitives and theme

**Files:**
- Create: `src/theme.ts`
- Create: `src/components/StatusPill.tsx`
- Modify: `src/App.tsx`

This extracts the `colors`, `statusStyles`, `StatusPill`, and `StatusDot` from
`App.tsx` so the new screens reuse them instead of duplicating styling.

- [ ] **Step 1: Create `src/theme.ts`**

Move the `colors` object and `monoStack`/`sansStack`/`brandStack` constants and
the `statusStyles` record out of `src/App.tsx` into `src/theme.ts` and export
them. Copy the exact values currently in `App.tsx` (lines defining `colors`,
`monoStack`, `statusStyles`). Add:
```ts
import type { HealthState } from '../shared/types';
```
and type `statusStyles` as
`Record<HealthState, { label: string; color: string; backgroundColor: string; borderColor: string }>`.

- [ ] **Step 2: Create `src/components/StatusPill.tsx`**

Move the `StatusPill` and `StatusDot` components out of `App.tsx` into this file.
Import `statusStyles` and `colors` from `../theme`, and `HealthState` from
`../../shared/types`. Export both components. Include the `statusPill`,
`statusText`, and `statusDot` style rules (copied from `App.tsx`'s StyleSheet)
in a local `StyleSheet.create` in this file.

- [ ] **Step 3: Update `src/App.tsx` to import the extracted pieces**

In `src/App.tsx`, remove the now-moved `colors`, `monoStack`, `statusStyles`,
`StatusPill`, and `StatusDot` definitions and instead import them:
```ts
import { colors, monoStack, sansStack, statusStyles } from './theme';
import { StatusDot, StatusPill } from './components/StatusPill';
```
Remove the corresponding `statusPill`, `statusText`, and `statusDot` keys from
`App.tsx`'s local `StyleSheet.create` (they now live in StatusPill.tsx).

- [ ] **Step 4: Run tests and type-check**

Run: `npm test -- --run && npx tsc --noEmit`
Expected: existing tests PASS, no type errors.

- [ ] **Step 5: Commit**

```bash
git add src/theme.ts src/components/StatusPill.tsx src/App.tsx
git commit -m "refactor: extract theme and status primitives from App"
```

---

## Task 10: Router shell + Dashboard/Sidebar extraction

**Files:**
- Create: `src/screens/Dashboard.tsx`
- Create: `src/components/Sidebar.tsx`
- Create: `src/screens/Placeholder.tsx`
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`

- [ ] **Step 1: Move the dashboard body into `src/screens/Dashboard.tsx`**

Create `src/screens/Dashboard.tsx` exporting a `Dashboard` component containing
the current dashboard JSX from `App.tsx` (the `<ScrollView>` block: command bar,
metrics grid, primary grid, recent timeline). Import `metrics`, `projects`,
`alerts`, `timelineEvents` from `../appData`; `colors`, `statusStyles`,
`monoStack`, `sansStack` from `../theme`; `StatusDot`, `StatusPill` from
`../components/StatusPill`; and the `MetricCard`/`Section`/`Trend` helpers (move
those helper components and their styles into this file). Keep the `<Text>` SR
heading.

- [ ] **Step 2: Move the sidebar into `src/components/Sidebar.tsx`**

Create `src/components/Sidebar.tsx` exporting `Sidebar`. Move the current
`Sidebar` function and its related styles. Replace each nav item with a
react-router `Link` (from `react-router-dom`) whose active state is computed
from `useLocation()`. Map nav labels to routes:
```ts
const NAV: { label: string; to: string }[] = [
  { label: 'Dashboard', to: '/' },
  { label: 'Projects', to: '/projects' },
  { label: 'Timeline', to: '/timeline' },
  { label: 'Alerts', to: '/alerts' },
  { label: 'Servers', to: '/servers' },
  { label: 'Config', to: '/config' },
  { label: 'Settings', to: '/settings' }
];
```
An item is active when `location.pathname === to` (or, for `/projects`, when the
path starts with `/projects`). Style `Link` with `style={{ textDecoration: 'none' }}`
wrapping the existing nav row View.

- [ ] **Step 3: Create `src/screens/Placeholder.tsx`**

```tsx
import { StyleSheet, Text, View } from 'react-native';
import { colors, sansStack } from '../theme';

export function Placeholder({ title }: { title: string }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>This area is coming soon.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 30, gap: 8 },
  title: { color: colors.text, fontFamily: sansStack, fontSize: 24, fontWeight: '800' },
  body: { color: colors.muted, fontFamily: sansStack, fontSize: 14 }
});
```

- [ ] **Step 4: Rewrite `src/App.tsx` as the router shell**

```tsx
import { StyleSheet, View } from 'react-native';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './screens/Dashboard';
import { Placeholder } from './screens/Placeholder';
import { ProjectsList } from './screens/ProjectsList';
import { ProjectDetail } from './screens/ProjectDetail';
import { ProjectForm } from './screens/ProjectForm';
import { colors } from './theme';

export default function App() {
  return (
    <BrowserRouter>
      <View style={styles.app}>
        <Sidebar />
        <View style={styles.content}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<ProjectsList />} />
            <Route path="/projects/new" element={<ProjectForm mode="create" />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/projects/:id/edit" element={<ProjectForm mode="edit" />} />
            <Route path="/timeline" element={<Placeholder title="Timeline" />} />
            <Route path="/alerts" element={<Placeholder title="Alerts" />} />
            <Route path="/servers" element={<Placeholder title="Servers" />} />
            <Route path="/config" element={<Placeholder title="Config" />} />
            <Route path="/settings" element={<Placeholder title="Settings" />} />
          </Routes>
        </View>
      </View>
    </BrowserRouter>
  );
}

const styles = StyleSheet.create({
  app: {
    backgroundColor: colors.app,
    flexDirection: 'row',
    flexWrap: 'wrap',
    minHeight: '100vh'
  },
  content: { flex: 1, minWidth: 360 }
});
```

NOTE: `ProjectsList`, `ProjectDetail`, and `ProjectForm` are created in Tasks
11–13. Until those exist, this file will not type-check — that is expected; the
import lines are added now and the screens land in the next tasks.

- [ ] **Step 5: Update `src/App.test.tsx`**

The current tests assert dashboard content renders. Update them to render the
dashboard route. Replace assertions that depend on `App` rendering the dashboard
directly so they still target dashboard text (e.g. "homelab", a project name).
Set the test to render `<App />` (which defaults to route `/`). Keep three
assertions: renders the brand, renders a known project name, renders a metric
label. If a test referenced removed structure, point it at equivalent visible
text in the Dashboard screen.

- [ ] **Step 6: Defer verification**

Type-check will fail until Tasks 11–13 add the screens. Do NOT run the full
type-check as a gate here. Instead verify just the moved pieces compile by
checking imports resolve for `Dashboard`, `Sidebar`, `Placeholder`.

Run: `npm test -- --run src/api server/ shared/`
Expected: previously-passing API/repo/shared tests still PASS.

- [ ] **Step 7: Commit**

```bash
git add src/App.tsx src/App.test.tsx src/screens/Dashboard.tsx src/components/Sidebar.tsx src/screens/Placeholder.tsx
git commit -m "refactor: introduce react-router shell and extract dashboard/sidebar"
```

---

## Task 11: Projects list screen

**Files:**
- Create: `src/screens/ProjectsList.tsx`
- Test: `src/screens/ProjectsList.test.tsx`

- [ ] **Step 1: Write the failing test `src/screens/ProjectsList.test.tsx`**

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ProjectsList } from './ProjectsList';
import { api } from '../api/client';

afterEach(() => vi.restoreAllMocks());

function renderList() {
  return render(
    <MemoryRouter>
      <ProjectsList />
    </MemoryRouter>
  );
}

describe('ProjectsList', () => {
  it('shows projects from the api', async () => {
    vi.spyOn(api, 'listProjects').mockResolvedValue([
      {
        id: '1', name: 'Media Stack', slug: 'media-stack', description: null,
        status: 'critical', componentCount: 3, createdAt: '', updatedAt: ''
      }
    ]);
    renderList();
    await waitFor(() => expect(screen.getByText('Media Stack')).toBeTruthy());
  });

  it('shows an empty state when there are no projects', async () => {
    vi.spyOn(api, 'listProjects').mockResolvedValue([]);
    renderList();
    await waitFor(() => expect(screen.getByText(/no projects yet/i)).toBeTruthy());
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- --run src/screens/ProjectsList.test.tsx`
Expected: FAIL — cannot resolve `./ProjectsList`.

- [ ] **Step 3: Implement `src/screens/ProjectsList.tsx`**

```tsx
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link, useNavigate } from 'react-router-dom';
import { useProjects } from '../api/hooks';
import { StatusPill } from '../components/StatusPill';
import { colors, monoStack, sansStack } from '../theme';

export function ProjectsList() {
  const { data, loading, error } = useProjects();
  const navigate = useNavigate();

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.title}>Projects</Text>
        <Link to="/projects/new" style={{ textDecoration: 'none' }}>
          <View style={styles.newButton}>
            <Text style={styles.newButtonText}>New project</Text>
          </View>
        </Link>
      </View>

      {loading ? <Text style={styles.muted}>Loading…</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {data && data.length === 0 ? (
        <Text style={styles.muted}>No projects yet. Create your first one.</Text>
      ) : null}

      {data?.map((project) => (
        <Pressable
          key={project.id}
          style={styles.row}
          onPress={() => navigate(`/projects/${project.id}`)}
        >
          <View style={styles.identity}>
            <Text style={styles.name}>{project.name}</Text>
            <Text style={styles.slug}>{project.slug}</Text>
          </View>
          <Text style={styles.count}>
            {project.componentCount} component{project.componentCount === 1 ? '' : 's'}
          </Text>
          <StatusPill status={project.status} />
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 30, gap: 14 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: colors.text, fontFamily: sansStack, fontSize: 24, fontWeight: '800' },
  newButton: {
    backgroundColor: colors.panelRaised,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 14
  },
  newButtonText: { color: colors.accent, fontFamily: monoStack, fontSize: 13, fontWeight: '800' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 14,
    paddingHorizontal: 18
  },
  identity: { flex: 1, gap: 3 },
  name: { color: colors.text, fontFamily: monoStack, fontSize: 14, fontWeight: '800' },
  slug: { color: colors.muted, fontFamily: monoStack, fontSize: 12 },
  count: { color: colors.muted, fontFamily: monoStack, fontSize: 12, minWidth: 120 },
  muted: { color: colors.muted, fontFamily: sansStack, fontSize: 14 },
  error: { color: colors.critical, fontFamily: sansStack, fontSize: 14 }
});
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- --run src/screens/ProjectsList.test.tsx`
Expected: 2 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/screens/ProjectsList.tsx src/screens/ProjectsList.test.tsx
git commit -m "feat: add projects list screen"
```

---

## Task 12: Project form screen (create + edit)

**Files:**
- Create: `src/screens/ProjectForm.tsx`
- Test: `src/screens/ProjectForm.test.tsx`

- [ ] **Step 1: Write the failing test `src/screens/ProjectForm.test.tsx`**

```tsx
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ProjectForm } from './ProjectForm';
import { api } from '../api/client';

afterEach(() => vi.restoreAllMocks());

describe('ProjectForm (create)', () => {
  it('submits a new project', async () => {
    const spy = vi.spyOn(api, 'createProject').mockResolvedValue({
      id: '1', name: 'New', slug: 'new', description: null,
      status: 'healthy', componentCount: 0, createdAt: '', updatedAt: ''
    });
    render(
      <MemoryRouter initialEntries={['/projects/new']}>
        <Routes>
          <Route path="/projects/new" element={<ProjectForm mode="create" />} />
          <Route path="/projects/:id" element={<div>detail</div>} />
        </Routes>
      </MemoryRouter>
    );
    fireEvent.change(screen.getByPlaceholderText(/project name/i), {
      target: { value: 'New' }
    });
    fireEvent.click(screen.getByText(/create project/i));
    await waitFor(() => expect(spy).toHaveBeenCalledWith({ name: 'New', description: null }));
  });

  it('shows an error when the name is empty', async () => {
    render(
      <MemoryRouter initialEntries={['/projects/new']}>
        <Routes>
          <Route path="/projects/new" element={<ProjectForm mode="create" />} />
        </Routes>
      </MemoryRouter>
    );
    fireEvent.click(screen.getByText(/create project/i));
    await waitFor(() => expect(screen.getByText(/name is required/i)).toBeTruthy());
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- --run src/screens/ProjectForm.test.tsx`
Expected: FAIL — cannot resolve `./ProjectForm`.

- [ ] **Step 3: Implement `src/screens/ProjectForm.tsx`**

```tsx
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { colors, monoStack, sansStack } from '../theme';

export function ProjectForm({ mode }: { mode: 'create' | 'edit' }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && id) {
      api.getProject(id).then((p) => {
        setName(p.name);
        setDescription(p.description ?? '');
      }).catch((err) => setError(err.message));
    }
  }, [mode, id]);

  async function submit() {
    if (name.trim().length === 0) {
      setError('Name is required');
      return;
    }
    setSaving(true);
    setError(null);
    const input = { name: name.trim(), description: description.trim() || null };
    try {
      if (mode === 'create') {
        const created = await api.createProject(input);
        navigate(`/projects/${created.id}`);
      } else if (id) {
        await api.updateProject(id, input);
        navigate(`/projects/${id}`);
      }
    } catch (err) {
      setError((err as Error).message);
      setSaving(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Text style={styles.title}>{mode === 'create' ? 'New project' : 'Edit project'}</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Project name"
          placeholderTextColor={colors.faint}
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Optional description"
          placeholderTextColor={colors.faint}
          value={description}
          onChangeText={setDescription}
          multiline
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.actions}>
        <Pressable style={styles.primary} onPress={submit} disabled={saving}>
          <Text style={styles.primaryText}>
            {mode === 'create' ? 'Create project' : 'Save changes'}
          </Text>
        </Pressable>
        <Pressable style={styles.secondary} onPress={() => navigate(-1)}>
          <Text style={styles.secondaryText}>Cancel</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 30, gap: 18, maxWidth: 640 },
  title: { color: colors.text, fontFamily: sansStack, fontSize: 24, fontWeight: '800' },
  field: { gap: 6 },
  label: { color: colors.muted, fontFamily: monoStack, fontSize: 12, fontWeight: '800' },
  input: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 6,
    color: colors.text,
    fontFamily: sansStack,
    fontSize: 14,
    paddingVertical: 10,
    paddingHorizontal: 12
  },
  textarea: { minHeight: 90 },
  error: { color: colors.critical, fontFamily: sansStack, fontSize: 14 },
  actions: { flexDirection: 'row', gap: 12 },
  primary: {
    backgroundColor: colors.panelRaised,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 16
  },
  primaryText: { color: colors.accent, fontFamily: monoStack, fontSize: 13, fontWeight: '800' },
  secondary: { paddingVertical: 10, paddingHorizontal: 16 },
  secondaryText: { color: colors.muted, fontFamily: monoStack, fontSize: 13 }
});
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- --run src/screens/ProjectForm.test.tsx`
Expected: 2 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/screens/ProjectForm.tsx src/screens/ProjectForm.test.tsx
git commit -m "feat: add project create/edit form screen"
```

---

## Task 13: Project detail screen (the hub) + component management

**Files:**
- Create: `src/screens/ComponentForm.tsx`
- Create: `src/screens/ProjectDetail.tsx`
- Test: `src/screens/ProjectDetail.test.tsx`

- [ ] **Step 1: Implement the component sub-form `src/screens/ComponentForm.tsx`**

```tsx
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { COMPONENT_KINDS, type ComponentKind, type HealthState } from '../../shared/types';
import type { ComponentInput } from '../api/client';
import { colors, monoStack, sansStack } from '../theme';

const STATUSES: HealthState[] = ['healthy', 'warning', 'critical'];

export function ComponentForm({
  initial,
  onSubmit,
  onCancel
}: {
  initial?: ComponentInput;
  onSubmit: (input: ComponentInput) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [kind, setKind] = useState<ComponentKind>(initial?.kind ?? 'service');
  const [status, setStatus] = useState<HealthState>(initial?.status ?? 'healthy');
  const [target, setTarget] = useState(initial?.target ?? '');
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (name.trim().length === 0) {
      setError('Name is required');
      return;
    }
    setError(null);
    await onSubmit({
      name: name.trim(),
      kind,
      status,
      target: target.trim() || null,
      notes: null
    });
  }

  return (
    <View style={styles.form}>
      <TextInput
        style={styles.input}
        placeholder="Component name"
        placeholderTextColor={colors.faint}
        value={name}
        onChangeText={setName}
      />
      <View style={styles.chips}>
        {COMPONENT_KINDS.map((k) => (
          <Pressable
            key={k}
            style={[styles.chip, kind === k && styles.chipActive]}
            onPress={() => setKind(k)}
          >
            <Text style={[styles.chipText, kind === k && styles.chipTextActive]}>{k}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.chips}>
        {STATUSES.map((s) => (
          <Pressable
            key={s}
            style={[styles.chip, status === s && styles.chipActive]}
            onPress={() => setStatus(s)}
          >
            <Text style={[styles.chipText, status === s && styles.chipTextActive]}>{s}</Text>
          </Pressable>
        ))}
      </View>
      <TextInput
        style={styles.input}
        placeholder="Target (url / host / domain)"
        placeholderTextColor={colors.faint}
        value={target}
        onChangeText={setTarget}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.actions}>
        <Pressable style={styles.primary} onPress={submit}>
          <Text style={styles.primaryText}>Save component</Text>
        </Pressable>
        <Pressable style={styles.secondary} onPress={onCancel}>
          <Text style={styles.secondaryText}>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 10,
    backgroundColor: colors.panelRaised,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 6,
    padding: 14
  },
  input: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 6,
    color: colors.text,
    fontFamily: sansStack,
    fontSize: 14,
    paddingVertical: 9,
    paddingHorizontal: 12
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 12
  },
  chipActive: { backgroundColor: colors.panel, borderColor: colors.accent },
  chipText: { color: colors.muted, fontFamily: monoStack, fontSize: 12 },
  chipTextActive: { color: colors.accent, fontWeight: '800' },
  error: { color: colors.critical, fontFamily: sansStack, fontSize: 13 },
  actions: { flexDirection: 'row', gap: 12 },
  primary: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 9,
    paddingHorizontal: 14
  },
  primaryText: { color: colors.accent, fontFamily: monoStack, fontSize: 13, fontWeight: '800' },
  secondary: { paddingVertical: 9, paddingHorizontal: 14 },
  secondaryText: { color: colors.muted, fontFamily: monoStack, fontSize: 13 }
});
```

- [ ] **Step 2: Write the failing test `src/screens/ProjectDetail.test.tsx`**

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ProjectDetail } from './ProjectDetail';
import { api } from '../api/client';

afterEach(() => vi.restoreAllMocks());

function renderDetail() {
  return render(
    <MemoryRouter initialEntries={['/projects/1']}>
      <Routes>
        <Route path="/projects/:id" element={<ProjectDetail />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProjectDetail', () => {
  it('renders the project, its components, and hub sections', async () => {
    vi.spyOn(api, 'getProject').mockResolvedValue({
      id: '1', name: 'Media Stack', slug: 'media-stack', description: 'Home media',
      status: 'warning', componentCount: 1, createdAt: '', updatedAt: '',
      components: [
        {
          id: 'c1', projectId: '1', name: 'jellyfin', kind: 'service',
          status: 'warning', target: 'http://jelly', notes: null, config: {},
          createdAt: '', updatedAt: ''
        }
      ]
    });
    renderDetail();
    await waitFor(() => expect(screen.getByText('Media Stack')).toBeTruthy());
    expect(screen.getByText('jellyfin')).toBeTruthy();
    // hub placeholder sections
    expect(screen.getByText('Checks')).toBeTruthy();
    expect(screen.getByText('Deploys')).toBeTruthy();
    expect(screen.getByText('Log pointers')).toBeTruthy();
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npm test -- --run src/screens/ProjectDetail.test.tsx`
Expected: FAIL — cannot resolve `./ProjectDetail`.

- [ ] **Step 4: Implement `src/screens/ProjectDetail.tsx`**

```tsx
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigate, useParams } from 'react-router-dom';
import type { Component } from '../../shared/types';
import { api, type ComponentInput } from '../api/client';
import { useProject } from '../api/hooks';
import { StatusPill } from '../components/StatusPill';
import { colors, monoStack, sansStack } from '../theme';
import { ComponentForm } from './ComponentForm';

const HUB_SECTIONS = ['Checks', 'Deploys', 'Alerts', 'Timeline', 'Config', 'Log pointers'];

export function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, error, reload } = useProject(id);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  if (loading) return <Text style={styles.muted}>Loading…</Text>;
  if (error) return <Text style={styles.error}>{error}</Text>;
  if (!data) return <Text style={styles.muted}>Project not found.</Text>;

  async function addComponent(input: ComponentInput) {
    await api.createComponent(id!, input);
    setAdding(false);
    reload();
  }
  async function saveComponent(componentId: string, input: ComponentInput) {
    await api.updateComponent(componentId, input);
    setEditing(null);
    reload();
  }
  async function removeComponent(componentId: string) {
    if (!confirm('Delete this component?')) return;
    await api.deleteComponent(componentId);
    reload();
  }
  async function removeProject() {
    if (!confirm('Delete this project and all its components?')) return;
    await api.deleteProject(id!);
    navigate('/projects');
  }

  const toInput = (c: Component): ComponentInput => ({
    name: c.name, kind: c.kind, status: c.status, target: c.target, notes: c.notes
  });

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <View style={styles.header}>
        <View style={styles.identity}>
          <Text style={styles.title}>{data.name}</Text>
          <StatusPill status={data.status} />
        </View>
        <View style={styles.headerActions}>
          <Pressable style={styles.button} onPress={() => navigate(`/projects/${id}/edit`)}>
            <Text style={styles.buttonText}>Edit</Text>
          </Pressable>
          <Pressable style={styles.button} onPress={removeProject}>
            <Text style={styles.dangerText}>Delete</Text>
          </Pressable>
        </View>
      </View>
      {data.description ? <Text style={styles.description}>{data.description}</Text> : null}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Components</Text>
          <Pressable onPress={() => { setAdding(true); setEditing(null); }}>
            <Text style={styles.link}>Add component</Text>
          </Pressable>
        </View>

        {adding ? (
          <ComponentForm onSubmit={addComponent} onCancel={() => setAdding(false)} />
        ) : null}

        {data.components.length === 0 && !adding ? (
          <Text style={styles.muted}>No components yet.</Text>
        ) : null}

        {data.components.map((c) =>
          editing === c.id ? (
            <ComponentForm
              key={c.id}
              initial={toInput(c)}
              onSubmit={(input) => saveComponent(c.id, input)}
              onCancel={() => setEditing(null)}
            />
          ) : (
            <View key={c.id} style={styles.componentRow}>
              <View style={styles.kindBadge}>
                <Text style={styles.kindText}>{c.kind}</Text>
              </View>
              <View style={styles.componentIdentity}>
                <Text style={styles.componentName}>{c.name}</Text>
                {c.target ? <Text style={styles.componentTarget}>{c.target}</Text> : null}
              </View>
              <StatusPill status={c.status} />
              <Pressable onPress={() => { setEditing(c.id); setAdding(false); }}>
                <Text style={styles.link}>Edit</Text>
              </Pressable>
              <Pressable onPress={() => removeComponent(c.id)}>
                <Text style={styles.dangerText}>Remove</Text>
              </Pressable>
            </View>
          )
        )}
      </View>

      <View style={styles.hubGrid}>
        {HUB_SECTIONS.map((title) => (
          <View key={title} style={styles.hubCard}>
            <Text style={styles.hubTitle}>{title}</Text>
            <Text style={styles.hubEmpty}>Coming soon.</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 30, gap: 18 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  title: { color: colors.text, fontFamily: sansStack, fontSize: 24, fontWeight: '800' },
  headerActions: { flexDirection: 'row', gap: 10 },
  button: {
    borderColor: colors.border, borderWidth: 1, borderRadius: 6,
    paddingVertical: 8, paddingHorizontal: 14
  },
  buttonText: { color: colors.accent, fontFamily: monoStack, fontSize: 13, fontWeight: '800' },
  dangerText: { color: colors.critical, fontFamily: monoStack, fontSize: 13, fontWeight: '800' },
  description: { color: colors.muted, fontFamily: sansStack, fontSize: 14, maxWidth: 720 },
  section: {
    backgroundColor: colors.panel, borderColor: colors.border, borderWidth: 1,
    borderRadius: 6, padding: 18, gap: 12
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { color: colors.text, fontFamily: sansStack, fontSize: 16, fontWeight: '800' },
  link: { color: colors.accent, fontFamily: monoStack, fontSize: 13, fontWeight: '800' },
  componentRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderTopColor: colors.divider, borderTopWidth: 1, paddingTop: 12
  },
  kindBadge: {
    borderColor: colors.border, borderWidth: 1, borderRadius: 999,
    paddingVertical: 3, paddingHorizontal: 10, minWidth: 72, alignItems: 'center'
  },
  kindText: { color: colors.muted, fontFamily: monoStack, fontSize: 11, fontWeight: '800' },
  componentIdentity: { flex: 1, gap: 2 },
  componentName: { color: colors.text, fontFamily: monoStack, fontSize: 14, fontWeight: '800' },
  componentTarget: { color: colors.muted, fontFamily: monoStack, fontSize: 12 },
  hubGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  hubCard: {
    backgroundColor: colors.panel, borderColor: colors.border, borderWidth: 1,
    borderRadius: 6, padding: 18, flexBasis: 220, flexGrow: 1, gap: 6
  },
  hubTitle: { color: colors.text, fontFamily: sansStack, fontSize: 15, fontWeight: '800' },
  hubEmpty: { color: colors.faint, fontFamily: monoStack, fontSize: 12 },
  muted: { color: colors.muted, fontFamily: sansStack, fontSize: 14, padding: 30 },
  error: { color: colors.critical, fontFamily: sansStack, fontSize: 14, padding: 30 }
});
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- --run src/screens/ProjectDetail.test.tsx`
Expected: 1 test PASSES.

- [ ] **Step 6: Frontend type-check (router shell now resolves)**

Run: `npx tsc --noEmit`
Expected: no errors (all screens referenced by `App.tsx` now exist; this uses
the root `tsconfig.json`, which type-checks `src` plus the `shared/` files it
imports).

- [ ] **Step 7: Commit**

```bash
git add src/screens/ComponentForm.tsx src/screens/ProjectDetail.tsx src/screens/ProjectDetail.test.tsx
git commit -m "feat: add project detail hub with component management"
```

---

## Task 14: Dockerfile + docs

**Files:**
- Create: `Dockerfile`
- Create: `.dockerignore`
- Modify: `docker-compose.yml`
- Modify: `README.md`

- [ ] **Step 1: Create `Dockerfile`**

```dockerfile
FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY server ./server
COPY shared ./shared
COPY drizzle.config.ts ./
EXPOSE 8787
CMD ["sh", "-c", "npm run db:migrate && npx tsx server/index.ts"]
```

- [ ] **Step 2: Create `.dockerignore`**

```
node_modules
dist
.git
.env
*.log
```

- [ ] **Step 3: Add the `api` service to `docker-compose.yml`**

Add under `services:` (keeping the existing `db` service and `volumes`):
```yaml
  api:
    build: .
    depends_on:
      - db
    environment:
      DATABASE_URL: postgres://homelab:homelab@db:5432/homelab
      PORT: 8787
    ports:
      - '8787:8787'
```

- [ ] **Step 4: Document setup in `README.md`**

Replace the "## Data" section of `README.md` with:
```markdown
## Backend & Data

homelab now persists projects and components in Postgres via a small Hono API.

### Local development

```bash
npm install
npm run db:up        # start postgres in docker
npm run db:migrate   # apply migrations
npm run dev:api      # start the api on :8787
npm run dev          # start the vite frontend (proxies /api)
```

### Full stack in Docker

```bash
docker compose up --build
```

The API serves the built frontend and the REST API on port 8787.
```

- [ ] **Step 5: Commit**

```bash
git add Dockerfile .dockerignore docker-compose.yml README.md
git commit -m "feat: add production Dockerfile and update setup docs"
```

---

## Task 15: Full verification

- [ ] **Step 1: Run the whole test suite**

Run: `npm test -- --run`
Expected: all suites PASS (shared, server/db, server/app, src/api, src/screens, App).

- [ ] **Step 2: Type-check and build the frontend**

Run: `npm run build`
Expected: `tsc --noEmit` passes and Vite build succeeds.

- [ ] **Step 3: Manual smoke test against real Postgres (optional but recommended)**

```bash
npm run db:up
npm run db:migrate
npm run dev:api   # in one shell
npm run dev       # in another
```
Open the app, go to Projects → New project, create one, add a component, edit
it, and delete the project. Confirm each action persists across a page reload.

- [ ] **Step 4: Final commit (if any uncommitted changes remain)**

```bash
git add -A
git commit -m "chore: project registry verification pass" || echo "nothing to commit"
```

---

## Done

When all tasks are complete and verified, use the
**superpowers:finishing-a-development-branch** skill to merge or open a PR for
issue #2.
