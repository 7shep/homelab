<h1 align="center">
  <br>
  homelab
</h1>

<h4 align="center">A compact observability dashboard for solo developers and small self-hosted projects.</h4>

<p align="center">
  <img src="https://img.shields.io/badge/node-20%2B-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node 20+">
  <img src="https://img.shields.io/badge/typescript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/react-native-web-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React Native Web">
</p>

<p align="center">
  <img src="https://img.shields.io/github/stars/7shep/homelab?style=flat-square&label=stars" alt="Stars">
  <img src="https://img.shields.io/github/forks/7shep/homelab?style=flat-square&label=forks" alt="Forks">
  <img src="https://img.shields.io/github/issues/7shep/homelab?style=flat-square&label=issues" alt="Issues">
  <img src="https://img.shields.io/github/issues-pr/7shep/homelab?style=flat-square&label=prs" alt="Pull requests">
</p>

<p align="center">
  homelab keeps a private operational dashboard in one place so you can see what is healthy, what changed, what broke, and what needs attention without bouncing between terminals and provider dashboards.
</p>

<table>
<tr>
<td>

**What it shows**

- Project health
- Active alerts
- Recent timeline events
- Current system state
- Dashboard command context

**What it uses**

- React + React Native Web
- TypeScript + Vite
- react-router-dom
- Hono API + Drizzle ORM
- Postgres (Docker)

</td>
</tr>
</table>

## Quick Start

The frontend talks to a small Hono API backed by Postgres. For local
development, run the database, apply migrations, then start the API and the
Vite dev server (which proxies `/api` to the API):

```bash
npm install
npm run db:up        # start postgres in docker (loopback only)
npm run db:migrate   # apply migrations
npm run dev:api      # start the api on :8787
npm run dev          # start the vite frontend (proxies /api)
```

Copy `.env.example` to `.env` to override credentials or the port.

### Full stack in Docker

```bash
docker compose up --build
```

The API container applies migrations on boot, serves the built frontend, and
exposes the REST API on `127.0.0.1:8787`.

For a production check:

```bash
npm run build
npm test
```

## Layout

The dashboard is intentionally quiet and dense:

- A left rail for navigation and workspace context
- A terminal-style command bar across the top
- Metric tiles for healthy, warning, critical, and total system counts
- Two middle panels for projects and active alerts
- A timeline table for the latest operational events

## Scripts

- `npm run dev`: start the local Vite dev server
- `npm run dev:api`: start the Hono API with hot reload on :8787
- `npm run build`: type-check (frontend + server) and build for production
- `npm test`: run the Vitest suite
- `npm run db:up`: start Postgres in Docker
- `npm run db:generate`: generate a Drizzle migration from the schema
- `npm run db:migrate`: apply pending migrations

## Backend & Data

Projects and their components are persisted in Postgres via a small Hono REST
API (`/api/projects`, `/api/projects/:id/components`, …). Project status is
derived at read time from the worst component status and is never stored. The
dashboard still renders sample data from `src/appData.ts`; the registry screens
(Projects, project detail) read and write live data through the API.

## Project Structure

- `src/App.tsx` is the react-router shell (sidebar + routed content)
- `src/screens/` holds the Dashboard, ProjectsList, ProjectForm, and
  ProjectDetail screens
- `src/api/` holds the typed fetch client and data hooks
- `server/` holds the Hono app, validation, and the Drizzle repository/schema
- `shared/types.ts` holds the domain types shared by the client and server
- `src/appData.ts` contains the sample data still used by the dashboard

## Notes

The interface is tuned to stay flat, legible, and operational rather than decorative. The goal is to make state obvious at a glance, not to turn the app into a marketing page.
