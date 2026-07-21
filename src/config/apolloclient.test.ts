import { describe, it, expect } from 'vitest';

import { isAuthError } from './apolloclient';

/**
 * `isAuthError` decides whether a failed operation should renew-and-replay. It is deliberately
 * STRICT: a false positive spends the single-use renewal token on a replay that fails identically,
 * and (combined with a stale token) can log out a live session. These tests lock in that only a real
 * 401 or an explicit UNAUTHENTICATED code qualify — never message text.
 */
describe('isAuthError', () => {
  it('is true for a network 401', () => {
    expect(isAuthError({ statusCode: 401 }, undefined)).toBe(true);
  });

  it('is true for an explicit UNAUTHENTICATED GraphQL extension code', () => {
    expect(isAuthError(null, [{ extensions: { code: 'UNAUTHENTICATED' } }])).toBe(true);
  });

  it('is false for non-401 network errors (500)', () => {
    expect(isAuthError({ statusCode: 500 }, undefined)).toBe(false);
  });

  it('is false for a permission-denied GraphQL error whose message merely says "unauthorized"', () => {
    // ordinary authorization failure (e.g. Staff hitting an admin field) must NOT trigger a renewal
    expect(isAuthError(null, [{ message: 'You are unauthorized to access this resource' }])).toBe(false);
  });

  it('is false when a message merely contains the substring "401"', () => {
    expect(isAuthError({ statusCode: 200, message: 'JSON parse error at position 401' }, undefined)).toBe(false);
  });

  it('is false when there is neither a network error nor GraphQL errors', () => {
    expect(isAuthError(null, null)).toBe(false);
  });

  it('is false for a GraphQL error with an unrelated extension code', () => {
    expect(isAuthError(null, [{ extensions: { code: 'BAD_USER_INPUT' }, message: 'bad input' }])).toBe(false);
  });
});
