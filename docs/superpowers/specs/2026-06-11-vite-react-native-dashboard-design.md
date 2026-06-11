# Vite React Native Dashboard Design

## Goal

Create the first frontend scaffold for homelab: a Vite-powered browser dashboard that uses React Native Web primitives and can evolve into the application shell described in `FEATURES.md`.

## Architecture

The frontend lives at the repository root as a Vite React TypeScript app. Vite aliases `react-native` to `react-native-web`, so dashboard components can use React Native-style imports while rendering in the browser. The first app is static and uses typed seed data to establish the project, status, alert, and timeline shapes without committing to a backend API yet.

## User Experience

The first screen is the operational dashboard, not a landing page. It includes a sidebar with the planned product sections, compact global health metrics, projects needing attention, recent operational events, active alerts, and certificate/server risk placeholders.

## Files

- `package.json`: npm scripts and dependencies for Vite, React, React Native Web, TypeScript, and tests.
- `index.html`: Vite HTML entry.
- `vite.config.ts`: React plugin, Vitest setup, and `react-native` alias.
- `tsconfig.json`: strict TypeScript settings and browser-focused module resolution.
- `src/appData.ts`: typed static seed data for the initial shell.
- `src/App.tsx`: React Native Web dashboard shell and static views.
- `src/main.tsx`: browser entrypoint.
- `src/setupTests.ts`: test runtime setup.
- `src/App.test.tsx`: smoke tests for the first dashboard shell.

## Verification

Run `npm install`, `npm test`, `npm run build`, and `npm run dev -- --host 127.0.0.1`. The dev server should expose the dashboard at the printed local URL.
