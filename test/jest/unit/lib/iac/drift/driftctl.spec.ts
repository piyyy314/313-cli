import { sanitizeArgs } from '../../../../../../src/lib/iac/drift/driftctl';

describe('driftctl sanitizeArgs', () => {
  it('redacts sensitive argument values passed as separate elements', () => {
    const input = [
      'scan',
      '--quiet',
      '--tfc-token',
      'secret-token-123',
      '--headers',
      'Authorization: Bearer my-secret-jwt',
      '--to',
      'aws+tf',
    ];

    const expected = [
      'scan',
      '--quiet',
      '--tfc-token',
      '[REDACTED]',
      '--headers',
      '[REDACTED]',
      '--to',
      'aws+tf',
    ];

    expect(sanitizeArgs(input)).toEqual(expected);
  });

  it('redacts sensitive argument values passed with equals sign', () => {
    const input = [
      'scan',
      '--tfc-token=secret-token-123',
      '--headers=Authorization: Bearer jwt',
      '--config-dir=/tmp/cfg',
    ];

    const expected = [
      'scan',
      '--tfc-token=[REDACTED]',
      '--headers=[REDACTED]',
      '--config-dir=/tmp/cfg',
    ];

    expect(sanitizeArgs(input)).toEqual(expected);
  });

  it('leaves non-sensitive argument arrays untouched', () => {
    const input = ['scan', '--no-version-check', '--output', 'json://stdout'];
    expect(sanitizeArgs(input)).toEqual(input);
  });

  it('handles edge case when sensitive flag is the last argument', () => {
    const input = ['scan', '--tfc-token'];
    expect(sanitizeArgs(input)).toEqual(['scan', '--tfc-token']);
  });
});
