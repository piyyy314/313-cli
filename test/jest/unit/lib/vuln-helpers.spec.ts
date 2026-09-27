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
    it('returns true if vuln was published within the last 30 days', () => {
      const recentDate = new Date(
        Date.now() - 1000 * 60 * 60 * 24 * 5,
      ).toISOString();
      expect(isNewVuln({ publicationTime: recentDate })).toBe(true);
    });

    it('returns false if vuln was published more than 30 days ago', () => {
      const oldDate = new Date(
        Date.now() - 1000 * 60 * 60 * 24 * 40,
      ).toISOString();
      expect(isNewVuln({ publicationTime: oldDate })).toBe(false);
    });
  });

  describe('isUpgradable', () => {
    it('returns true when remediation upgrade object has keys', () => {
      const testResult = {
        remediation: {
          upgrade: { 'dep@1.0.0': { upgradeTo: 'dep@1.0.1' } },
        },
      };
      expect(isUpgradable(testResult)).toBe(true);
    });

    it('returns true when remediation pin object has keys', () => {
      const testResult = {
        remediation: {
          upgrade: {},
          pin: { 'dep@1.0.0': { isPinnable: true } },
        },
      };
      expect(isUpgradable(testResult)).toBe(true);
    });

    it('returns false when remediation upgrade and pin objects are empty', () => {
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
        vulnerabilities: [{ isUpgradable: true }, { isUpgradable: false }],
      };
      const testResultWithoutUpgradable = {
        vulnerabilities: [{ isUpgradable: false }],
      };

      expect(isUpgradable(testResultWithUpgradable)).toBe(true);
      expect(isUpgradable(testResultWithoutUpgradable)).toBe(false);
    });
  });

  describe('isPatchable', () => {
    it('returns true when remediation patch object has keys', () => {
      const testResult = {
        remediation: {
          patch: { 'vuln-1': { patch: 'diff' } },
        },
      };
      expect(isPatchable(testResult)).toBe(true);
    });

    it('returns false when remediation patch object is empty', () => {
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
    it('returns true if testResult isUpgradable or isPatchable', () => {
      expect(
        isFixable({
          remediation: { upgrade: { a: 1 } },
        }),
      ).toBe(true);

      expect(
        isFixable({
          remediation: { patch: { b: 2 } },
        }),
      ).toBe(true);

      expect(
        isFixable({
          remediation: { upgrade: {}, patch: {} },
        }),
      ).toBe(false);
    });
  });

  describe('hasFixes, hasUpgrades, hasPatches', () => {
    const results = [
      { remediation: { upgrade: {}, patch: {} } },
      { remediation: { upgrade: { pkg: {} } } },
    ];

    it('hasFixes checks array of testResults', () => {
      expect(hasFixes(results)).toBe(true);
      expect(hasFixes([{ remediation: { upgrade: {}, patch: {} } }])).toBe(
        false,
      );
    });

    it('hasUpgrades checks array of testResults', () => {
      expect(hasUpgrades(results)).toBe(true);
      expect(hasUpgrades([{ remediation: { upgrade: {} } }])).toBe(false);
    });

    it('hasPatches checks array of testResults', () => {
      expect(hasPatches(results)).toBe(false);
      expect(hasPatches([{ remediation: { patch: { p: {} } } }])).toBe(true);
    });
  });

  describe('isVulnUpgradable, isVulnPatchable, isVulnFixable', () => {
    it('checks vuln properties correctly', () => {
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
