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
    it('returns true if vuln was published in the last 30 days', () => {
      const recentDate = new Date(
        Date.now() - 10 * 24 * 60 * 60 * 1000,
      ).toISOString();
      expect(isNewVuln({ publicationTime: recentDate })).toBe(true);
    });

    it('returns false if vuln was published over 30 days ago', () => {
      const oldDate = new Date(
        Date.now() - 40 * 24 * 60 * 60 * 1000,
      ).toISOString();
      expect(isNewVuln({ publicationTime: oldDate })).toBe(false);
    });
  });

  describe('isUpgradable & hasUpgrades', () => {
    it('returns true when remediation contains upgrade object with keys', () => {
      const testResult = {
        remediation: {
          upgrade: { 'pkg@1.0.0': { upgradeTo: 'pkg@2.0.0' } },
        },
      };
      expect(isUpgradable(testResult)).toBe(true);
      expect(hasUpgrades([testResult])).toBe(true);
    });

    it('returns true when remediation contains pin object with keys', () => {
      const testResult = {
        remediation: {
          pin: { 'pkg@1.0.0': { isPinned: true } },
        },
      };
      expect(isUpgradable(testResult)).toBe(true);
      expect(hasUpgrades([testResult])).toBe(true);
    });

    it('returns false when remediation upgrade and pin are empty', () => {
      const testResult = {
        remediation: {
          upgrade: {},
          pin: {},
        },
      };
      expect(isUpgradable(testResult)).toBe(false);
      expect(hasUpgrades([testResult])).toBe(false);
    });

    it('falls back to vulnerabilities array when remediation is missing', () => {
      const testResultWithUpgradableVuln = {
        vulnerabilities: [{ isUpgradable: true }],
      };
      const testResultWithoutUpgradableVuln = {
        vulnerabilities: [{ isUpgradable: false, isPinnable: false }],
      };

      expect(isUpgradable(testResultWithUpgradableVuln)).toBe(true);
      expect(isUpgradable(testResultWithoutUpgradableVuln)).toBe(false);
    });
  });

  describe('isPatchable & hasPatches', () => {
    it('returns true when remediation contains patch object with keys', () => {
      const testResult = {
        remediation: {
          patch: { 'pkg@1.0.0': { patchUrl: 'http://example.com' } },
        },
      };
      expect(isPatchable(testResult)).toBe(true);
      expect(hasPatches([testResult])).toBe(true);
    });

    it('returns false when remediation patch is empty', () => {
      const testResult = {
        remediation: {
          patch: {},
        },
      };
      expect(isPatchable(testResult)).toBe(false);
      expect(hasPatches([testResult])).toBe(false);
    });

    it('falls back to vulnerabilities array when remediation is missing', () => {
      const testResultWithPatchableVuln = {
        vulnerabilities: [{ isPatchable: true }],
      };
      const testResultWithoutPatchableVuln = {
        vulnerabilities: [{ isPatchable: false }],
      };

      expect(isPatchable(testResultWithPatchableVuln)).toBe(true);
      expect(isPatchable(testResultWithoutPatchableVuln)).toBe(false);
    });
  });

  describe('isFixable & hasFixes', () => {
    it('returns true if either upgradable or patchable', () => {
      const testResultUpgradable = { remediation: { upgrade: { foo: {} } } };
      const testResultPatchable = { remediation: { patch: { bar: {} } } };
      const testResultNone = {
        remediation: { upgrade: {}, pin: {}, patch: {} },
      };

      expect(isFixable(testResultUpgradable)).toBe(true);
      expect(isFixable(testResultPatchable)).toBe(true);
      expect(isFixable(testResultNone)).toBe(false);
      expect(hasFixes([testResultNone, testResultPatchable])).toBe(true);
      expect(hasFixes([testResultNone])).toBe(false);
    });
  });

  describe('vuln-level fixability helpers', () => {
    it('correctly evaluates individual vuln fixability flags', () => {
      expect(isVulnUpgradable({ isUpgradable: true })).toBe(true);
      expect(isVulnUpgradable({ isPinnable: true })).toBe(true);
      expect(isVulnUpgradable({ isUpgradable: false, isPinnable: false })).toBe(
        false,
      );

      expect(isVulnPatchable({ isPatchable: true })).toBe(true);
      expect(isVulnPatchable({ isPatchable: false })).toBe(false);

      expect(isVulnFixable({ isUpgradable: true })).toBe(true);
      expect(isVulnFixable({ isPatchable: true })).toBe(true);
      expect(isVulnFixable({})).toBe(false);
    });
  });
});
