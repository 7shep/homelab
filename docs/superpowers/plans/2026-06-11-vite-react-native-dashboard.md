# Vite React Native Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Vite + React Native Web scaffold for the homelab dashboard.

**Architecture:** The app is a browser-first Vite React TypeScript project. Vite aliases `react-native` to `react-native-web`, and the first dashboard is static with typed seed data that mirrors the feature roadmap.

**Tech Stack:** Vite, React, TypeScript, React Native Web, Vitest, Testing Library.

---

### Task 1: Project Tooling

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `src/setupTests.ts`

- [ ] **Step 1: Add package scripts and dependencies**

Create `package.json` with scripts for `dev`, `build`, `preview`, and `test`.

- [ ] **Step 2: Add Vite and TypeScript config**

Create `index.html`, `tsconfig.json`, and `vite.config.ts`. Configure Vite to alias `react-native` to `react-native-web`.

- [ ] **Step 3: Add test setup**

Create `src/setupTests.ts` to load `@testing-library/jest-dom/vitest`.

### Task 2: Dashboard Shell Test

**Files:**
- Create: `src/App.test.tsx`

- [ ] **Step 1: Write the first dashboard rendering test**

Assert the app renders the `homelab` brand, the dashboard heading, and the primary navigation entries.

- [ ] **Step 2: Run the test and confirm it fails before implementation**

Run `npm test -- --run` after dependencies are installed. Expected result before `src/App.tsx` exists: the test fails because the app module is missing.

### Task 3: Dashboard Shell Implementation

**Files:**
- Create: `src/appData.ts`
- Create: `src/App.tsx`
- Create: `src/main.tsx`

- [ ] **Step 1: Add typed seed data**

Create projects, alerts, and timeline events in `src/appData.ts`.

- [ ] **Step 2: Build the React Native Web shell**

Create `src/App.tsx` with sidebar navigation, summary metrics, projects needing attention, active alerts, and recent timeline events.

- [ ] **Step 3: Add the browser entrypoint**

Create `src/main.tsx` and render the app into `#root`.

### Task 4: Verification

**Files:**
- Verify all created files.

- [ ] **Step 1: Install dependencies**

Run `npm install`.

- [ ] **Step 2: Run automated tests**

Run `npm test -- --run`.

- [ ] **Step 3: Run production build**

Run `npm run build`.

- [ ] **Step 4: Start the dev server**

Run `npm run dev -- --host 127.0.0.1` and provide the local URL.
