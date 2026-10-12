# Baseline and implementation plan

Reviewed baseline: `3020126` (clean worktree), 12 October 2026.

## Architecture

SvelteKit 2 + Svelte 4, TypeScript, Vite 5 and Tailwind 3. npm lock resolves Kit 2.5.7, Svelte 4.2.15, Vite 5.2.10 and adapter-auto 3.2.0; pnpm lock resolves different versions (Kit 2.5.10, Svelte 4.2.17, Vite 5.2.11, adapter-auto 3.2.1). No packageManager or Node engines, .npmrc, .nvmrc, .node-version, vercel.json, CI, lint configuration or project instruction/design-system files. README uses npm. An ignored local Bun lock and installed dependencies also exist. Standardize on npm and its lockfile.

The only route is `/`, rendered on the server by +page.server.ts and selected with `?lang=en|th`. JSON files hold all CV content. No database, API routes, forms, account system or external data fetch. SECRET_TOKEN controls detailed address disclosure; all hide:true entries are filtered on the server. Keep this request-dependent SSR architecture.

Components: App, Intro, Work, Certifications, Hideable and optional Kofi. Tailwind colors (indigo 600, white, gray), Google-hosted Noto Sans Thai; no component library or theme. A4 CSS and browser printing already exist. Clicking content toggles print exclusion, but nested click handlers and invalid list wrappers prevent reliable keyboard use. The 3.9 MiB portrait has no intrinsic dimensions. Unused starter images and data/store modules remain.

## Issues and plan

1. adapter-auto 3 selects adapter-vercel major 4; replace auto-installation with a maintained explicit adapter and Node 22 runtime. Verify installed adapter source and generated function config. Preserve framework; update supported dependencies as compatibility/security requires.
2. Existing tests reference missing Playwright/testing-library packages and a starter heading. Establish meaningful tests and linting, check production output, then browser regression tests.
3. Remove public fallback token, prevent token disclosure through referrers/caching, retain explicit environment-token access. Review all input and output boundaries and dependency advisories.
4. Keep locale keys and certificate/project URLs. Align Thai skill lists with existing English facts. Migrate only verified equivalent certificate dates, retaining legacy-date compatibility. Add optional metadata/status with one server-provided date snapshot.
5. Preserve CV layout and branding; repair wrapping, heading hierarchy, language metadata, focus, print controls and A4 pagination. Maintain public hidden-entry filtering.
6. Review bilingual prose conservatively, preserving every factual claim and official qualification name. Document ambiguous duplicate credential links rather than changing them.

## Validation boundaries

Node was absent from PATH; an official checksum-verified Node 22 toolchain is being provisioned under /tmp. Vercel account configuration and credentials are not available. Local production output is evidence of build compatibility, not a deployed result. Security audit artifacts use the skill-required external output directory; the repository report will summarize findings and limitations.

## Measured baseline

`npm run check`: 25 errors, 4 warnings (missing test dependencies/globals, Kofi Window type, inaccessible print selection and unused styles). `npm run build`: passed generic output, but adapter-auto could not detect a deployment platform; no Vercel artifact produced. Client JS totals 83,754 bytes (28,607 individually gzipped); generated CSS totals 21,162 bytes (5,988 individually gzipped, including Vite's duplicate CSS output). Portrait 4,022,397 bytes. These are build-file measurements, not measured page-load or Lighthouse scores.
