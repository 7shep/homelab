# Contributing to homelab

Thanks for taking the time to contribute. This project is a small Vite + React + TypeScript app, so contributions should stay focused, easy to review, and consistent with the existing product direction.

## Before You Start

- Read [README.md](README.md), [DESIGN.md](DESIGN.md), and [FEATURES.md](FEATURES.md) to understand the current scope.
- Check whether your change already fits an existing issue, doc note, or design decision.
- Keep the app's tone intact: compact, practical, dark, and operational rather than decorative.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the dev server:

   ```bash
   npm run dev
   ```

3. Run the test suite:

   ```bash
   npm test
   ```

4. Build the app:

   ```bash
   npm run build
   ```

## Project Structure

- `src/App.tsx` and `src/main.tsx` contain the main app entry points.
- `src/global.css` contains global styling.
- `src/appData.ts` contains app data and seed content.
- `src/App.test.tsx` contains the current test coverage.
- `DESIGN.md` defines the visual system and should be treated as the source of truth for UI direction.

## Working On Changes

- Prefer small, focused pull requests.
- Keep changes aligned with the existing design system and feature goals.
- If you are changing UI, verify it in the browser and make sure it still reads well at typical desktop sizes.
- If you are changing behavior, add or update tests where practical.
- Avoid introducing new dependencies unless they are clearly justified.

## Code Style

- Use TypeScript and modern React patterns already present in the codebase.
- Match the surrounding style instead of reformatting unrelated code.
- Keep CSS and component changes intentional and minimal.
- Use clear names for variables, components, and data structures.

## Testing Expectations

- Run `npm test` for behavioral changes.
- Run `npm run build` before opening a PR to catch type or bundling issues.
- If your change affects the UI, inspect the result in the browser and confirm the layout still works.

## Documentation Changes

Update docs when the change affects:

- product scope or roadmap
- design system rules
- feature behavior
- setup or usage instructions

Good places to update are `README.md`, `DESIGN.md`, `FEATURES.md`, or this file.

## Pull Request Checklist

- The change is scoped and understandable.
- Tests pass locally, or the PR explains why testing was not applicable.
- The app builds successfully.
- UI changes were reviewed visually.
- Relevant docs were updated.
- Only relevant files were edited. The PR will not be approved if you make unnecessary edits to files.

## Questions

If something is unclear, leave a note in the PR or issue explaining the tradeoff you are making. Small projects move faster when assumptions are explicit.
