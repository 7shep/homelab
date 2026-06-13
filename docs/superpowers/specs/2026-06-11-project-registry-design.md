# Project Registry — Design Spec

**Issue:** #2 — Implement project registry CRUD and detail views
**Date:** 2026-06-11
**Status:** Approved

## Goal

Build the real project registry so users can create, edit, list, and inspect
projects. A project is a top-level grouping that contains typed **components**
of six kinds: app, service, worker, cron job, server, and domain. The project
detail page becomes the hub for checks, deploys, alerts, timeline events,
config, and future log pointers.

This issue establishes the backend foundation (API + database) that every later
roadmap feature builds on, because the roadmap (cron heartbeats, uptime/TLS
checks, alerts, CLI, source-controlled config) fundamentally requires a server
and cannot run in the browser.

## Key Decisions

1. **Data model:** a project *contains* components. Each component has one of
   the six kinds. (Not: each kind is its own project type.)
2. **Backend:** Node + Hono REST API, **Postgres 16** in Docker, **Drizzle ORM**
   for schema and migrations. Frontend talks to the API; Vite proxies `/api` in
   dev.
3. **Routing:** `react-router-dom` with real URLs.
4. **Component fields:** a common shape (`name`, `kind`, `status`, `target`,
   `notes`) plus a `jsonb config` column. Kind-specific config (cron schedule,
   cert thresholds, etc.) is deferred to the feature that consumes it and lands
   in `config` with no future migration.
5. **Project status is derived**, never stored: the worst of its components'
   statuses (`healthy` if none).
6. **Component status is manually set** for now (placeholder until real checks
   land), keeping the existing 3-state model the dashboard already uses.

## Repo Layout

```
homelab/
├─ src/                    # frontend, refactored into a router shell
│  ├─ api/                 # typed fetch client + data hooks
│  ├─ screens/            # Dashboard, ProjectsList, ProjectDetail, ProjectForm, Placeholder
│  └─ components/         # Sidebar, StatusPill, etc. (extracted from App.tsx)
├─ server/                 # Hono API
│  ├─ index.ts            # entry: serves API + built frontend statically
│  ├─ routes/             # projects.ts, components.ts
│  └─ db/                 # drizzle schema, migrations, client
├─ shared/types.ts         # canonical domain types imported by both sides
├─ docker-compose.yml      # postgres:16 + api
├─ Dockerfile              # multi-stage: build web + run api
└─ drizzle.config.ts
```

`shared/types.ts` holds the canonical `Project`, `Component`, `Kind`,
`HealthState` types so the API and UI cannot drift.

## Data Model (Drizzle / Postgres)

```
projects
  id          uuid  pk        (app-generated via crypto.randomUUID — DB-agnostic)
  name        text  not null
  slug        text  not null  unique   (url-friendly, derived from name)
  description text  nullable
  created_at / updated_at  timestamptz

components
  id          uuid  pk
  project_id  uuid  fk → projects.id  ON DELETE CASCADE
  name        text  not null
  kind        enum('app','service','worker','cron','server','domain')
  status      enum('healthy','warning','critical')  default 'healthy'
  target      text  nullable   (url / host / domain)
  notes       text  nullable
  config      jsonb not null default '{}'
  created_at / updated_at
```

IDs are generated in the app layer (`crypto.randomUUID`) rather than via a DB
default, so the same schema runs unchanged on Postgres (prod) and pglite (tests).

## API (Hono + Zod)

```
GET    /api/projects                  list + component counts + derived status
POST   /api/projects                  create
GET    /api/projects/:id              project + its components
PATCH  /api/projects/:id              update name/description
DELETE /api/projects/:id              delete (cascades components)
POST   /api/projects/:id/components    add component
PATCH  /api/components/:id             update component
DELETE /api/components/:id             delete component
```

- Zod validation on every write via `@hono/zod-validator`.
- Consistent error envelope: `{ error: { message } }`.
- Status codes: 400 validation, 404 not found, 409 slug conflict.

## Frontend (react-router-dom)

`App.tsx` becomes a layout shell (sidebar + `<Routes>`). The current dashboard
body moves into `screens/Dashboard.tsx` unchanged.

```
/                    Dashboard       (existing content, left as-is this issue)
/projects            ProjectsList    table: name, status, component count
/projects/new        ProjectForm     create (name + description)
/projects/:id        ProjectDetail   the hub
/projects/:id/edit   ProjectForm     edit
```

- Sidebar nav items become real router links with active state.
- Not-yet-built items (Timeline, Alerts, Servers, Config, Settings) route to a
  quiet "Coming soon" placeholder so nav never dead-ends.
- **Data layer:** a thin typed fetch client plus small custom hooks
  (`useProjects`, `useProject`, mutation helpers that refetch on success). No
  React Query — noted as a future swap if server-state grows.

## Project Detail Page — The Hub

- **Header:** name, derived status pill, description, Edit + Delete actions.
- **Components:** the working section — list grouped by kind with kind badge +
  status pill + target, plus an inline add/edit/remove form (flat panel, not a
  modal, matching the dense aesthetic).
- **Hub placeholders:** quiet cards with empty states for **Checks, Deploys,
  Alerts, Timeline, Config, Log pointers** — establishing the hub structure now
  so each future feature has an obvious home, without building the features.

## Error Handling & States

Every screen handles loading / error / empty explicitly. Mutations surface
errors inline (e.g. slug conflict on the form). Delete asks for confirmation.

## Testing

- **API:** Vitest integration tests against **pglite** (embedded Postgres, WASM)
  so DB-backed tests are hermetic and need no Docker in CI. Same Drizzle schema
  and migrations as prod Postgres.
- **Frontend:** Vitest + Testing Library for list/detail/form (validation,
  empty states, render), API client mocked. Existing `App.test.tsx` updated for
  the router refactor.

## Dev & Deploy

- Dev: `docker compose up -d db` → run migrations → `npm run dev` (vite) +
  `npm run dev:api` (tsx watch); Vite proxies `/api` to the Hono server.
- Production: multi-stage Dockerfile builds the frontend; the API serves it
  statically alongside `/api`. `docker compose up` runs `db` + `api`.
- Env: `DATABASE_URL`, `PORT` (with `.env.example`).

## New Dependencies

- Backend: `hono`, `@hono/node-server`, `@hono/zod-validator`, `zod`,
  `drizzle-orm`, `pg`, `drizzle-kit`, `@electric-sql/pglite`, `tsx`.
- Frontend: `react-router-dom`.

## Out of Scope (this issue)

- Wiring the Dashboard to real registry data (roadmap item #4).
- Any real check/deploy/alert/heartbeat logic — only hub placeholders.
- Kind-specific component config UI (deferred to consuming features).
- Auth / multi-user.
