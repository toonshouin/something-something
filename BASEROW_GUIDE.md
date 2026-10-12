# Baserow Setup & Schema Guide for Dynamic CV Access

This guide explains how to set up your self-hosted (or cloud) Baserow database to manage private CV addresses dynamically, validate access tokens, and record access audit logs.

---

## 1. Overview & Architecture

The Resume/CV application protects personal street addresses by redacting them by default:
- **Public visitors:** See only `Province, Country` (e.g., `Nonthaburi, Thailand`).
- **Authorized visitors:** Those with a valid token (e.g. `https://resume.example.com/?token=recruiter-token-123`) receive an HTTP 303 redirect to the clean URL, an `HttpOnly` signed session cookie (`resume_session`), and the full street address dynamically loaded from Baserow.

```
                    ┌─────────────────────────┐
                    │      Public Visitor     │
                    └────────────┬────────────┘
                                 │
                                 ▼
                     Province, Country Only
                     (Zero street address in
                      public JSON or git)

                    ┌─────────────────────────┐
                    │ Authorized Visitor URL  │
                    │   (?token=recruiter123) │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    SvelteKit Server Load Function
                    ┌─────────────────────────┐
                    │ 1. Validate Token       │──► Check Baserow / SECRET_TOKEN
                    │ 2. Audit Log            │──► Non-blocking log to Baserow
                    │ 3. Set Session Cookie   │──► HMAC-SHA256 HttpOnly cookie
                    │ 4. HTTP 303 Redirect    │──► Strips ?token from URL
                    └────────────┬────────────┘
                                 │
                                 ▼
                    Fetch Full Address from Baserow
                    (Cached in-memory for 5 minutes)
```

---

## 2. Table Schemas

Create a Database named **"Resume CV"** in your Baserow workspace, then create the following 3 tables:

### Table 1: `private_address`
Stores your full address for Thai and English locales. When you move or update your address, simply edit this table in Baserow — changes will reflect on the CV within 5 minutes without redeploying.

| Field Name | Baserow Field Type | Notes / Constraints | Example Value (TH) | Example Value (EN) |
| :--- | :--- | :--- | :--- | :--- |
| **`locale`** | Single select / Single line text | `th` or `en` (Primary key or identifier) | `th` | `en` |
| **`house_no`** | Single line text | House / building number | `123/45` | `123/45` |
| **`moo`** | Single line text | Village number (Moo) (optional) | `5` | `5` |
| **`soi`** | Single line text | Lane / Soi (optional) | `สุขาภิบาล 1` | `Sukhaphiban 1` |
| **`village`** | Single line text | Housing village / condo name (optional) | `บ้านสวน` | `Baan Suan` |
| **`road`** | Single line text | Road / Avenue (optional) | `แจ้งวัฒนะ` | `Chaeng Watthana Rd.` |
| **`sub_district`** | Single line text | Tambon / Khwaeng | `บางตลาด` | `Bang Talat` |
| **`district`** | Single line text | Amphoe / Khet | `ปากเกร็ด` | `Pak Kret` |
| **`province`** | Single line text | Changwat / Province | `นนทบุรี` | `Nonthaburi` |
| **`zip_code`** | Single line text | Postal code | `11120` | `11120` |
| **`country`** | Single line text | Country name | `ไทย` | `Thailand` |
| **`is_active`** | Boolean (Checkbox) | Set to `true` / checked to serve this record | `true` | `true` |

> [!TIP]
> If a field (such as `moo` or `village`) does not apply to your address, leave it blank or empty. The CV formatting logic automatically skips empty fields.

---

### Table 2: `access_grants`
Manages granular access tokens for specific recruiters, hiring managers, or companies.

| Field Name | Baserow Field Type | Notes / Constraints | Example Value |
| :--- | :--- | :--- | :--- |
| **`token`** | Single line text | The secret token passed in `?token=...` | `recruiter-google-2026` |
| **`label`** | Single line text | Friendly name identifying who has this token | `Google Recruiter Team` |
| **`is_active`** | Boolean (Checkbox) | Toggle to revoke access instantly | `true` |
| **`expires_at`** | Date / Single line text | ISO 8601 expiration date or timestamp (optional) | `2026-12-31T23:59:59Z` |
| **`use_count`** | Number (Integer) | Track total authorizations (optional) | `1` |

> [!NOTE]
> In addition to grants in this table, you can set a global master token via the `SECRET_TOKEN` environment variable.

---

### Table 3: `access_logs`
Records an audit trail of access attempts. The CV application sends this non-blocking (fire-and-forget with a 2-second timeout), so visitor page load is never slowed down.

| Field Name | Baserow Field Type | Notes / Constraints |
| :--- | :--- | :--- |
| **`grant_id`** | Single line text | Token ID or token label used |
| **`result`** | Single line text / Single select | `'authorized'` or `'denied'` |
| **`reason`** | Single line text | Detail message (e.g. `'baserow_grant'`, `'invalid_token'`, `'expired'`) |
| **`created_at`** | Date (with time) / Single line text | Timestamp of access attempt |

---

## 3. Creating a Database Token

To allow your SvelteKit server to communicate with Baserow:

1. Click your user avatar in the top-left of Baserow and select **Settings**.
2. Go to **Database Tokens**.
3. Click **Create token +**:
   - **Name:** `CV Application Token`
   - **Workspace:** Select your workspace containing the database.
4. Set Permissions:
   - You can give full database access to the "Resume CV" database, or granular permissions:
     - `private_address`: **Read**
     - `access_grants`: **Read** (and optional Update for `use_count`)
     - `access_logs`: **Create**
5. Copy the generated token string (e.g. `Token ABC123xyz...`).

---

## 4. Finding Table IDs

In Baserow, every table has a numeric ID visible in the browser address bar when viewing the table:
```
https://baserow.yourdomain.com/database/123/table/456
                                                   ▲
                                             This is Table ID (456)
```

1. Click on `private_address` table -> Note the table ID (e.g., `456`).
2. Click on `access_grants` table -> Note the table ID (e.g., `457`).
3. Click on `access_logs` table -> Note the table ID (e.g., `458`).

---

## 5. Environment Variables Configuration

Set these variables in your deployment environment (Vercel Project Settings > Environment Variables or local `.env`):

```bash
# Baserow API Configuration
BASEROW_API_URL="https://baserow.yourdomain.com"
BASEROW_DATABASE_TOKEN="your_baserow_database_token_here"
BASEROW_ADDRESS_TABLE_ID="456"
BASEROW_GRANT_TABLE_ID="457"
BASEROW_LOG_TABLE_ID="458"

# Security & Session Secrets
SECRET_TOKEN="your_master_fallback_secret_token"
SESSION_SECRET="generate_a_random_32_character_hex_or_string"

# Optional: Offline Address Fallback (JSON string)
# Used only if Baserow is unreachable or offline
PRIVATE_ADDRESS_JSON='{"en":{"house_no":"123","road":"Main Rd","sub_district":"...","district":"...","province":"Nonthaburi","zip_code":"11120","country":"Thailand"},"th":{"house_no":"123","road":"ถ.หลัก","sub_district":"...","district":"...","province":"นนทบุรี","zip_code":"11120","country":"ไทย"}}'
```

---

## 6. How It Works in Production

1. **Token Access:**
   When a recruiter visits `https://your-resume.vercel.app/?token=recruiter-google-2026`:
   - The SvelteKit server load function receives `token`.
   - It checks Baserow's `access_grants` table (or fallback `SECRET_TOKEN`).
   - If valid, it records an `authorized` entry in `access_logs`.
   - It sets an `HttpOnly`, `SameSite=Lax`, signed session cookie (`resume_session`).
   - It responds with an **HTTP 303 redirect** to `https://your-resume.vercel.app/` without the query token.
   - The browser URL is immediately clean, preventing token leakage in browser history, bookmarks, or referrer headers.

2. **Session Persistence:**
   - On all subsequent requests (including switching between `[EN]` and `[TH]`), the valid session cookie keeps the full address unlocked.
   - The session lasts 1 hour by default (`maxAge: 3600`).

3. **Dynamic Editing:**
   - To update your address, open Baserow in your browser, update the row in `private_address`.
   - The CV server caches the address in-memory for 5 minutes. After 5 minutes, it automatically fetches the new address.
   - **Zero code changes, zero git commits, and zero redeployments are needed!**

4. **Fail-Safe Fallback:**
   - If your Baserow instance is down or unreachable:
     - The server logs a warning and falls back to `PRIVATE_ADDRESS_JSON` (if configured in Vercel env).
     - If neither is available, it gracefully returns public `Province, Country`.
     - The application never crashes or displays broken pages.
