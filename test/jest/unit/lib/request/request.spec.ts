const mockNeedleRequest = jest.fn();

import {
  makeRequest,
  sanitizePayloadForLog,
  sanitizeUrlForLog,
} from '../../../../../src/lib/request/request';
import { Payload } from '../../../../../src/lib/request/types';

jest.mock('needle', () => {
  return {
    request: mockNeedleRequest,
  };
});

describe('request logging sanitization', () => {
  it('sanitizes credentials in URLs', () => {
    expect(sanitizeUrlForLog('http://user:pass@proxy.example.com:8080')).toBe(
      'http://redacted:redacted@proxy.example.com:8080/',
    );
    expect(sanitizeUrlForLog('https://example.com/api/v1')).toBe(
      'https://example.com/api/v1',
    );
  });

  it('redacts sensitive headers in payload', () => {
    const payload: Payload = {
      method: 'get',
      body: null,
      url: 'https://example.com',
      headers: {
        authorization: 'token 12345',
        'X-Api-Key': 'secret-key',
        'content-type': 'application/json',
      },
    };
    const sanitized = sanitizePayloadForLog(payload);
    expect(sanitized.headers?.authorization).toBe('[REDACTED]');
    expect(sanitized.headers?.['X-Api-Key']).toBe('[REDACTED]');
    expect(sanitized.headers?.['content-type']).toBe('application/json');
    expect(payload.headers?.authorization).toBe('token 12345');
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
