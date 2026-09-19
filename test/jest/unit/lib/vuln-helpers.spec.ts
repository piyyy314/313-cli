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
    it('returns true for a vulnerability published within the last 30 days', () => {
      const recentDate = new Date(
        Date.now() - 5 * 24 * 60 * 60 * 1000,
      ).toISOString();
      expect(isNewVuln({ publicationTime: recentDate })).toBe(true);
    });

    it('returns false for an old vulnerability published over 30 days ago', () => {
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
          upgrade: { 'dep@1.0.0': { upgradeTo: 'dep@2.0.0' } },
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

    it('falls back to vulnerabilities array when remediation is missing', () => {
      const upgradableResult = {
        vulnerabilities: [{ isUpgradable: true }, { isUpgradable: false }],
      };
      expect(isUpgradable(upgradableResult)).toBe(true);

      const nonUpgradableResult = {
        vulnerabilities: [{ isUpgradable: false }],
      };
      expect(isUpgradable(nonUpgradableResult)).toBe(false);
    });
  });

  describe('isPatchable', () => {
    it('returns true if remediation patch has keys', () => {
      const testResult = {
        remediation: {
          patch: { 'vuln-1': { patch: 'diff' } },
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

    it('falls back to vulnerabilities array when remediation is missing', () => {
      const patchableResult = {
        vulnerabilities: [{ isPatchable: true }],
      };
      expect(isPatchable(patchableResult)).toBe(true);

      const nonPatchableResult = {
        vulnerabilities: [{ isPatchable: false }],
      };
      expect(isPatchable(nonPatchableResult)).toBe(false);
    });
  });

  describe('isFixable and hasFixes', () => {
    it('isFixable returns true if upgradable or patchable', () => {
      expect(isFixable({ remediation: { upgrade: { a: 1 } } })).toBe(true);
      expect(isFixable({ remediation: { patch: { a: 1 } } })).toBe(true);
      expect(isFixable({ remediation: {} })).toBe(false);
    });

    it('hasFixes returns true if any result is fixable', () => {
      const results = [
        { remediation: {} },
        { remediation: { patch: { p: 1 } } },
      ];
      expect(hasFixes(results)).toBe(true);
      expect(hasFixes([{ remediation: {} }])).toBe(false);
    });
  });

  describe('hasUpgrades and hasPatches', () => {
    it('hasUpgrades returns true if any test result is upgradable', () => {
      expect(hasUpgrades([{ remediation: { upgrade: { u: 1 } } }])).toBe(true);
      expect(hasUpgrades([{ remediation: {} }])).toBe(false);
    });

    it('hasPatches returns true if any test result is patchable', () => {
      expect(hasPatches([{ remediation: { patch: { p: 1 } } }])).toBe(true);
      expect(hasPatches([{ remediation: {} }])).toBe(false);
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

    it('isVulnFixable checks either upgradable or patchable', () => {
      expect(isVulnFixable({ isUpgradable: true })).toBe(true);
      expect(isVulnFixable({ isPatchable: true })).toBe(true);
      expect(
        isVulnFixable({ isUpgradable: false, isPatchable: false }),
      ).toBeFalsy();
    });
  });
});
