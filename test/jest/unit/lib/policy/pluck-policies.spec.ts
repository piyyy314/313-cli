import { pluckPolicies } from '../../../../../src/lib/policy/pluck-policies';
import { PackageExpanded } from 'snyk-resolve-deps/dist/types';

describe('pluckPolicies', () => {
  it('returns empty array when pkg is null or undefined', () => {
    expect(pluckPolicies(null as unknown as PackageExpanded)).toEqual([]);
    expect(pluckPolicies(undefined as unknown as PackageExpanded)).toEqual([]);
  });

  it('returns root pkg.snyk when defined as a string', () => {
    const pkg = {
      snyk: 'policy-file-path',
    } as unknown as PackageExpanded;

    expect(pluckPolicies(pkg)).toEqual('policy-file-path');
  });

  it('returns root pkg.snyk when defined as an array', () => {
    const pkg = {
      snyk: ['policy1', 'policy2'],
    } as unknown as PackageExpanded;

    expect(pluckPolicies(pkg)).toEqual(['policy1', 'policy2']);
  });

  it('returns empty array when pkg has no snyk property and no dependencies', () => {
    const pkg = {
      name: 'foo',
      version: '1.0.0',
    } as unknown as PackageExpanded;

    expect(pluckPolicies(pkg)).toEqual([]);
  });

  it('collects policy locations from nested dependencies', () => {
    const pkg = {
      name: 'root',
      dependencies: {
        depA: {
          name: 'depA',
          snyk: 'policyA',
        },
        depB: {
          name: 'depB',
          dependencies: {
            depC: {
              name: 'depC',
              snyk: ['policyC1', 'policyC2'],
            },
            depD: {
              name: 'depD',
            },
          },
        },
      },
    } as unknown as PackageExpanded;

    expect(pluckPolicies(pkg)).toEqual(['policyA', 'policyC1', 'policyC2']);
  });
});
