import {
  isUpgradable,
  isPatchable,
  isFixable,
  hasUpgrades,
  hasPatches,
  hasFixes,
  isNewVuln,
} from '../../../../src/lib/vuln-helpers';

describe('vuln-helpers', () => {
  describe('isUpgradable', () => {
    it('returns true if remediation upgrade is present', () => {
      const testResult = {
        remediation: {
          upgrade: {
            depA: { upgradeTo: '1.0.1' },
          },
        },
      };
      expect(isUpgradable(testResult)).toBe(true);
    });

    it('returns true if remediation pin is present', () => {
      const testResult = {
        remediation: {
          pin: {
            depB: { isTransitive: true },
          },
        },
      };
      expect(isUpgradable(testResult)).toBe(true);
    });

    it('returns false if remediation upgrade and pin are empty objects', () => {
      const testResult = {
        remediation: {
          upgrade: {},
          pin: {},
        },
      };
      expect(isUpgradable(testResult)).toBe(false);
    });

    it('falls back to vulnerabilities array if remediation is absent', () => {
      const upgradableResult = {
        vulnerabilities: [{ isUpgradable: true }, { isUpgradable: false }],
      };
      const nonUpgradableResult = {
        vulnerabilities: [{ isUpgradable: false }, { isPatchable: true }],
      };

      expect(isUpgradable(upgradableResult)).toBe(true);
      expect(isUpgradable(nonUpgradableResult)).toBe(false);
    });
  });

  describe('isPatchable', () => {
    it('returns true if remediation patch is present', () => {
      const testResult = {
        remediation: {
          patch: {
            vuln1: { id: 'vuln1' },
          },
        },
      };
      expect(isPatchable(testResult)).toBe(true);
    });

    it('returns false if remediation patch is empty object', () => {
      const testResult = {
        remediation: {
          patch: {},
        },
      };
      expect(isPatchable(testResult)).toBe(false);
    });

    it('falls back to vulnerabilities array if remediation is absent', () => {
      const patchableResult = {
        vulnerabilities: [{ isPatchable: true }],
      };
      const nonPatchableResult = {
        vulnerabilities: [{ isUpgradable: true }],
      };

      expect(isPatchable(patchableResult)).toBe(true);
      expect(isPatchable(nonPatchableResult)).toBe(false);
    });
  });

  describe('isFixable', () => {
    it('returns true if testResult is either upgradable or patchable', () => {
      expect(
        isFixable({
          remediation: { upgrade: { dep: {} } },
        }),
      ).toBe(true);

      expect(
        isFixable({
          remediation: { patch: { vuln: {} } },
        }),
      ).toBe(true);

      expect(
        isFixable({
          remediation: { upgrade: {}, patch: {} },
        }),
      ).toBe(false);
    });
  });

  describe('hasUpgrades, hasPatches, hasFixes', () => {
    it('checks arrays of testResults correctly', () => {
      const results = [
        { remediation: { upgrade: {} } },
        { remediation: { upgrade: { a: {} } } },
      ];

      expect(hasUpgrades(results)).toBe(true);
      expect(hasPatches(results)).toBe(false);
      expect(hasFixes(results)).toBe(true);
    });
  });

  describe('isNewVuln', () => {
    it('returns true for vulnerabilities published within 30 days', () => {
      const recentVuln = { publicationTime: new Date().toISOString() };
      expect(isNewVuln(recentVuln)).toBe(true);
    });

    it('returns false for older vulnerabilities', () => {
      const oldDate = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000);
      const oldVuln = { publicationTime: oldDate.toISOString() };
      expect(isNewVuln(oldVuln)).toBe(false);
    });
  });
});
