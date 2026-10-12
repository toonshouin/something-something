import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { certificationStatus, formatDate, toISODate } from '../../src/lib/dates.ts';
import { certificatePdf, externalUrl } from '../../src/lib/urls.ts';
import { visibleProfile } from '../../src/lib/server/profile.ts';

const load = (lang: 'en' | 'th') => JSON.parse(readFileSync(new URL(`../../src/lib/data/profile_${lang}.json`, import.meta.url), 'utf8'));

test('English and Thai profiles keep the same schema and item counts', () => {
	const en = load('en');
	const th = load('th');
	assert.deepEqual(Object.keys(en.headers).sort(), Object.keys(th.headers).sort());
	for (const field of ['projects', 'technologies', 'workExperiences', 'educations', 'certifications', 'interests', 'positions']) {
		assert.equal(en[field].length, th[field].length, field);
	}
});

test('certificate dates are strict ISO values and format in Gregorian and Buddhist calendars', () => {
	for (const lang of ['en', 'th'] as const) for (const cert of load(lang).certifications) assert.match(cert.date, /^\d{4}-\d{2}-\d{2}$/);
	assert.equal(toISODate('29 February 2024'), '2024-02-29');
	assert.equal(toISODate('29 February 2023'), undefined);
	assert.equal(toISODate('17 กันยายน 2569'), '2026-09-17');
	assert.equal(formatDate('2026-09-17', 'en'), '17 September 2026');
	assert.match(formatDate('2026-09-17', 'th'), /^17 กันยายน 2569$/);
});

test('expiration status uses an inclusive boundary and handles missing or malformed values', () => {
	assert.equal(certificationStatus('2026-10-12', '2026-10-12'), 'valid');
	assert.equal(certificationStatus('2026-10-11', '2026-10-12'), 'expired');
	assert.equal(certificationStatus(undefined, '2026-10-12'), 'unavailable');
	assert.equal(certificationStatus('bad', '2026-10-12'), 'unavailable');
	assert.equal(certificationStatus('2026-01-01', '2025-01-01', '2025-06-01'), 'notYetValid');
});

test('URL helpers normalize HTTPS shorthand and reject unsafe input', () => {
	assert.equal(externalUrl('example.com/path'), 'https://example.com/path');
	assert.equal(externalUrl('javascript:alert(1)'), undefined);
	assert.equal(externalUrl('http://example.com'), undefined);
	assert.equal(externalUrl('//example.com'), undefined);
	assert.equal(certificatePdf('certificate/pdf/test-file.pdf'), '/certificate/pdf/test-file.pdf');
	assert.equal(certificatePdf('../secret.pdf'), undefined);
});

test('public profiles remove every hidden entry and preserve certificate paths', () => {
	const source = load('en');
	const result = visibleProfile(source, false);
	assert.equal(result.projects.some((item: { hide?: boolean }) => item.hide), false);
	assert.equal(result.educations.some((item: { hide?: boolean }) => item.hide), false);
	assert.equal(typeof result.intro.location === 'string' ? false : result.intro.location.hidden, true);
	assert.deepEqual(result.certifications.map((item: { url?: string }) => item.url).filter(Boolean), source.certifications.map((item: { url?: string }) => item.url).filter(Boolean));
});

test('Certiport portal and verification code match in both locales', () => {
	for (const lang of ['en', 'th'] as const) {
		const cert = load(lang).certifications.find((item: { verificationCode?: string }) => item.verificationCode);
		assert.equal(cert.verificationCode, 'rkeV-u8N2');
		assert.equal(new URL(cert.verificationUrl).hostname, 'verify.certiport.com');
		assert.equal(cert.verificationKind, 'portal');
		assert.equal(cert.validUntil, '2031-08-13');
	}
});

test('known certificate expiry dates match in both locales', () => {
	for (const lang of ['en', 'th'] as const) {
		const certs = load(lang).certifications;
		assert.equal(certs.find((item: { name: string }) => item.name.includes('LCCE')).validUntil, '2029-06-10');
		assert.equal(certs.find((item: { name: string }) => item.name.includes('Generative AI Foundations')).validUntil, '2031-08-13');
	}
});

test('Microsoft credentials retain their distinct verification links in both locales', () => {
	for (const lang of ['en', 'th'] as const) {
		const certs = load(lang).certifications;
		const activeDirectory = certs.find((item: { name: string }) => item.name.includes('Active Directory'));
		const entra = certs.find((item: { name: string }) => item.name.includes('Identities and Access'));
		assert.equal(activeDirectory.verificationUrl, 'https://learn.microsoft.com/th-th/users/toonoeichi/credentials/f37349c40f143b52');
		assert.equal(
			entra.verificationUrl,
			'https://learn.microsoft.com/api/credentials/share/en-us/toonoeichi/4447968CAD30A109?sharingId=557C1B61BE7EE12F'
		);
		assert.notEqual(activeDirectory.verificationUrl, entra.verificationUrl);
	}
});

test('public profile JSON files contain only province and country, never street address', () => {
	for (const lang of ['en', 'th'] as const) {
		const profile = load(lang);
		const location = profile.intro.location;
		assert.equal(typeof location, 'object');
		assert.ok(location.province, 'province should exist');
		assert.ok(location.country, 'country should exist');
		assert.equal(location.house_no, undefined, 'house_no must not exist in public file');
		assert.equal(location.moo, undefined, 'moo must not exist in public file');
		assert.equal(location.soi, undefined, 'soi must not exist in public file');
		assert.equal(location.village, undefined, 'village must not exist in public file');
		assert.equal(location.road, undefined, 'road must not exist in public file');
		assert.equal(location.zip_code, undefined, 'zip_code must not exist in public file');
	}
});

test('exactly two certifications have validUntil in both locales', () => {
	for (const lang of ['en', 'th'] as const) {
		const certs = load(lang).certifications;
		const expiringCerts = certs.filter((c: { validUntil?: string }) => Boolean(c.validUntil));
		assert.equal(expiringCerts.length, 2, 'exactly two certifications must have validUntil');
		const names = expiringCerts.map((c: { name: string }) => c.name);
		assert.ok(names.some((n: string) => n.includes('Generative AI Foundations')));
		assert.ok(names.some((n: string) => n.includes('LCCE')));
	}
});
