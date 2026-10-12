# Deployment Guide (Vercel & Baserow)

## 1. Runtime & Adapter Configuration

The project uses `@sveltejs/adapter-vercel` 6 directly with `runtime: 'nodejs22.x'` in `svelte.config.js`.
- `package.json`, `.nvmrc`, and `.node-version` pin Node 22.
- `vercel.json` selects SvelteKit framework preset, `npm ci`, and the production build.
- The build produces standard Vercel serverless function configurations verified under `.vercel/output/`.

---

## 2. Environment Variables

Configure the following variables in **Vercel Project Settings > Environment Variables** (or `.env` for local testing):

### A. Access Control & Security
| Variable | Required | Description | Example |
| :--- | :--- | :--- | :--- |
| `SECRET_TOKEN` | Recommended | Global fallback token for authorized full-address access | `my-secret-cv-token-2026` |
| `SESSION_SECRET` | Recommended | Key used to sign HMAC-SHA256 session cookies (`resume_session`). Auto-generates random fallback if omitted | `64_char_hex_or_random_secret_string` |
| `PRIVATE_ADDRESS_JSON` | Optional | Offline JSON fallback containing full addresses for TH and EN if Baserow is unreachable | `{"en":{...},"th":{...}}` |

### B. Baserow Database Integration (Dynamic Access & Address)
| Variable | Required | Description | Example |
| :--- | :--- | :--- | :--- |
| `BASEROW_API_URL` | Optional | Base URL of self-hosted or hosted Baserow instance | `https://baserow.yourdomain.com` |
| `BASEROW_DATABASE_TOKEN` | Optional | Database Token generated in Baserow settings | `Token ABC123XYZ...` |
| `BASEROW_ADDRESS_TABLE_ID` | Optional | Table ID for `private_address` | `123` |
| `BASEROW_GRANT_TABLE_ID` | Optional | Table ID for `access_grants` | `124` |
| `BASEROW_LOG_TABLE_ID` | Optional | Table ID for `access_logs` | `125` |

For table schemas and field creation, see [BASEROW_GUIDE.md](./BASEROW_GUIDE.md).

> [!CAUTION]
> Never prefix private access variables with `NEXT_PUBLIC_` or `PUBLIC_`. These variables must remain strictly server-side.

---

## 3. Verified Verification Commands

Run locally before deploying:

```sh
npm ci
npm run check
npm run lint
npm test
npm run test:e2e
npm run build
```

The Node 22 build creates `.vercel/output/functions/![-]/catchall.func/.vc-config.json` with runtime `nodejs22.x` and framework version `2.70.3`.

---

## 4. Privacy & Authorization Behavior

1. **Zero Sensitive Data in Public Repositories:**
   - Neither `src/lib/data/profile_en.json` nor `src/lib/data/profile_th.json` contains street address fields.
   - Public visitors only receive `Province, Country`.
2. **Clean URL Redirect:**
   - When visiting `/?token=<TOKEN>`, the server checks validity against Baserow (and `SECRET_TOKEN`).
   - If valid, it records an audit log, issues an `HttpOnly`, `SameSite=Lax` signed session cookie, and issues an HTTP 303 redirect to the clean URL.
   - The token is immediately stripped from the browser URL bar, preventing leakage in bookmarks, copy-pastes, and referrers.
3. **Resilience & Fallbacks:**
   - If Baserow is down or unconfigured, the app falls back to `PRIVATE_ADDRESS_JSON` (if provided) or public province/country. The site never crashes.
