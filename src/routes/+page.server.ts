import { redirect } from '@sveltejs/kit';
import profileEn from '$lib/data/profile_en.json';
import profileTh from '$lib/data/profile_th.json';
import { todayInBangkok } from '$lib/dates';
import { localeOf } from '$lib/ui';
import { visibleProfile } from '$lib/server/profile';
import {
  validateAccessToken,
  createSessionToken,
  verifySessionToken,
  recordAccessLog,
  getPrivateAddress
} from '$lib/server/access/baserow';
import type { PageServerLoad } from './$types';
import type { IProfileResp } from '../types';

export const load: PageServerLoad = async ({ url, cookies }) => {
  const token = url.searchParams.get('token');

  // Query-string token authorization flow
  if (token) {
    const { valid, grantId, reason } = await validateAccessToken(token);

    // Record access event in Baserow before redirecting
    await recordAccessLog({
      grantId,
      result: valid ? 'authorized' : 'denied',
      reason
    });

    if (valid) {
      cookies.set('resume_session', createSessionToken(grantId, 3600), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 3600
      });
    }

    // Redirect to clean URL without the token parameter
    const cleanUrl = new URL(url);
    cleanUrl.searchParams.delete('token');
    const target = cleanUrl.pathname + (cleanUrl.search || '');
    throw redirect(303, target || '/');
  }

  // Session verification
  const sessionCookie = cookies.get('resume_session');
  const session = verifySessionToken(sessionCookie);
  const isAuthorized = session.valid;

  const lang = localeOf(url.searchParams.get('lang'));
  const source = (lang === 'th' ? profileTh : profileEn) as IProfileResp;

  let privateAddress = undefined;
  if (isAuthorized) {
    privateAddress = await getPrivateAddress(lang);
  }

  const profile = visibleProfile(source, isAuthorized, privateAddress);

  return {
    profile,
    lang,
    today: todayInBangkok(),
    isAuthorized
  };
};
