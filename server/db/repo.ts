import { eq } from 'drizzle-orm';
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

  async function getProject(id: string): Promise<ProjectDetail | null> {
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
  }

  return {
    getProject,

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
      return getProject(id);
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
