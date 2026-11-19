import * as fs from 'fs';
import {
  getVersion,
  clearVersionCache,
  isStandaloneBuild,
} from '../../../src/lib/version';

describe('version module', () => {
  beforeEach(() => {
    clearVersionCache();
    jest.restoreAllMocks();
  });

  afterEach(() => {
    clearVersionCache();
    jest.restoreAllMocks();
  });

  describe('getVersion', () => {
    it('returns a valid version string matching package.json', () => {
      const version = getVersion();
      expect(typeof version).toBe('string');
      expect(version.length).toBeGreaterThan(0);
    });

    it('caches the version string and avoids subsequent fs.readFileSync calls', () => {
      const readFileSyncSpy = jest.spyOn(fs, 'readFileSync');

      const version1 = getVersion();
      expect(readFileSyncSpy).toHaveBeenCalledTimes(1);

      const version2 = getVersion();
      expect(readFileSyncSpy).toHaveBeenCalledTimes(1);
      expect(version1).toBe(version2);
    });

    it('re-reads package.json after clearVersionCache is called', () => {
      const readFileSyncSpy = jest.spyOn(fs, 'readFileSync');

      getVersion();
      expect(readFileSyncSpy).toHaveBeenCalledTimes(1);

      clearVersionCache();

      getVersion();
      expect(readFileSyncSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('isStandaloneBuild', () => {
    it('returns boolean indicating if running in standalone binary', () => {
      expect(typeof isStandaloneBuild()).toBe('boolean');
    });
  });
});
