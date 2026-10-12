const mockNeedleRequest = jest.fn();

import {
  makeRequest,
  sanitizePayloadForLog,
} from '../../../../../src/lib/request/request';
import { Payload } from '../../../../../src/lib/request/types';

jest.mock('needle', () => {
  return {
    request: mockNeedleRequest,
  };
});

describe('sanitizePayloadForLog', () => {
  it('redacts sensitive headers, url params, and query string object properties', () => {
    const payload: Payload = {
      body: {},
      method: 'get',
      url: 'https://example.com/api?token=secret123&other=safe',
      headers: {
        authorization: 'Bearer token123',
        'x-api-key': 'key123',
        'content-type': 'application/json',
      },
      qs: {
        token: 'secret_qs',
        apiKey: 'key_qs',
        user: 'john_doe',
      },
    };

    const sanitized = sanitizePayloadForLog(payload);

    expect(sanitized.headers).toEqual({
      authorization: '[REDACTED]',
      'x-api-key': '[REDACTED]',
      'content-type': 'application/json',
    });

    expect(sanitized.qs).toEqual({
      token: '[REDACTED]',
      apiKey: '[REDACTED]',
      user: 'john_doe',
    });

    expect(sanitized.url).toContain('token=%5BREDACTED%5D');
    expect(sanitized.url).toContain('other=safe');
  });

  it('handles null/undefined payload gracefully', () => {
    expect(sanitizePayloadForLog(null as any)).toBeNull();
    expect(sanitizePayloadForLog(undefined as any)).toBeUndefined();
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
