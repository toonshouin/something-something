# Security audit

Audit target: baseline commit `3020126`, with fixes reviewed in the working tree. Profile: standard, source-based. The application has one unauthenticated SSR route, repository-controlled JSON and static files, and no database, actions, uploads, sessions, or API endpoints.

## Confirmed repairs

| Area | Baseline evidence | Remediation and validation |
| --- | --- | --- |
| Address access token | `src/routes/+page.server.ts` contained a committed fallback secret, so anyone reading source could request the detailed address when no deployment secret was set. | Removed the fallback, require a non-empty `SECRET_TOKEN`, and compare equal-length values with `timingSafeEqual`. Unit coverage verifies public redaction. |
| Token-bearing response disclosure | The loader accepted a query token and language links propagated it, while the baseline supplied no cache or referrer policy. | Responses now use `private, no-store` and `Referrer-Policy: no-referrer`. Token-preserving locale navigation remains for the authorized workflow. |
| URL schemes | Repository strings flowed directly into `href`, and project shorthand was always prefixed with `https://`. | A shared presentation helper accepts HTTPS and known local PDF paths, normalizes shorthand hosts, and rejects credentials, control characters, protocol-relative URLs, traversal, HTTP, and active schemes. Unit tests cover unsafe inputs. |
| Browser hardening | No source-defined CSP or defensive response headers. | Added SvelteKit nonce/hash-aware CSP plus frame, MIME-sniffing and Permissions Policy headers. Browser tests load under the policy. |
| Supply chain | Conflicting npm/pnpm locks and adapter-auto installed a deployment adapter at build time. | One npm lockfile, explicit adapter, pinned Node major, reproducible `npm ci`; `npm audit --omit=dev` reports zero vulnerabilities. |

## Trust boundaries and residual risk

The token protects the HTTP-rendered street address from ordinary visitors. It does not protect the address in a public source repository or its Git history, and it does not protect PDFs in `static/certificate/pdf`. Repository maintainers already control rendered content, so unsafe repository content is a supply-chain/content-review concern rather than an unauthenticated XSS boundary in this architecture.

Query-string secrets may still be recorded by browser history, Vercel request logs, analytics added later, or copied URLs. The response policies reduce browser referrer and shared-cache leakage but cannot control provider logging. Validate logging and repository visibility in the deployment owner account. No live service, Vercel account, secrets, or external credential provider was probed.

The full Cloudflare skill artifacts, including the machine-readable coverage ledger and final verification status, are stored outside the repository at `/home/belno/security-audit-skill/something-something/run-1`. This file summarizes repository-relevant results and does not claim complete security.
