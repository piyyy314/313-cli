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

    it('returns false for vulnerabilities published over 30 days ago', () => {
      const oldDate = new Date(
        Date.now() - 60 * 24 * 60 * 60 * 1000,
      ).toISOString();
      expect(isNewVuln({ publicationTime: oldDate })).toBe(false);
    });
  });

  describe('isUpgradable', () => {
    it('returns true when remediation contains non-empty upgrade object', () => {
      const result = {
        remediation: {
          upgrade: { 'pkg@1.0.0': { upgradeTo: '1.0.1' } },
        },
      };
      expect(isUpgradable(result)).toBe(true);
    });

    it('returns true when remediation contains non-empty pin object', () => {
      const result = {
        remediation: {
          pin: { 'pkg@1.0.0': { isTransitive: true } },
        },
      };
      expect(isUpgradable(result)).toBe(true);
    });

    it('returns false when remediation upgrade and pin objects are empty', () => {
      const result = {
        remediation: {
          upgrade: {},
          pin: {},
        },
      };
      expect(isUpgradable(result)).toBe(false);
    });

    it('falls back to vulnerabilities array when remediation is not provided', () => {
      const resultWithUpgradable = {
        vulnerabilities: [{ isUpgradable: true }],
      };
      const resultWithoutUpgradable = {
        vulnerabilities: [{ isUpgradable: false }],
      };
      const resultWithNoVulns = {};

      expect(isUpgradable(resultWithUpgradable)).toBe(true);
      expect(isUpgradable(resultWithoutUpgradable)).toBe(false);
      expect(isUpgradable(resultWithNoVulns)).toBe(false);
    });
  });

  describe('isPatchable', () => {
    it('returns true when remediation contains non-empty patch object', () => {
      const result = {
        remediation: {
          patch: { 'SNYK-JS-123': { patch: 'diff' } },
        },
      };
      expect(isPatchable(result)).toBe(true);
    });

    it('returns false when remediation patch object is empty', () => {
      const result = {
        remediation: {
          patch: {},
        },
      };
      expect(isPatchable(result)).toBe(false);
    });

    it('falls back to vulnerabilities array when remediation is not provided', () => {
      const resultWithPatchable = {
        vulnerabilities: [{ isPatchable: true }],
      };
      const resultWithoutPatchable = {
        vulnerabilities: [{ isPatchable: false }],
      };
      const resultWithNoVulns = {};

      expect(isPatchable(resultWithPatchable)).toBe(true);
      expect(isPatchable(resultWithoutPatchable)).toBe(false);
      expect(isPatchable(resultWithNoVulns)).toBe(false);
    });
  });

  describe('isFixable and hasFixes', () => {
    it('returns true if upgradable or patchable', () => {
      const upgradable = { remediation: { upgrade: { a: 1 } } };
      const patchable = { remediation: { patch: { b: 2 } } };
      const unfixable = { remediation: {} };

      expect(isFixable(upgradable)).toBe(true);
      expect(isFixable(patchable)).toBe(true);
      expect(isFixable(unfixable)).toBe(false);

      expect(hasFixes([unfixable, patchable])).toBe(true);
      expect(hasFixes([unfixable])).toBe(false);
    });
  });

  describe('hasUpgrades and hasPatches', () => {
    it('correctly checks collections of test results', () => {
      const upgradable = { remediation: { upgrade: { a: 1 } } };
      const patchable = { remediation: { patch: { b: 2 } } };
      const empty = { remediation: {} };

      expect(hasUpgrades([empty, upgradable])).toBe(true);
      expect(hasUpgrades([empty, patchable])).toBe(false);

      expect(hasPatches([empty, patchable])).toBe(true);
      expect(hasPatches([empty, upgradable])).toBe(false);
    });
  });

  describe('vuln-specific helpers', () => {
    it('isVulnUpgradable checks isUpgradable or isPinnable', () => {
      expect(isVulnUpgradable({ isUpgradable: true })).toBe(true);
      expect(isVulnUpgradable({ isPinnable: true })).toBe(true);
      expect(isVulnUpgradable({})).toBe(undefined);
    });

    it('isVulnPatchable checks isPatchable', () => {
      expect(isVulnPatchable({ isPatchable: true })).toBe(true);
      expect(isVulnPatchable({})).toBe(undefined);
    });

    it('isVulnFixable checks upgradable or patchable', () => {
      expect(isVulnFixable({ isUpgradable: true })).toBe(true);
      expect(isVulnFixable({ isPatchable: true })).toBe(true);
      expect(isVulnFixable({})).toBe(undefined);
    });
  });
});
