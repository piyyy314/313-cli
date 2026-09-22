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

describe('sanitizePayloadForLog', () => {
  it('redacts sensitive headers from request payload', () => {
    const payload: Payload = {
      url: 'https://api.snyk.io',
      method: 'get',
      body: {},
      headers: {
        authorization: 'token 12345',
        'x-api-key': 'secret-key',
        'session-token': 'session-123',
        cookie: 'sessionid=xyz',
        'content-type': 'application/json',
      },
    };

    const sanitized = sanitizePayloadForLog(payload);

    expect(sanitized.headers).toEqual({
      authorization: '[REDACTED]',
      'x-api-key': '[REDACTED]',
      'session-token': '[REDACTED]',
      cookie: '[REDACTED]',
      'content-type': 'application/json',
    });
    expect(payload.headers?.authorization).toBe('token 12345');
  });

  it('handles payload without headers gracefully', () => {
    const payload = { url: 'https://api.snyk.io' } as Payload;
    expect(sanitizePayloadForLog(payload)).toEqual(payload);
  });
});

describe('sanitizeUrlForLog', () => {
  it('redacts username and password from basic auth URLs', () => {
    const urlWithAuth = 'http://admin:secret123@proxy.internal:8080/path';
    const sanitized = sanitizeUrlForLog(urlWithAuth);
    expect(sanitized).toBe(
      'http://redacted:redacted@proxy.internal:8080/path',
    );
  });

  it('returns clean URLs unchanged', () => {
    const cleanUrl = 'https://api.snyk.io/v1/test';
    expect(sanitizeUrlForLog(cleanUrl)).toBe(cleanUrl);
  });
});
