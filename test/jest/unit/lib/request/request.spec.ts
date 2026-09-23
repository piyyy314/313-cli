const mockNeedleRequest = jest.fn();

import {
  makeRequest,
  sanitizeUrlForLog,
  sanitizePayloadForLog,
} from '../../../../../src/lib/request/request';
import { Payload } from '../../../../../src/lib/request/types';

jest.mock('needle', () => {
  return {
    request: mockNeedleRequest,
  };
});

describe('request log sanitization', () => {
  it('sanitizeUrlForLog redacts username and password in proxy/request URLs', () => {
    const rawUrl = 'http://user:secret123@proxy.example.com:8080/path';
    const sanitized = sanitizeUrlForLog(rawUrl);
    expect(sanitized).not.toContain('user');
    expect(sanitized).not.toContain('secret123');
    expect(sanitized).toContain('redacted:redacted@proxy.example.com:8080');
  });

  it('sanitizeUrlForLog leaves URLs without credentials intact', () => {
    const rawUrl = 'https://api.snyk.io/v1/test';
    expect(sanitizeUrlForLog(rawUrl)).toBe(rawUrl);
  });

  it('sanitizePayloadForLog redacts sensitive headers and URL credentials', () => {
    const payload: Payload = {
      url: 'https://admin:pass@snyk.io/api',
      body: {},
      method: 'get',
      headers: {
        authorization: 'Bearer token-123',
        'x-api-key': 'secret-key',
        'content-type': 'application/json',
      },
    };
    const sanitized = sanitizePayloadForLog(payload);
    expect(sanitized.url).not.toContain('pass');
    expect(sanitized.headers?.['authorization']).toBe('[REDACTED]');
    expect(sanitized.headers?.['x-api-key']).toBe('[REDACTED]');
    expect(sanitized.headers?.['content-type']).toBe('application/json');
    // Ensure original payload object was not mutated
    expect(payload.headers?.['authorization']).toBe('Bearer token-123');
  });
});

describe('needle header auth failed', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('throws missing api token on auth failed marker header', async () => {
    mockNeedleRequest.mockImplementation((method, url, data, options, fn) => {
      fn(null, { headers: { 'snyk-auth-failed': 'true' } }, {});
    });
    await expect(
      makeRequest({ url: 'https://example.com' } as Payload),
    ).rejects.toThrow(
      expect.objectContaining({
        message:
          '`snyk` requires an authenticated account. Please run `snyk auth` and try again.',
      }),
    );
  });
});
