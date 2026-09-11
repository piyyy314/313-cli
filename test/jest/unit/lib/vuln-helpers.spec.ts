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
    it('returns true for vulnerabilities published within the last 30 days', () => {
      const recentDate = new Date(
        Date.now() - 10 * 24 * 60 * 60 * 1000,
      ).toISOString();
      expect(isNewVuln({ publicationTime: recentDate })).toBe(true);
    });

    it('returns false for vulnerabilities published more than 30 days ago', () => {
      const oldDate = new Date(
        Date.now() - 40 * 24 * 60 * 60 * 1000,
      ).toISOString();
      expect(isNewVuln({ publicationTime: oldDate })).toBe(false);
    });
  });

  describe('isUpgradable', () => {
    it('returns true when remediation upgrade has keys', () => {
      const testResult = {
        remediation: {
          upgrade: {
            'pkg-a@1.0.0': { upgradeTo: 'pkg-a@1.0.1' },
          },
          pin: {},
        },
      };
      expect(isUpgradable(testResult)).toBe(true);
    });

    it('returns true when remediation pin has keys', () => {
      const testResult = {
        remediation: {
          upgrade: {},
          pin: {
            'pkg-b@2.0.0': { upgradeTo: 'pkg-b@2.0.1' },
          },
        },
      };
      expect(isUpgradable(testResult)).toBe(true);
    });

    it('returns false when remediation upgrade and pin are empty objects', () => {
      const testResult = {
        remediation: {
          upgrade: {},
          pin: {},
        },
      };
      expect(isUpgradable(testResult)).toBe(false);
    });

    it('falls back to vulnerabilities array when remediation is undefined', () => {
      const testResultWithUpgrade = {
        vulnerabilities: [{ isUpgradable: true }, { isUpgradable: false }],
      };
      const testResultWithoutUpgrade = {
        vulnerabilities: [{ isUpgradable: false }, { isUpgradable: false }],
      };
      expect(isUpgradable(testResultWithUpgrade)).toBe(true);
      expect(isUpgradable(testResultWithoutUpgrade)).toBe(false);
    });
  });

  describe('isPatchable', () => {
    it('returns true when remediation patch has keys', () => {
      const testResult = {
        remediation: {
          patch: {
            'SNYK-JS-TEST-1': { id: 'SNYK-JS-TEST-1' },
          },
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

    it('falls back to vulnerabilities array when remediation is undefined', () => {
      const testResultWithPatch = {
        vulnerabilities: [{ isPatchable: true }],
      };
      const testResultWithoutPatch = {
        vulnerabilities: [{ isPatchable: false }],
      };
      expect(isPatchable(testResultWithPatch)).toBe(true);
      expect(isPatchable(testResultWithoutPatch)).toBe(false);
    });
  });

  describe('isFixable and collection helpers', () => {
    it('isFixable returns true if upgradable or patchable', () => {
      const upgradableResult = { remediation: { upgrade: { a: {} } } };
      const patchableResult = { remediation: { patch: { b: {} } } };
      const nonFixableResult = {
        remediation: { upgrade: {}, pin: {}, patch: {} },
      };

      expect(isFixable(upgradableResult)).toBe(true);
      expect(isFixable(patchableResult)).toBe(true);
      expect(isFixable(nonFixableResult)).toBe(false);
    });

    it('hasFixes returns true if any test result is fixable', () => {
      const results = [
        { remediation: { upgrade: {}, pin: {}, patch: {} } },
        { remediation: { upgrade: { a: {} } } },
      ];
      expect(hasFixes(results)).toBe(true);
    });

    it('hasUpgrades returns true if any test result is upgradable', () => {
      const results = [
        { remediation: { upgrade: {}, pin: {} } },
        { remediation: { upgrade: { a: {} } } },
      ];
      expect(hasUpgrades(results)).toBe(true);
    });

    it('hasPatches returns true if any test result is patchable', () => {
      const results = [
        { remediation: { patch: {} } },
        { remediation: { patch: { p: {} } } },
      ];
      expect(hasPatches(results)).toBe(true);
    });
  });

  describe('vulnerability level helpers', () => {
    it('isVulnUpgradable checks isUpgradable or isPinnable', () => {
      expect(isVulnUpgradable({ isUpgradable: true })).toBe(true);
      expect(isVulnUpgradable({ isPinnable: true })).toBe(true);
      expect(
        isVulnUpgradable({ isUpgradable: false, isPinnable: false }),
      ).toBeFalsy();
    });

    it('isVulnPatchable checks isPatchable', () => {
      expect(isVulnPatchable({ isPatchable: true })).toBe(true);
      expect(isVulnPatchable({ isPatchable: false })).toBe(false);
    });

    it('isVulnFixable returns true if vuln is upgradable or patchable', () => {
      expect(isVulnFixable({ isUpgradable: true })).toBe(true);
      expect(isVulnFixable({ isPatchable: true })).toBe(true);
      expect(
        isVulnFixable({ isUpgradable: false, isPatchable: false }),
      ).toBeFalsy();
    });
  });
});
