# Bilingual resume

A server-rendered Thai/English CV built with SvelteKit and Tailwind CSS. The page supports browser printing, per-entry print customization, locally hosted Thai/Latin fonts, and optional disclosure of the detailed address through a server environment token.

## Local development

Use Node.js 22 and npm 10. The repository intentionally keeps one lockfile.

```sh
npm ci
npm run dev
```

Quality checks:

```sh
npm run check
npm run lint
npm test
npx playwright install chromium
npm run test:e2e
npm run build
```

Set `SECRET_TOKEN` only when private address links are required. Without it, the detailed address always remains hidden. The token is passed as `?token=...`; treat such URLs as sensitive and avoid sharing them through systems that retain URL query strings.

See [DEPLOYMENT.md](DEPLOYMENT.md), [MIGRATION.md](MIGRATION.md), and [SECURITY_AUDIT.md](SECURITY_AUDIT.md).
