import assert from 'node:assert/strict';
import test from 'node:test';
import { createSessionToken, verifySessionToken } from '../../src/lib/server/access/baserow.ts';

test('session token signs and verifies grantId correctly', () => {
  const token = createSessionToken('recruiter_agoda', 3600);
  const result = verifySessionToken(token);
  assert.equal(result.valid, true);
  assert.equal(result.grantId, 'recruiter_agoda');
});

test('session token rejects expired tokens', () => {
  const expiredToken = createSessionToken('recruiter_expired', -10);
  const result = verifySessionToken(expiredToken);
  assert.equal(result.valid, false);
});

test('session token rejects tampered payload or signature', () => {
  const validToken = createSessionToken('valid_grant', 3600);
  const parts = validToken.split('.');

  // Tamper with grantId
  const tamperedGrant = `tampered.${parts[1]}.${parts[2]}`;
  assert.equal(verifySessionToken(tamperedGrant).valid, false);

  // Tamper with signature
  const tamperedSig = `${parts[0]}.${parts[1]}.badsignature`;
  assert.equal(verifySessionToken(tamperedSig).valid, false);

  // Empty or invalid formats
  assert.equal(verifySessionToken('').valid, false);
  assert.equal(verifySessionToken('invalid').valid, false);
  assert.equal(verifySessionToken(null).valid, false);
});
