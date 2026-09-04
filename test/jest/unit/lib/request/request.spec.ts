const mockNeedleRequest = jest.fn();

import { makeRequest, sanitizePayloadForLog } from '../../../../../src/lib/request/request';
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
  it('redacts sensitive headers from payload', () => {
    const payload: Payload = {
      url: 'https://api.snyk.io/v1/test',
      method: 'get',
      body: {},
      headers: {
        authorization: 'token secret123',
        'x-api-key': 'key-secret-456',
        'session-token': 'session-789',
        cookie: 'sessionid=abc',
        'snyk-api-key': 'snyk-key',
        'x-auth-token': 'x-auth',
        'proxy-authorization': 'Basic user:pass',
        'content-type': 'application/json',
      },
    };

    const sanitized = sanitizePayloadForLog(payload);

    expect(sanitized.headers?.['authorization']).toBe('[REDACTED]');
    expect(sanitized.headers?.['x-api-key']).toBe('[REDACTED]');
    expect(sanitized.headers?.['session-token']).toBe('[REDACTED]');
    expect(sanitized.headers?.['cookie']).toBe('[REDACTED]');
    expect(sanitized.headers?.['snyk-api-key']).toBe('[REDACTED]');
    expect(sanitized.headers?.['x-auth-token']).toBe('[REDACTED]');
    expect(sanitized.headers?.['proxy-authorization']).toBe('[REDACTED]');
    expect(sanitized.headers?.['content-type']).toBe('application/json');
    // Ensure original payload was not mutated
    expect(payload.headers?.['authorization']).toBe('token secret123');
  });

  it('redacts basic authentication credentials in URL', () => {
    const payload: Payload = {
      url: 'https://user:password123@api.snyk.io/v1/test',
      method: 'get',
      body: {},
      headers: {},
    };

    const sanitized = sanitizePayloadForLog(payload);

    expect(sanitized.url).not.toContain('password123');
    expect(sanitized.url).toContain('%5BREDACTED%5D');
    expect(payload.url).toContain('password123');
  });
});
