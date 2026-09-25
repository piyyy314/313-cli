import { MAX_STRING_LENGTH } from '../../../../src/lib/constants';
import { obfuscateArgs, truncateForLog } from '../../../../src/lib/utils';
import { ArgsOptions, MethodArgs } from '../../../../src/cli/args';

describe('Sanitize args', () => {
  it('should obfuscate username and password when both are provided', () => {
    const argsWithUsernameAndPassword: ArgsOptions = {
      _doubleDashArgs: [],
      _: ['snyk/goof-image:latest'],
      org: 'demo-org',
      username: 'fakeuser',
      password: 'fakepass',
      file: 'Dockerfile',
    };

    const resultWithFlag = obfuscateArgs(
      argsWithUsernameAndPassword,
    ) as ArgsOptions;

    expect(resultWithFlag.username).toEqual('username-set');
    expect(resultWithFlag.password).toEqual('password-set');
    expect(resultWithFlag._[0]).toEqual('snyk/goof-image:latest');
    expect(resultWithFlag.org).toEqual('demo-org');
    expect(resultWithFlag.file).toEqual('Dockerfile');
  });

  it('should obfuscate personally identifiable information from args', () => {
    const argsWithUsernameAndPassword: ArgsOptions = {
      _doubleDashArgs: [],
      _: ['snyk/goof-image:latest'],
      org: 'demo-org',
      username: 'fakeuser',
      file: 'Dockerfile',
    };

    const resultWithFlag = obfuscateArgs(
      argsWithUsernameAndPassword,
    ) as ArgsOptions;

    expect(resultWithFlag.username).toEqual('username-set');
    expect(resultWithFlag.password).toBeUndefined();
    expect(resultWithFlag._[0]).toEqual('snyk/goof-image:latest');
    expect(resultWithFlag.org).toEqual('demo-org');
    expect(resultWithFlag.file).toEqual('Dockerfile');
  });

  it('should obfuscate nested PII', () => {
    const argsWithUsernameAndPassword: MethodArgs = [
      'snyk/goof-image:latest',
      {
        _doubleDashArgs: [],
        _: ['snyk/goof-image:latest'],
        username: 'fakeuser',
        password: 'fakepass',
        debug: true,
        docker: true,
      },
    ];

    const resultWithFlag = obfuscateArgs(argsWithUsernameAndPassword);

    expect(resultWithFlag[0]).toEqual('snyk/goof-image:latest');
    expect(resultWithFlag[1].username).toEqual('username-set');
    expect(resultWithFlag[1].password).toEqual('password-set');
  });

  it('should obfuscate all sensitive credentials and tokens in args', () => {
    const argsWithTokens = {
      _doubleDashArgs: [],
      _: ['test'],
      token: 'secret-token-123',
      'tfc-token': 'tfc-secret-456',
      'azurerm-account-key': 'azure-key-789',
      'fetch-tfstate-headers': 'Header: Secret',
      'api-key': 'api-key-abc',
      snykToken: 'snyk-token-xyz',
      'snyk-token': 'snyk-token-123',
      oauthToken: 'oauth-token-456',
      'oauth-token': 'oauth-token-789',
      auth: 'Bearer secret-jwt',
    };

    const result = obfuscateArgs(argsWithTokens) as ArgsOptions;

    expect(result.token).toEqual('token-set');
    expect(result['tfc-token']).toEqual('tfc-token-set');
    expect(result['azurerm-account-key']).toEqual('azurerm-account-key-set');
    expect(result['fetch-tfstate-headers']).toEqual('fetch-tfstate-headers-set');
    expect(result['api-key']).toEqual('api-key-set');
    expect(result.snykToken).toEqual('snykToken-set');
    expect(result['snyk-token']).toEqual('snyk-token-set');
    expect(result.oauthToken).toEqual('oauthToken-set');
    expect(result['oauth-token']).toEqual('oauth-token-set');
    expect(result.auth).toEqual('auth-set');
  });

  it('should handle cyclic references gracefully without infinite loops', () => {
    const cyclicArgs: any = {
      _doubleDashArgs: [],
      _: ['test'],
      token: 'secret-token-123',
    };
    cyclicArgs.self = cyclicArgs;

    const result = obfuscateArgs(cyclicArgs) as any;

    expect(result.token).toEqual('token-set');
    expect(result.self.token).toEqual('token-set');
  });
});

describe('truncateForLog', () => {
  it('returns original value when below max length', () => {
    expect(truncateForLog('small')).toBe('small');
  });

  it('truncates long values and adds truncation suffix', () => {
    const longValue = 'a'.repeat(MAX_STRING_LENGTH + 1);

    expect(truncateForLog(longValue)).toBe(
      'a'.repeat(MAX_STRING_LENGTH) + '...(log line truncated)',
    );
  });
});
