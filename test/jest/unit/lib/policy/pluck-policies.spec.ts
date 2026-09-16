import { pluckPolicies } from '../../../../../src/lib/policy/pluck-policies';

describe('pluckPolicies', () => {
  it('returns empty array when package is null or undefined', () => {
    expect(pluckPolicies(null as any)).toEqual([]);
    expect(pluckPolicies(undefined as any)).toEqual([]);
  });

  it('returns empty array when package has no snyk property or dependencies', () => {
    const pkg = { name: 'foo', version: '1.0.0' };
    expect(pluckPolicies(pkg as any)).toEqual([]);
  });

  it('extracts policy string if pkg.snyk is a string', () => {
    const pkg = { name: 'foo', version: '1.0.0', snyk: 'policy-content-str' };
    expect(pluckPolicies(pkg as any)).toEqual(['policy-content-str']);
  });

  it('extracts policy array if pkg.snyk is an array', () => {
    const pkg = {
      name: 'foo',
      version: '1.0.0',
      snyk: ['policy-1', 'policy-2'],
    };
    expect(pluckPolicies(pkg as any)).toEqual(['policy-1', 'policy-2']);
  });

  it('recursively extracts policies from nested dependencies', () => {
    const pkg = {
      name: 'root',
      version: '1.0.0',
      dependencies: {
        depA: {
          name: 'depA',
          version: '1.0.0',
          snyk: 'policy-depA',
        },
        depB: {
          name: 'depB',
          version: '1.0.0',
          dependencies: {
            depC: {
              name: 'depC',
              version: '1.0.0',
              snyk: ['policy-depC-1', 'policy-depC-2'],
            },
          },
        },
        depD: {
          name: 'depD',
          version: '1.0.0',
        },
      },
    };

    expect(pluckPolicies(pkg as any)).toEqual([
      'policy-depA',
      'policy-depC-1',
      'policy-depC-2',
    ]);
  });
});
