import {
  isNewVuln,
  isFixable,
  hasFixes,
  isUpgradable,
  hasUpgrades,
  isPatchable,
  hasPatches,
  isVulnUpgradable,
  isVulnPatchable,
  isVulnFixable,
} from '../../../../src/lib/vuln-helpers';

describe('vuln-helpers', () => {
  describe('isNewVuln', () => {
    it('returns true for vulnerabilities published within the last month', () => {
      const recentDate = new Date(
        Date.now() - 5 * 24 * 60 * 60 * 1000,
      ).toISOString();
      expect(isNewVuln({ publicationTime: recentDate })).toBe(true);
    });

    it('returns false for vulnerabilities published over a month ago', () => {
      const oldDate = new Date(
        Date.now() - 60 * 24 * 60 * 60 * 1000,
      ).toISOString();
      expect(isNewVuln({ publicationTime: oldDate })).toBe(false);
    });
  });

  describe('isUpgradable', () => {
    it('returns true when remediation contains upgrade key', () => {
      const testResult = {
        remediation: {
          upgrade: { 'pkg@1.0.0': { upgradeTo: 'pkg@2.0.0' } },
          pin: {},
        },
      };
      expect(isUpgradable(testResult)).toBe(true);
    });

    it('returns true when remediation contains pin key', () => {
      const testResult = {
        remediation: {
          upgrade: {},
          pin: { 'pkg@1.0.0': { isTransitive: true } },
        },
      };
      expect(isUpgradable(testResult)).toBe(true);
    });

    it('returns false when remediation upgrade and pin are empty', () => {
      const testResult = {
        remediation: {
          upgrade: {},
          pin: {},
        },
      };
      expect(isUpgradable(testResult)).toBe(false);
    });

    it('falls back to vulnerabilities array when remediation is missing', () => {
      const testResultWithUpgradable = {
        vulnerabilities: [{ isUpgradable: true }],
      };
      const testResultWithoutUpgradable = {
        vulnerabilities: [{ isUpgradable: false }],
      };

      expect(isUpgradable(testResultWithUpgradable)).toBe(true);
      expect(isUpgradable(testResultWithoutUpgradable)).toBe(false);
    });
  });

  describe('isPatchable', () => {
    it('returns true when remediation contains patch key', () => {
      const testResult = {
        remediation: {
          patch: { 'SNYK-JS-TEST-1': { patches: [] } },
        },
      };
      expect(isPatchable(testResult)).toBe(true);
    });

    it('returns false when remediation patch is empty', () => {
      const testResult = {
        remediation: {
          patch: {},
        },
      };
      expect(isPatchable(testResult)).toBe(false);
    });

    it('falls back to vulnerabilities array when remediation is missing', () => {
      const testResultWithPatchable = {
        vulnerabilities: [{ isPatchable: true }],
      };
      const testResultWithoutPatchable = {
        vulnerabilities: [{ isPatchable: false }],
      };

      expect(isPatchable(testResultWithPatchable)).toBe(true);
      expect(isPatchable(testResultWithoutPatchable)).toBe(false);
    });
  });

  describe('isFixable', () => {
    it('returns true if upgradable or patchable', () => {
      const upgradable = { remediation: { upgrade: { a: 1 } } };
      const patchable = { remediation: { patch: { b: 2 } } };
      const nonFixable = { remediation: { upgrade: {}, pin: {}, patch: {} } };

      expect(isFixable(upgradable)).toBe(true);
      expect(isFixable(patchable)).toBe(true);
      expect(isFixable(nonFixable)).toBe(false);
    });
  });

  describe('hasFixes, hasUpgrades, hasPatches', () => {
    it('correctly checks arrays of testResults', () => {
      const testResults = [
        { remediation: { upgrade: {}, pin: {}, patch: {} } },
        { remediation: { upgrade: { pkg: {} } } },
      ];

      expect(hasFixes(testResults)).toBe(true);
      expect(hasUpgrades(testResults)).toBe(true);
      expect(hasPatches(testResults)).toBe(false);
    });
  });

  describe('isVulnUpgradable, isVulnPatchable, isVulnFixable', () => {
    it('checks vulnerability object flags', () => {
      expect(isVulnUpgradable({ isUpgradable: true })).toBe(true);
      expect(isVulnUpgradable({ isPinnable: true })).toBe(true);
      expect(isVulnUpgradable({ isUpgradable: false, isPinnable: false })).toBe(
        false,
      );

      expect(isVulnPatchable({ isPatchable: true })).toBe(true);
      expect(isVulnPatchable({ isPatchable: false })).toBe(false);

      expect(isVulnFixable({ isUpgradable: true })).toBe(true);
      expect(isVulnFixable({ isPatchable: true })).toBe(true);
      expect(isVulnFixable({ isUpgradable: false, isPatchable: false })).toBe(
        false,
      );
    });
  });
});
