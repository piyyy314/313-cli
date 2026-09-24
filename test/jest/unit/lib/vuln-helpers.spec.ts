import {
  isUpgradable,
  isPatchable,
  isFixable,
  hasFixes,
  hasUpgrades,
  hasPatches,
  isVulnUpgradable,
  isVulnPatchable,
  isVulnFixable,
  isNewVuln,
} from '../../../../src/lib/vuln-helpers';

describe('vuln-helpers', () => {
  describe('isUpgradable', () => {
    it('returns true when remediation.upgrade has keys', () => {
      const testResult = {
        remediation: {
          upgrade: {
            'pkg@1.0.0': { upgradeTo: 'pkg@2.0.0' },
          },
        },
      };
      expect(isUpgradable(testResult)).toBe(true);
    });

    it('returns true when remediation.pin has keys', () => {
      const testResult = {
        remediation: {
          pin: {
            'pkg@1.0.0': { upgradeTo: 'pkg@1.1.0' },
          },
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

    it('falls back to vulnerabilities when remediation is missing', () => {
      const testResult = {
        vulnerabilities: [{ isUpgradable: true }],
      };
      expect(isUpgradable(testResult)).toBe(true);
    });

    it('returns false when fallback vulnerabilities are not upgradable', () => {
      const testResult = {
        vulnerabilities: [{ isUpgradable: false, isPinnable: false }],
      };
      expect(isUpgradable(testResult)).toBe(false);
    });
  });

  describe('isPatchable', () => {
    it('returns true when remediation.patch has keys', () => {
      const testResult = {
        remediation: {
          patch: {
            'pkg@1.0.0': { patches: [] },
          },
        },
      };
      expect(isPatchable(testResult)).toBe(true);
    });

    it('returns false when remediation.patch is empty', () => {
      const testResult = {
        remediation: {
          patch: {},
        },
      };
      expect(isPatchable(testResult)).toBe(false);
    });

    it('falls back to vulnerabilities when remediation is missing', () => {
      const testResult = {
        vulnerabilities: [{ isPatchable: true }],
      };
      expect(isPatchable(testResult)).toBe(true);
    });
  });

  describe('isFixable', () => {
    it('returns true if testResult is upgradable or patchable', () => {
      const upgradable = { remediation: { upgrade: { a: 1 } } };
      const patchable = { remediation: { patch: { b: 2 } } };
      const neither = { remediation: { upgrade: {}, pin: {}, patch: {} } };

      expect(isFixable(upgradable)).toBe(true);
      expect(isFixable(patchable)).toBe(true);
      expect(isFixable(neither)).toBe(false);
    });
  });

  describe('hasFixes, hasUpgrades, hasPatches', () => {
    it('hasFixes returns true if any test result in array is fixable', () => {
      const results = [
        { remediation: { upgrade: {} } },
        { remediation: { patch: { a: 1 } } },
      ];
      expect(hasFixes(results)).toBe(true);
    });

    it('hasUpgrades returns true if any test result in array is upgradable', () => {
      const results = [
        { remediation: { upgrade: { a: 1 } } },
        { remediation: { patch: { b: 2 } } },
      ];
      expect(hasUpgrades(results)).toBe(true);
    });

    it('hasPatches returns true if any test result in array is patchable', () => {
      const results = [
        { remediation: { upgrade: { a: 1 } } },
        { remediation: { patch: { b: 2 } } },
      ];
      expect(hasPatches(results)).toBe(true);
    });
  });

  describe('isVulnUpgradable, isVulnPatchable, isVulnFixable', () => {
    it('isVulnUpgradable checks isUpgradable or isPinnable', () => {
      expect(isVulnUpgradable({ isUpgradable: true })).toBe(true);
      expect(isVulnUpgradable({ isPinnable: true })).toBe(true);
      expect(isVulnUpgradable({ isUpgradable: false, isPinnable: false })).toBe(
        false,
      );
    });

    it('isVulnPatchable checks isPatchable', () => {
      expect(isVulnPatchable({ isPatchable: true })).toBe(true);
      expect(isVulnPatchable({ isPatchable: false })).toBe(false);
    });

    it('isVulnFixable checks upgradable or patchable', () => {
      expect(isVulnFixable({ isUpgradable: true })).toBe(true);
      expect(isVulnFixable({ isPatchable: true })).toBe(true);
      expect(isVulnFixable({ isUpgradable: false, isPatchable: false })).toBe(
        false,
      );
    });
  });

  describe('isNewVuln', () => {
    it('returns true if publicationTime is within the last 30 days', () => {
      const now = Date.now();
      const recentDate = new Date(now - 1000 * 60 * 60 * 24 * 5).toISOString();
      expect(isNewVuln({ publicationTime: recentDate })).toBe(true);
    });

    it('returns false if publicationTime is older than 30 days', () => {
      const now = Date.now();
      const oldDate = new Date(now - 1000 * 60 * 60 * 24 * 60).toISOString();
      expect(isNewVuln({ publicationTime: oldDate })).toBe(false);
    });
  });
});
