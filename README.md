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

- React
- TypeScript
- Vite
- React Native Web

</td>
</tr>
</table>

## Quick Start

```bash
npm install
npm run dev
```

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
- `npm run build`: type-check and build for production
- `npm test`: run the Vitest suite

## Data

The current UI uses local sample data in `src/appData.ts` to keep the shell stable while the dashboard shape is refined.

## Project Structure

- `src/App.tsx` contains the dashboard shell and sections
- `src/appData.ts` contains the sample projects, alerts, metrics, and timeline events
- `src/global.css` sets the global theme and font imports
- `src/App.test.tsx` covers the core dashboard rendering behavior

## Notes

The interface is tuned to stay flat, legible, and operational rather than decorative. The goal is to make state obvious at a glance, not to turn the app into a marketing page.
