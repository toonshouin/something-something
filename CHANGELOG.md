# Changelog

## Unreleased

### Corrective Implementation & UI Preservation
- Restored and preserved the original minimalist document-first CV layout, typography, section hierarchy, divider lines, and 2-column contact header based on baseline `3020126`.
- Completely removed card borders, drop shadows, decorative badges, floating in-document buttons, and dashboard containers.
- Preserved the original A4 print stylesheet (`@page { size: A4; margin: 1cm; }`) and verified document page flow.
- Retained inline certificate formatting (`Name - Date - [Verify] | [Detail]`) without lifetime badges or missing-expiration placeholders.
- Added inline verification code display (`(Code: <code>)`) alongside the `[Verify]` link for portal-verified credentials (e.g. Certiport), keeping the original English qualification name prominent in both Thai and English profiles.
- Confirmed only two certifications contain `validUntil` expiration dates: *Pearson Generative AI Foundations* (2026-08-13 to 2031-08-13) and *LINK Certified Network Cabling for Engineering (LCCE)* (2026-06-10 to 2029-06-10).
- Preserved all public certificate PDFs (`/certificate/pdf/*.pdf`) and external verification links without requiring tokens to view them.

### Address Privacy & Baserow Dynamic Integration
- Completely removed all sensitive street address fields (`house_no`, `moo`, `soi`, `village`, `road`, `sub_district`, `district`, `zip_code`) from public JSON profiles (`profile_en.json`, `profile_th.json`) and git source code.
- Public visitors receive only `Province, Country` across all client payloads, static files, and HTML.
- Implemented query token authorization flow: navigating to `/?token=...` validates the token server-side, logs the access attempt, sets an `HttpOnly` HMAC-SHA256 signed session cookie (`resume_session`), and redirects via HTTP 303 to strip the token from the browser URL.
- Added Baserow database client (`src/lib/server/access/baserow.ts`) supporting:
  - Dynamic address management from table `private_address` with 5-minute memory caching.
  - Granular token validation from table `access_grants` with expiry and activation checks.
  - Non-blocking audit trail logging to table `access_logs` with a 2-second timeout.
  - Resilient offline fallback to `PRIVATE_ADDRESS_JSON` environment variable and public default.
- Added comprehensive setup and schema documentation in `BASEROW_GUIDE.md`.

### Accessibility, Compatibility & Performance
- Replaced adapter-auto's Vercel adapter 4 path with explicit adapter-vercel 6 and a Node.js 22 serverless runtime.
- Updated SvelteKit 2, Svelte 5, Vite 8, type checking, linting, and browser-test tooling.
- Standardized dependency installation on npm and removed the conflicting pnpm lockfile.
- Fixed HTML hierarchy violations (moved `<Hideable>` inside `<li>` so `<li>` is a direct child of `<ul>`), resolving WCAG 1.3.1.
- Added `<title>` to `app.html` for WCAG 2.4.2 compliance.
- Fixed mobile horizontal scrollbar overflow at 320px by replacing `w-screen` with `w-full`.
- Converted verified certificate issue dates to ISO 8601 with Gregorian/Buddhist calendar localization.
- Corrected Microsoft Learn credential verification links.
- Added HTTPS URL normalization and rejected unsafe schemes.
- Preserved `hide: true` filtering and added regression test coverage.
- Self-hosted Noto Sans Thai fonts and optimized portrait image to WebP (12 KiB).
- Added Content Security Policy, strict referrer, frame, and permission headers in `src/hooks.server.ts`.
