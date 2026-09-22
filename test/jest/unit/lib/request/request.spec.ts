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

describe('sensitive data sanitization for logging', () => {
  it('redacts sensitive authorization and credential headers in payload', () => {
    const payload = {
      url: 'https://api.snyk.io',
      method: 'get',
      body: {},
      headers: {
        authorization: 'token secret-token-123',
        Authorization: 'Bearer secret-oauth-456',
        'X-Api-Key': 'secret-api-key',
        'session-token': 'secret-session',
        cookie: 'sessionid=secret-cookie',
        'content-type': 'application/json',
      },
    } as Payload;

    const sanitized = sanitizePayloadForLog(payload);

    expect(sanitized.headers?.authorization).toBe('[REDACTED]');
    expect(sanitized.headers?.Authorization).toBe('[REDACTED]');
    expect(sanitized.headers?.['X-Api-Key']).toBe('[REDACTED]');
    expect(sanitized.headers?.['session-token']).toBe('[REDACTED]');
    expect(sanitized.headers?.cookie).toBe('[REDACTED]');
    expect(sanitized.headers?.['content-type']).toBe('application/json');
    // Ensure original payload object was not mutated
    expect(payload.headers?.authorization).toBe('token secret-token-123');
  });

  it('redacts basic auth credentials in proxy URLs', () => {
    const proxyUrl = 'http://username:password123@proxy.example.com:8080';
    const sanitized = sanitizeUrlForLog(proxyUrl);
    expect(sanitized).toBe(
      'http://%5BREDACTED%5D:%5BREDACTED%5D@proxy.example.com:8080/',
    );
    expect(sanitized).not.toContain('username');
    expect(sanitized).not.toContain('password123');
  });

  it('leaves proxy URLs without credentials unchanged', () => {
    const proxyUrl = 'http://proxy.example.com:8080';
    const sanitized = sanitizeUrlForLog(proxyUrl);
    expect(sanitized).toBe('http://proxy.example.com:8080/');
  });
});
