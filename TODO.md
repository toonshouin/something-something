# Tasks and Status

## Completed Corrective Implementation
- [x] **Preserve Original Minimalist CV UI:** Reverted dashboard/card redesigns. Retained original document hierarchy, typography, 2-column contact header, inline certifications, divider lines, and A4 print stylesheet (`@page { size: A4; margin: 1cm; }`).
- [x] **Strict Visual Regression Verification:** Verified clean document rendering and zero horizontal overflow across 320px, 375px, 768px, 1024px, 1440px viewports and A4 print emulation in both English and Thai.
- [x] **Address Privacy & Zero Street Address in Git:** Removed all street address fields (`house_no`, `moo`, `soi`, `village`, `road`, `sub_district`, `district`, `zip_code`) from `profile_en.json`, `profile_th.json`, and TypeScript source. Public visitors receive only `Province, Country`.
- [x] **Query Token Redirection & Session Cookies:** Visiting `/?token=...` performs server-side validation against Baserow/`SECRET_TOKEN`, issues an `HttpOnly`, `SameSite=Lax` signed HMAC-SHA256 session cookie (`resume_session`), and redirects via HTTP 303 to a clean URL. Token is stripped from the browser address bar.
- [x] **Baserow Dynamic Integration:** Implemented client for self-hosted Baserow:
  - Dynamic address retrieval with 5-minute memory caching.
  - Granular `access_grants` validation with expiration and revoke support.
  - Non-blocking `access_logs` audit recording with 2.0s timeout.
  - Resilient offline fallback via `PRIVATE_ADDRESS_JSON` or public province/country default.
  - Documented in [BASEROW_GUIDE.md](./BASEROW_GUIDE.md).
- [x] **Certification Requirements:**
  - Preserved optional `validUntil` without placeholders or lifetime badges.
  - Exactly two certifications have confirmed expiration dates: *Pearson: Generative AI Foundations* (2026-08-13 to 2031-08-13) and *LINK Certified Network Cabling for Engineering (LCCE)* (2026-06-10 to 2029-06-10).
  - All certificate PDFs (`/certificate/pdf/*.pdf`) and external verification links remain public.
- [x] **Accessibility & HTML Standards:**
  - Corrected HTML list hierarchy (`<Hideable>` inside `<li>` so `<li>` is a direct child of `<ul>`) resolving WCAG 1.3.1.
  - Added `<title>` to `app.html` for WCAG 2.4.2.
  - Resolved `w-screen` mobile horizontal overflow at 320px.
- [x] **Backend & Dependencies Intact:**
  - Node 22 serverless runtime via `@sveltejs/adapter-vercel` 6.
  - SvelteKit 2, Svelte 5, Vite 8, npm lockfile standardized.
  - 13/13 unit tests passing, 7/7 Playwright tests passing, 0 svelte-check errors, 0 ESLint errors.

---

## Remaining / Optional Follow-Up

- [ ] **Live Vercel Preview Verification:** Run a preview deployment in the linked Vercel dashboard and verify environment variables (`SECRET_TOKEN`, `BASEROW_*`), response security headers, and PDF delivery. Local build output is verified; provider dashboard settings are not accessible locally.
- [ ] **Tailwind 4 Migration (Deferred):** Tailwind 3 build-only dependency tree currently has advisory warnings. Inputs are maintainer-controlled and not shipped to clients. Plan Tailwind 4 upgrade as a separate milestone to prevent unintended styling and print regressions.
