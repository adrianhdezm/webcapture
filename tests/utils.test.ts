import { describe, expect, it } from 'vitest';

import { parseBasicAuthHeader, safeEqual } from '../src/utils.js';

describe('utils', () => {
  describe('parseBasicAuthHeader', () => {
    it('returns null when header is missing', () => {
      expect(parseBasicAuthHeader(undefined)).toBeNull();
    });

    it('returns null for non-Basic scheme', () => {
      const bearer = Buffer.from('user:pass').toString('base64');
      expect(parseBasicAuthHeader(`Bearer ${bearer}`)).toBeNull();
    });

    it('returns null when decoded value has no separator', () => {
      const encoded = Buffer.from('userpass').toString('base64');
      expect(parseBasicAuthHeader(`Basic ${encoded}`)).toBeNull();
    });

    it('parses valid basic auth credentials', () => {
      const encoded = Buffer.from('user:pass:extra').toString('base64');
      expect(parseBasicAuthHeader(`Basic ${encoded}`)).toEqual({
        username: 'user',
        password: 'pass:extra'
      });
    });
  });

  describe('safeEqual', () => {
    it('returns true for equal values', () => {
      expect(safeEqual('secret', 'secret')).toBe(true);
    });

    it('returns false for different values', () => {
      expect(safeEqual('secret', 'secrex')).toBe(false);
    });

    it('returns false when lengths differ', () => {
      expect(safeEqual('secret', 'secret-long')).toBe(false);
    });
  });
});
