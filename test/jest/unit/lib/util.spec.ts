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

  it('should obfuscate token and tfc-token credentials', () => {
    const argsWithTokens: ArgsOptions = {
      _doubleDashArgs: [],
      _: [],
      org: 'demo-org',
      token: 'secret-token-123',
      'tfc-token': 'tfc-secret-token-456',
    };

    const result = obfuscateArgs(argsWithTokens) as ArgsOptions;

    expect(result.token).toEqual('token-set');
    expect(result['tfc-token']).toEqual('tfc-token-set');
    expect(result.org).toEqual('demo-org');
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
        token: 'secret-token-123',
        'tfc-token': 'tfc-secret-token-456',
        debug: true,
        docker: true,
      },
    ];

    const resultWithFlag = obfuscateArgs(argsWithUsernameAndPassword);

    expect(resultWithFlag[0]).toEqual('snyk/goof-image:latest');
    expect(resultWithFlag[1].username).toEqual('username-set');
    expect(resultWithFlag[1].password).toEqual('password-set');
    expect(resultWithFlag[1].token).toEqual('token-set');
    expect(resultWithFlag[1]['tfc-token']).toEqual('tfc-token-set');
  });

  it('should obfuscate token and tfc-token when provided', () => {
    const argsWithTokens: ArgsOptions = {
      _doubleDashArgs: [],
      _: ['snyk/goof-image:latest'],
      org: 'demo-org',
      token: 'secret-token-123',
      'tfc-token': 'tfc-secret-456',
    };

    const result = obfuscateArgs(argsWithTokens) as ArgsOptions;

    expect(result.token).toEqual('token-set');
    expect(result['tfc-token']).toEqual('tfc-token-set');
    expect(result.org).toEqual('demo-org');
  });

  it('should obfuscate nested tokens in MethodArgs', () => {
    const argsWithNestedTokens: MethodArgs = [
      'snyk/goof-image:latest',
      {
        _doubleDashArgs: [],
        _: ['snyk/goof-image:latest'],
        token: 'secret-token-123',
        'tfc-token': 'tfc-secret-456',
      },
    ];

    const result = obfuscateArgs(argsWithNestedTokens);

    expect(result[1].token).toEqual('token-set');
    expect(result[1]['tfc-token']).toEqual('tfc-token-set');
  });

  it('should obfuscate azurerm-account-key, fetch-tfstate-headers, and api-key credentials', () => {
    const argsWithExtendedCredentials: ArgsOptions = {
      _doubleDashArgs: [],
      _: [],
      'azurerm-account-key': 'azure-key-secret',
      'fetch-tfstate-headers': 'Authorization: Bearer secret',
      'api-key': 'api-key-secret',
    };

    const result = obfuscateArgs(argsWithExtendedCredentials) as ArgsOptions;

    expect(result['azurerm-account-key']).toEqual('azurerm-account-key-set');
    expect(result['fetch-tfstate-headers']).toEqual(
      'fetch-tfstate-headers-set',
    );
    expect(result['api-key']).toEqual('api-key-set');
  });

  it('should obfuscate options object at index 0 in MethodArgs', () => {
    const argsWithIndex0Options: MethodArgs = [
      {
        _doubleDashArgs: [],
        _: [],
        token: 'secret-token-123',
        apiKey: 'secret-api-key',
      },
    ];

    const result = obfuscateArgs(argsWithIndex0Options);

    expect(result[0].token).toEqual('token-set');
    expect(result[0].apiKey).toEqual('apiKey-set');
  });

  it('should obfuscate options object at index 2 or higher in MethodArgs', () => {
    const argsWithIndex2Options: MethodArgs = [
      'image:latest',
      'Dockerfile',
      {
        _doubleDashArgs: [],
        _: ['image:latest', 'Dockerfile'],
        token: 'secret-token-123',
        'client-secret': 'my-client-secret',
      },
    ];

    const result = obfuscateArgs(argsWithIndex2Options);

    expect(result[0]).toEqual('image:latest');
    expect(result[1]).toEqual('Dockerfile');
    expect(result[2].token).toEqual('token-set');
    expect(result[2]['client-secret']).toEqual('client-secret-set');
  });

  it('should obfuscate camelCase sensitive keys', () => {
    const argsWithCamelCaseKeys: ArgsOptions = {
      _doubleDashArgs: [],
      _: [],
      tfcToken: 'tfc-secret',
      apiKey: 'api-secret',
      clientSecret: 'client-secret-val',
      authToken: 'auth-token-val',
    };

    const result = obfuscateArgs(argsWithCamelCaseKeys) as ArgsOptions;

    expect(result.tfcToken).toEqual('tfcToken-set');
    expect(result.apiKey).toEqual('apiKey-set');
    expect(result.clientSecret).toEqual('clientSecret-set');
    expect(result.authToken).toEqual('authToken-set');
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
