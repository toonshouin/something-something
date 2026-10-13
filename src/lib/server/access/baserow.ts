import { createHmac, timingSafeEqual } from 'node:crypto';
import { existsSync } from 'node:fs';
import { defaultPrivateAddress, type AddressDetails } from '../privateAddress.ts';

// Automatically load local .env if present and running under Node with loadEnvFile (Node 20+)
try {
  if (typeof process.loadEnvFile === 'function' && existsSync('.env')) {
    process.loadEnvFile();
  }
} catch {
  // Ignore in production or environments without .env
}

export interface AccessLogEvent {
  grantId: string;
  result: 'authorized' | 'denied' | 'expired';
  reason: string;
}

export interface ValidationResult {
  valid: boolean;
  grantId: string;
  reason: string;
}

// In-memory cache for Baserow private address (5-minute TTL)
let cachedAddress: {
  en?: AddressDetails;
  th?: AddressDetails;
  expiresAt: number;
} | null = null;

function getEnv(key: string): string | undefined {
  return process.env[key];
}

function getAuthHeader(token: string): string {
  return token.startsWith('Token ') ? token : `Token ${token}`;
}

function getBaseHeaders(dbToken: string): Record<string, string> {
  const headers: Record<string, string> = {
    Authorization: getAuthHeader(dbToken),
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'User-Agent': 'Mozilla/5.0 (compatible; ResumeApp/1.0; +https://resume.toonshou.in)'
  };

  const cfClientId = getEnv('CF_ACCESS_CLIENT_ID');
  const cfClientSecret = getEnv('CF_ACCESS_CLIENT_SECRET');
  if (cfClientId && cfClientSecret) {
    headers['CF-Access-Client-Id'] = cfClientId;
    headers['CF-Access-Client-Secret'] = cfClientSecret;
  }

  const customHeadersJson = getEnv('BASEROW_CUSTOM_HEADERS');
  if (customHeadersJson) {
    try {
      const parsed = JSON.parse(customHeadersJson);
      Object.assign(headers, parsed);
    } catch {
      // Ignore parse failure
    }
  }

  return headers;
}

function getSigningSecret(): string {
  return getEnv('SESSION_SECRET') || getEnv('SECRET_TOKEN') || 'resume-fallback-secret-key-32-chars-minimum';
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

/**
 * Creates a cryptographically signed session token.
 * Format: <grantId>.<expiryTimestamp>.<hmacSignature>
 */
export function createSessionToken(grantId: string, ttlSeconds = 3600): string {
  const secret = getSigningSecret();
  const expiry = Date.now() + ttlSeconds * 1000;
  const payload = `${encodeURIComponent(grantId)}.${expiry}`;
  const signature = createHmac('sha256', secret).update(payload).digest('hex');
  return `${payload}.${signature}`;
}

/**
 * Verifies a signed session token in constant time.
 */
export function verifySessionToken(token: string | undefined | null): { valid: boolean; grantId?: string } {
  if (!token) return { valid: false };
  const parts = token.split('.');
  if (parts.length !== 3) return { valid: false };

  const [encodedGrantId, expiryStr, signature] = parts;
  const expiry = Number(expiryStr);
  if (!Number.isFinite(expiry) || expiry < Date.now()) {
    return { valid: false };
  }

  const payload = `${encodedGrantId}.${expiryStr}`;
  const secret = getSigningSecret();
  const expectedSig = createHmac('sha256', secret).update(payload).digest('hex');

  if (!safeEqual(signature, expectedSig)) {
    return { valid: false };
  }

  return { valid: true, grantId: decodeURIComponent(encodedGrantId) };
}

/**
 * Validates an access token against environment SECRET_TOKEN or Baserow access_grants table.
 */
export async function validateAccessToken(token: string | null | undefined): Promise<ValidationResult> {
  if (!token) {
    return { valid: false, grantId: 'anonymous', reason: 'missing_token' };
  }

  // 1. Primary check: SECRET_TOKEN environment variable (constant-time)
  const secretToken = getEnv('SECRET_TOKEN');
  if (secretToken && safeEqual(token, secretToken)) {
    return { valid: true, grantId: 'primary_secret', reason: 'valid_token' };
  }

  // 2. Baserow dynamic grants table check (if configured)
  const apiUrl = getEnv('BASEROW_API_URL')?.replace(/\/+$/, '');
  const dbToken = getEnv('BASEROW_DATABASE_TOKEN');
  const grantTableId = getEnv('BASEROW_GRANT_TABLE_ID');

  if (apiUrl && dbToken && grantTableId) {
    try {
      const url = `${apiUrl}/api/database/rows/table/${grantTableId}/?user_field_names=true&filter__token__equal=${encodeURIComponent(token)}&filter__is_active__boolean=true`;
      const res = await fetch(url, {
        headers: getBaseHeaders(dbToken),
        signal: AbortSignal.timeout(3500)
      });

      if (res.ok) {
        const data = await res.json();
        const row = data.results?.find((r: { token?: string }) => safeEqual(String(r.token || ''), token));
        if (row) {
          const grantId = String(row.label || row.grant_id || 'baserow_grant');
          if (row.expires_at) {
            const exp = Date.parse(row.expires_at);
            if (!Number.isNaN(exp) && exp < Date.now()) {
              return { valid: false, grantId, reason: 'token_expired' };
            }
          }

          // Increment use_count if permissions permit
          await incrementGrantUseCount(row.id, row.use_count);

          return { valid: true, grantId, reason: 'valid_token' };
        }
      } else {
        const errText = await res.text().catch(() => '');
        if (errText.includes('Just a moment...') || errText.includes('challenges.cloudflare.com')) {
          console.warn(`[Baserow Token Validation] Table ${grantTableId} blocked by Cloudflare Managed Challenge (WAF/Bot Fight Mode) on ${apiUrl}.`);
        } else {
          console.warn(`[Baserow Token Validation] Table ${grantTableId} returned ${res.status}: ${errText}`);
        }
      }
    } catch (err) {
      console.warn('[Baserow Token Validation Exception]:', err);
    }
  }

  return { valid: false, grantId: 'unknown', reason: 'invalid_secret' };
}

/**
 * Increments use_count on an access grant row if the database token has Update permission on access_grants.
 */
export async function incrementGrantUseCount(rowId: number, currentUseCount: string | number | undefined): Promise<void> {
  const apiUrl = getEnv('BASEROW_API_URL')?.replace(/\/+$/, '');
  const dbToken = getEnv('BASEROW_DATABASE_TOKEN');
  const grantTableId = getEnv('BASEROW_GRANT_TABLE_ID');

  if (!apiUrl || !dbToken || !grantTableId || typeof rowId !== 'number') return;

  const count = typeof currentUseCount === 'number'
    ? currentUseCount
    : parseInt(String(currentUseCount || '0'), 10) || 0;

  const nextCount = count + 1;
  const payloadValue = typeof currentUseCount === 'string' ? String(nextCount) : nextCount;

  try {
    const patchUrl = `${apiUrl}/api/database/rows/table/${grantTableId}/${rowId}/?user_field_names=true`;
    const res = await fetch(patchUrl, {
      method: 'PATCH',
      headers: getBaseHeaders(dbToken),
      body: JSON.stringify({ use_count: payloadValue }),
      signal: AbortSignal.timeout(3500)
    });

    if (res.ok) {
      console.info(`[Baserow Access Grants] Incremented use_count for grant row ${rowId} to ${nextCount}`);
    } else {
      const errText = await res.text().catch(() => '');
      if (errText.includes('Just a moment...') || errText.includes('challenges.cloudflare.com')) {
        console.warn(`[Baserow Access Grants] Notice: Update use_count blocked by Cloudflare Managed Challenge.`);
      } else {
        console.warn(`[Baserow Access Grants] Notice: Cannot update use_count (${res.status}): ${errText}`);
      }
    }
  } catch (err) {
    console.warn('[Baserow Access Grants] Notice: Exception updating use_count:', err);
  }
}

/**
 * Asynchronously posts an access event to Baserow without blocking the visitor.
 */
export async function recordAccessLog(event: AccessLogEvent): Promise<void> {
  const apiUrl = getEnv('BASEROW_API_URL')?.replace(/\/+$/, '');
  const dbToken = getEnv('BASEROW_DATABASE_TOKEN');
  const logTableId = getEnv('BASEROW_LOG_TABLE_ID');

  if (apiUrl && dbToken && logTableId) {
    try {
      const postUrl = `${apiUrl}/api/database/rows/table/${logTableId}/?user_field_names=true`;
      const body = {
        grant_id: event.grantId,
        result: event.result,
        reason: event.reason,
        created_at: new Date().toISOString()
      };

      const res = await fetch(postUrl, {
        method: 'POST',
        headers: getBaseHeaders(dbToken),
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(3500)
      });

      if (!res.ok) {
        const errorText = await res.text().catch(() => '');
        if (errorText.includes('Just a moment...') || errorText.includes('challenges.cloudflare.com')) {
          console.error(`[Baserow Access Log Error] 403: Blocked by Cloudflare Managed Challenge (WAF/Bot Fight Mode) on ${apiUrl}.`);
        } else {
          console.error(`[Baserow Access Log Error] ${res.status}: ${errorText}`);
        }
      } else {
        console.info(`[Baserow Access Log] Recorded access event: ${event.grantId} (${event.result})`);
      }
    } catch (err) {
      console.error('[Baserow Access Log Exception]:', err);
    }
  } else {
    console.warn('[Baserow Access Log] Incomplete configuration:', {
      apiUrl: !!apiUrl,
      dbToken: !!dbToken,
      logTableId: !!logTableId
    });
  }
}

/**
 * Fetches the private address from Baserow (cached for 5m) or local fallback.
 */
export async function getPrivateAddress(lang: 'en' | 'th'): Promise<AddressDetails> {
  // Check memory cache
  if (cachedAddress && cachedAddress.expiresAt > Date.now() && cachedAddress[lang]) {
    return cachedAddress[lang]!;
  }

  const apiUrl = getEnv('BASEROW_API_URL')?.replace(/\/+$/, '');
  const dbToken = getEnv('BASEROW_DATABASE_TOKEN');
  const addressTableId = getEnv('BASEROW_ADDRESS_TABLE_ID');

  if (apiUrl && dbToken && addressTableId) {
    try {
      const url = `${apiUrl}/api/database/rows/table/${addressTableId}/?user_field_names=true`;
      const res = await fetch(url, {
        headers: getBaseHeaders(dbToken),
        signal: AbortSignal.timeout(3500)
      });

      if (res.ok) {
        const data = await res.json();
        const rows = data.results || [];
        if (Array.isArray(rows) && rows.length > 0) {
          if (!cachedAddress || cachedAddress.expiresAt <= Date.now()) {
            cachedAddress = { expiresAt: Date.now() + 5 * 60 * 1000 };
          }

          for (const row of rows) {
            if (row.is_active === false) continue;
            // Support either locale or lang field name, value might be string or Single Select object { value: 'en' }
            const rawLocale = typeof row.locale === 'object' && row.locale !== null ? row.locale.value : (row.locale || row.lang);
            const rowLocale = String(rawLocale || '').trim().toLowerCase();
            if (rowLocale === 'en' || rowLocale === 'th') {
              cachedAddress[rowLocale as 'en' | 'th'] = {
                house_no: row.house_no || undefined,
                moo: row.moo || undefined,
                soi: row.soi || undefined,
                village: row.village || undefined,
                road: row.road || undefined,
                sub_district: row.sub_district || undefined,
                district: row.district || undefined,
                province: row.province || undefined,
                country: row.country || undefined,
                zip_code: row.zip_code || undefined
              };
            }
          }

          if (cachedAddress[lang]) {
            return cachedAddress[lang]!;
          }
        }
      }
    } catch {
      // Baserow offline or timed out; use fallback
    }
  }

  // Check optional PRIVATE_ADDRESS_JSON environment variable
  const privateAddressJson = getEnv('PRIVATE_ADDRESS_JSON');
  if (privateAddressJson) {
    try {
      const parsed = JSON.parse(privateAddressJson);
      if (parsed[lang]) return parsed[lang];
    } catch {
      // Ignore parse failure
    }
  }

  // Fallback to server-only default
  return defaultPrivateAddress[lang];
}
