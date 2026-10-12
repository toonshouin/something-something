# Content and configuration migration

Existing profile JSON remains compatible. Human-readable date strings continue to render through the compatibility parser, but new or edited dates should use strict `YYYY-MM-DD` values.

Certificate entries support these optional fields:

| Field | Meaning |
| --- | --- |
| `date` | Issue date, preferably ISO 8601 |
| `validUntil` | Inclusive expiration date in ISO 8601 |
| `issuer` | Issuing organization when confirmed |
| `credentialType` | A reliable credential category or type |
| `verificationUrl` | HTTPS credential link or portal |
| `verificationKind` | `direct` or `portal`; omitted uses a neutral label |
| `verificationCode` | Code supplied by the issuer |
| `url` | Existing local PDF path or HTTPS details URL |

Missing expiration data displays “Expiration date unavailable”; it is never inferred. A malformed date keeps its original text and produces an unavailable status. Expiration uses one Bangkok date snapshot from the server, so hydration cannot change status at midnight.

Deployment now requires Node 22 and npm. Configure `SECRET_TOKEN` in Vercel only if detailed-address access is needed. There is no fallback secret.
