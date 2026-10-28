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
      const recentDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
      expect(isNewVuln({ publicationTime: recentDate })).toBe(true);
    });

    it('returns false for vulnerabilities published over a month ago', () => {
      const oldDate = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString();
      expect(isNewVuln({ publicationTime: oldDate })).toBe(false);
    });
  });

  describe('isUpgradable', () => {
    it('returns true when remediation contains upgrades', () => {
      const result = {
        remediation: {
          upgrade: { 'dep-1': {} },
        },
      };
      expect(isUpgradable(result)).toBe(true);
    });

    it('returns true when remediation contains pins', () => {
      const result = {
        remediation: {
          pin: { 'dep-1': {} },
        },
      };
      expect(isUpgradable(result)).toBe(true);
    });

    it('returns false when remediation is empty', () => {
      const result = {
        remediation: {
          upgrade: {},
          pin: {},
        },
      };
      expect(isUpgradable(result)).toBe(false);
    });

    it('falls back to vulnerabilities array when remediation is undefined', () => {
      const resultWithUpgradableVuln = {
        vulnerabilities: [{ isUpgradable: true }],
      };
      const resultWithoutUpgradableVuln = {
        vulnerabilities: [{ isUpgradable: false, isPinnable: false }],
      };
      expect(isUpgradable(resultWithUpgradableVuln)).toBe(true);
      expect(isUpgradable(resultWithoutUpgradableVuln)).toBe(false);
    });
  });

  describe('isPatchable', () => {
    it('returns true when remediation contains patches', () => {
      const result = {
        remediation: {
          patch: { 'dep-1': {} },
        },
      };
      expect(isPatchable(result)).toBe(true);
    });

    it('returns false when remediation patch is empty', () => {
      const result = {
        remediation: {
          patch: {},
        },
      };
      expect(isPatchable(result)).toBe(false);
    });

    it('falls back to vulnerabilities array when remediation is undefined', () => {
      const resultWithPatchableVuln = {
        vulnerabilities: [{ isPatchable: true }],
      };
      const resultWithoutPatchableVuln = {
        vulnerabilities: [{ isPatchable: false }],
      };
      expect(isPatchable(resultWithPatchableVuln)).toBe(true);
      expect(isPatchable(resultWithoutPatchableVuln)).toBe(false);
    });
  });

  describe('isFixable and hasFixes', () => {
    it('isFixable returns true if upgradable or patchable', () => {
      const upgradable = { remediation: { upgrade: { a: {} } } };
      const patchable = { remediation: { patch: { b: {} } } };
      const nonFixable = { remediation: { upgrade: {}, patch: {} } };

      expect(isFixable(upgradable)).toBe(true);
      expect(isFixable(patchable)).toBe(true);
      expect(isFixable(nonFixable)).toBe(false);

      expect(hasFixes([nonFixable, patchable])).toBe(true);
      expect(hasFixes([nonFixable])).toBe(false);
    });

    it('hasUpgrades and hasPatches return true if any item matches', () => {
      const upgradable = { remediation: { upgrade: { a: {} } } };
      const patchable = { remediation: { patch: { b: {} } } };

      expect(hasUpgrades([patchable, upgradable])).toBe(true);
      expect(hasUpgrades([patchable])).toBe(false);

      expect(hasPatches([upgradable, patchable])).toBe(true);
      expect(hasPatches([upgradable])).toBe(false);
    });
  });

  describe('individual vuln predicates', () => {
    it('isVulnUpgradable checks isUpgradable or isPinnable', () => {
      expect(isVulnUpgradable({ isUpgradable: true })).toBe(true);
      expect(isVulnUpgradable({ isPinnable: true })).toBe(true);
      expect(isVulnUpgradable({})).toBeFalsy();
    });

    it('isVulnPatchable checks isPatchable', () => {
      expect(isVulnPatchable({ isPatchable: true })).toBe(true);
      expect(isVulnPatchable({})).toBeFalsy();
    });

    it('isVulnFixable checks upgradable or patchable', () => {
      expect(isVulnFixable({ isUpgradable: true })).toBe(true);
      expect(isVulnFixable({ isPatchable: true })).toBe(true);
      expect(isVulnFixable({})).toBeFalsy();
    });
  });
});
