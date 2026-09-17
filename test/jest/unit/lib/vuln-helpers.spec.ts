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
  describe('isUpgradable', () => {
    it('returns true when remediation has upgrade or pin properties with keys', () => {
      expect(isUpgradable({ remediation: { upgrade: { foo: {} } } })).toBe(
        true,
      );
      expect(isUpgradable({ remediation: { pin: { bar: {} } } })).toBe(true);
    });

    it('returns false when remediation has empty upgrade and pin properties', () => {
      expect(isUpgradable({ remediation: { upgrade: {}, pin: {} } })).toBe(
        false,
      );
      expect(isUpgradable({ remediation: {} })).toBe(false);
    });

    it('falls back to vulnerabilities array when remediation is missing', () => {
      expect(
        isUpgradable({
          vulnerabilities: [{ isUpgradable: true }, { isUpgradable: false }],
        }),
      ).toBe(true);
      expect(
        isUpgradable({
          vulnerabilities: [{ isUpgradable: false, isPinnable: false }],
        }),
      ).toBe(false);
    });
  });

  describe('isPatchable', () => {
    it('returns true when remediation has patch properties with keys', () => {
      expect(isPatchable({ remediation: { patch: { patch1: {} } } })).toBe(
        true,
      );
    });

    it('returns false when remediation has empty patch property', () => {
      expect(isPatchable({ remediation: { patch: {} } })).toBe(false);
      expect(isPatchable({ remediation: {} })).toBe(false);
    });

    it('falls back to vulnerabilities array when remediation is missing', () => {
      expect(
        isPatchable({
          vulnerabilities: [{ isPatchable: true }],
        }),
      ).toBe(true);
      expect(
        isPatchable({
          vulnerabilities: [{ isPatchable: false }],
        }),
      ).toBe(false);
    });
  });

  describe('isFixable and hasFixes', () => {
    it('checks if testResult is fixable', () => {
      expect(isFixable({ remediation: { upgrade: { a: {} } } })).toBe(true);
      expect(isFixable({ remediation: { patch: { b: {} } } })).toBe(true);
      expect(isFixable({ remediation: {} })).toBe(false);
    });

    it('checks if any testResult in list has fixes', () => {
      expect(
        hasFixes([
          { remediation: {} },
          { remediation: { upgrade: { a: {} } } },
        ]),
      ).toBe(true);
      expect(hasFixes([{ remediation: {} }])).toBe(false);
    });
  });

  describe('hasUpgrades and hasPatches', () => {
    it('checks hasUpgrades', () => {
      expect(hasUpgrades([{ remediation: { upgrade: { a: {} } } }])).toBe(true);
      expect(hasUpgrades([{ remediation: {} }])).toBe(false);
    });

    it('checks hasPatches', () => {
      expect(hasPatches([{ remediation: { patch: { a: {} } } }])).toBe(true);
      expect(hasPatches([{ remediation: {} }])).toBe(false);
    });
  });

  describe('isVulnUpgradable, isVulnPatchable, isVulnFixable', () => {
    it('evaluates individual vulnerability flags', () => {
      expect(isVulnUpgradable({ isUpgradable: true })).toBe(true);
      expect(isVulnUpgradable({ isPinnable: true })).toBe(true);
      expect(isVulnUpgradable({ isUpgradable: false, isPinnable: false })).toBe(
        false,
      );

      expect(isVulnPatchable({ isPatchable: true })).toBe(true);
      expect(isVulnPatchable({ isPatchable: false })).toBe(false);

      expect(isVulnFixable({ isUpgradable: true })).toBe(true);
      expect(isVulnFixable({ isPatchable: true })).toBe(true);
      expect(isVulnFixable({})).toBeFalsy();
    });
  });

  describe('isNewVuln', () => {
    it('identifies vulnerabilities published within the last 30 days', () => {
      const recentDate = new Date(
        Date.now() - 1000 * 60 * 60 * 24 * 5,
      ).toISOString();
      const oldDate = new Date(
        Date.now() - 1000 * 60 * 60 * 24 * 40,
      ).toISOString();

      expect(isNewVuln({ publicationTime: recentDate })).toBe(true);
      expect(isNewVuln({ publicationTime: oldDate })).toBe(false);
    });
  });
});
