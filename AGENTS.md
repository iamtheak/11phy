# Repository Guidelines

## Project Structure & Module Organization

Physics 11 is a static, interactive companion to Nepal Grade 11 Physics. Source files live at the repository root:

- `app.jsx` owns React navigation, labs, practice, notes, and the mass-drop sandbox.
- `content.mjs` defines chapters and physics models; `exercise.mjs` generates and checks practice questions.
- `canvas.mjs`, `animation.mjs`, and `interactions.mjs` implement drawing, playback, and direct manipulation.
- `electrical.jsx` / `electricity.mjs` and `optical-images.jsx` / `optics.mjs` implement specialized sandboxes; `responsive.jsx` provides viewport helpers.
- Root-level `*tests.mjs` and `react-tests.jsx` contain regression checks.

`dist/app.js` is generated. Other `dist/` files are retained site assets, including editable `style.css`, textbook content in `book.json`, and `source.pdf`. Do not delete `dist/` as build cleanup. Consult `README.md`, `PLAN.md`, `PRODUCT.md`, and `DESIGN.md` for behavior, model boundaries, and visual conventions.

## Build, Test, and Development Commands

Use Node.js 24 and pnpm from the repository root:

- `pnpm install --frozen-lockfile`: install locked dependencies.
- `pnpm test`: run all six model, interaction, animation, electricity, optics, and React test suites.
- `pnpm build`: bundle and minify `app.jsx` into `dist/app.js` using esbuild.
- `python -m http.server 8000 --directory dist`: serve locally at `http://localhost:8000`.

Rebuild and refresh after source changes; no development-server script is configured.

## Coding Style & Naming Conventions

Follow neighboring code: ES-module imports, single-quoted JavaScript strings, semicolons, and compact formatting. Match existing one- or two-space indentation within each file. Use PascalCase for React components and camelCase for functions and variables. Keep physical calculations in `.mjs` helpers and presentation in `.jsx`. No formatter or linter is configured. Preserve keyboard controls, readable results, and the visual system in `DESIGN.md`.

## Testing Guidelines

Tests use `node:assert/strict`; mounted React checks use LinkeDOM and esbuild. Add regression cases to the relevant `*-tests.mjs` file or `react-tests.jsx`. Check numerical reference values, boundary conditions, conservation identities, and interaction cleanup where relevant. No coverage percentage is configured. Run `pnpm test` and `pnpm build` before submitting; check layout changes in a browser as well.

## Commit & Pull Request Guidelines

This checkout has no Git history, so no established commit convention can be inferred. Use concise, imperative messages such as `Fix lens focus handling`. PRs should describe the behavior changed, physical assumptions, and validation performed. Link relevant issues and include screenshots for visual changes. Preserve browser-local notes and progress compatibility.
