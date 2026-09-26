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
    it('returns true if vuln publicationTime is within the last 30 days', () => {
      const recentDate = new Date(
        Date.now() - 10 * 24 * 60 * 60 * 1000,
      ).toISOString();
      expect(isNewVuln({ publicationTime: recentDate })).toBe(true);
    });

    it('returns false if vuln publicationTime is older than 30 days', () => {
      const oldDate = new Date(
        Date.now() - 40 * 24 * 60 * 60 * 1000,
      ).toISOString();
      expect(isNewVuln({ publicationTime: oldDate })).toBe(false);
    });
  });

  describe('isUpgradable', () => {
    it('returns true if remediation upgrade has keys', () => {
      const testResult = {
        remediation: {
          upgrade: { 'dep@1.0.0': { upgradeTo: '1.0.1' } },
        },
      };
      expect(isUpgradable(testResult)).toBe(true);
    });

    it('returns true if remediation pin has keys', () => {
      const testResult = {
        remediation: {
          pin: { 'dep@1.0.0': { isTransitive: true } },
        },
      };
      expect(isUpgradable(testResult)).toBe(true);
    });

    it('returns false if remediation upgrade and pin are empty', () => {
      const testResult = {
        remediation: {
          upgrade: {},
          pin: {},
        },
      };
      expect(isUpgradable(testResult)).toBe(false);
    });

    it('fallbacks to vulnerabilities array when remediation is absent', () => {
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
    it('returns true if remediation patch has keys', () => {
      const testResult = {
        remediation: {
          patch: { 'SNYK-1': { patch: 'diff' } },
        },
      };
      expect(isPatchable(testResult)).toBe(true);
    });

    it('returns false if remediation patch is empty', () => {
      const testResult = {
        remediation: {
          patch: {},
        },
      };
      expect(isPatchable(testResult)).toBe(false);
    });

    it('fallbacks to vulnerabilities array when remediation is absent', () => {
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
      expect(isFixable({ remediation: { upgrade: { a: 1 } } })).toBe(true);
      expect(isFixable({ remediation: { patch: { a: 1 } } })).toBe(true);
      expect(isFixable({ remediation: {} })).toBe(false);
    });
  });

  describe('hasFixes, hasUpgrades, hasPatches', () => {
    it('checks arrays of test results correctly', () => {
      const results = [
        { remediation: {} },
        { remediation: { upgrade: { a: 1 } } },
      ];
      expect(hasFixes(results)).toBe(true);
      expect(hasUpgrades(results)).toBe(true);
      expect(hasPatches(results)).toBe(false);
    });
  });

  describe('isVulnUpgradable, isVulnPatchable, isVulnFixable', () => {
    it('identifies vuln properties correctly', () => {
      expect(isVulnUpgradable({ isUpgradable: true })).toBe(true);
      expect(isVulnUpgradable({ isPinnable: true })).toBe(true);
      expect(isVulnUpgradable({})).toBeFalsy();

      expect(isVulnPatchable({ isPatchable: true })).toBe(true);
      expect(isVulnPatchable({})).toBeUndefined();

      expect(isVulnFixable({ isUpgradable: true })).toBe(true);
      expect(isVulnFixable({ isPatchable: true })).toBe(true);
      expect(isVulnFixable({})).toBeFalsy();
    });
  });
});
