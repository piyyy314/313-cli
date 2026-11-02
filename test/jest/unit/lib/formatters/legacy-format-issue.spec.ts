import stripAnsi = require('strip-ansi');
import { formatIssues } from '../../../../../src/lib/formatters/legacy-format-issue';
import { GroupedVuln, SEVERITY } from '../../../../../src/lib/snyk-test/legacy';

describe('formatIssues (legacy formatter)', () => {
  const createMockGroupedVuln = (
    paths: string[][],
    isFixable = false,
  ): GroupedVuln =>
    ({
      list: paths.map((from) => ({
        id: 'SNYK-JS-TEST-12345',
        from,
        upgradePath: [],
        isUpgradable: false,
        isPatchable: false,
        name: 'test-pkg',
        version: '1.0.0',
        severity: 'high' as SEVERITY,
        title: 'Prototype Pollution',
      })),
      metadata: {
        id: 'SNYK-JS-TEST-12345',
        title: 'Prototype Pollution',
        description: 'Test description',
        type: 'vuln',
        name: 'test-pkg',
        info: 'Test info',
        severity: 'high' as SEVERITY,
        severityValue: 3,
        isNew: false,
        version: '1.0.0',
        packageManager: 'npm',
      },
      isIgnored: false,
      isPatched: false,
      isFixable,
      title: 'Prototype Pollution',
      note: '',
      severity: 'high' as SEVERITY,
      originalSeverity: 'high' as SEVERITY,
      isNew: false,
      name: 'test-pkg',
      version: '1.0.0',
    }) as unknown as GroupedVuln;

  it('formats paths correctly when showVulnPaths is "none"', () => {
    const vuln = createMockGroupedVuln([
      ['root-pkg', 'dep-a', 'test-pkg'],
      ['root-pkg', 'dep-b', 'test-pkg'],
    ]);
    const res = stripAnsi(
      formatIssues(vuln, {
        showVulnPaths: 'none',
        path: '.',
        packageManager: 'npm',
      } as any),
    );

    expect(res).not.toContain('From:');
    expect(res).toContain('vulnerability found in test-pkg');
    expect(res).toContain('Description: Prototype Pollution');
  });

  it('displays up to 3 paths and truncates when showVulnPaths is "some" and count > 3', () => {
    const vuln = createMockGroupedVuln([
      ['root-pkg', 'dep-1', 'test-pkg'],
      ['root-pkg', 'dep-2', 'test-pkg'],
      ['root-pkg', 'dep-3', 'test-pkg'],
      ['root-pkg', 'dep-4', 'test-pkg'],
      ['root-pkg', 'dep-5', 'test-pkg'],
    ]);
    const res = stripAnsi(
      formatIssues(vuln, {
        showVulnPaths: 'some',
        path: '.',
        packageManager: 'npm',
      } as any),
    );

    expect(res).toContain('From: dep-1 > test-pkg');
    expect(res).toContain('From: dep-2 > test-pkg');
    expect(res).toContain('From: dep-3 > test-pkg');
    expect(res).not.toContain('From: dep-4 > test-pkg');
    expect(res).toContain('and 2 more...');
  });

  it('displays all paths without truncation when count <= 3 and showVulnPaths is "some"', () => {
    const vuln = createMockGroupedVuln([
      ['root-pkg', 'dep-1', 'test-pkg'],
      ['root-pkg', 'dep-2', 'test-pkg'],
    ]);
    const res = stripAnsi(
      formatIssues(vuln, {
        showVulnPaths: 'some',
        path: '.',
        packageManager: 'npm',
      } as any),
    );

    expect(res).toContain('From: dep-1 > test-pkg');
    expect(res).toContain('From: dep-2 > test-pkg');
    expect(res).not.toContain('more...');
  });

  it('displays all paths when showVulnPaths is "all"', () => {
    const vuln = createMockGroupedVuln([
      ['root-pkg', 'dep-1', 'test-pkg'],
      ['root-pkg', 'dep-2', 'test-pkg'],
      ['root-pkg', 'dep-3', 'test-pkg'],
      ['root-pkg', 'dep-4', 'test-pkg'],
    ]);
    const res = stripAnsi(
      formatIssues(vuln, {
        showVulnPaths: 'all',
        path: '.',
        packageManager: 'npm',
      } as any),
    );

    expect(res).toContain('From: dep-1 > test-pkg');
    expect(res).toContain('From: dep-2 > test-pkg');
    expect(res).toContain('From: dep-3 > test-pkg');
    expect(res).toContain('From: dep-4 > test-pkg');
    expect(res).not.toContain('more...');
  });

  it('handles core package / direct dependency path (from.length === 1)', () => {
    const vuln = createMockGroupedVuln([['test-pkg']]);
    const res = stripAnsi(
      formatIssues(vuln, {
        showVulnPaths: 'some',
        path: '.',
        packageManager: 'npm',
      } as any),
    );

    expect(res).toContain('From: test-pkg');
    expect(res).not.toContain('more...');
  });
});
