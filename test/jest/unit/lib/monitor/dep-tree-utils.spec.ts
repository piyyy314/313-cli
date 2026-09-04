import { dropEmptyDeps } from '../../../../../src/lib/monitor/drop-empty-deps';
import { countTotalDependenciesInTree } from '../../../../../src/lib/monitor/count-total-deps-in-tree';
import { filterOutMissingDeps } from '../../../../../src/lib/monitor/filter-out-missing-deps';
import { DepTree } from '../../../../../src/lib/types';

describe('monitor dep-tree utils', () => {
  describe('dropEmptyDeps', () => {
    it('removes empty dependencies object', () => {
      const tree: DepTree = {
        name: 'root',
        version: '1.0.0',
        dependencies: {},
      };
      const result = dropEmptyDeps(tree);
      expect(result.dependencies).toBeUndefined();
    });

    it('recursively removes empty dependencies objects from subdependencies', () => {
      const tree: DepTree = {
        name: 'root',
        version: '1.0.0',
        dependencies: {
          depA: {
            name: 'depA',
            version: '1.0.0',
            dependencies: {},
          },
          depB: {
            name: 'depB',
            version: '2.0.0',
            dependencies: {
              depC: {
                name: 'depC',
                version: '3.0.0',
              },
            },
          },
        },
      };

      const result = dropEmptyDeps(tree);
      expect(result.dependencies?.depA.dependencies).toBeUndefined();
      expect(
        result.dependencies?.depB.dependencies?.depC.dependencies,
      ).toBeUndefined();
    });
  });

  describe('countTotalDependenciesInTree', () => {
    it('returns 0 when there are no dependencies', () => {
      const tree: DepTree = {
        name: 'root',
        version: '1.0.0',
      };
      expect(countTotalDependenciesInTree(tree)).toBe(0);
    });

    it('correctly counts all nested dependencies', () => {
      const tree: DepTree = {
        name: 'root',
        version: '1.0.0',
        dependencies: {
          depA: {
            name: 'depA',
            version: '1.0.0',
            dependencies: {
              depA1: { name: 'depA1', version: '1.1.0' },
            },
          },
          depB: {
            name: 'depB',
            version: '2.0.0',
          },
        },
      };
      expect(countTotalDependenciesInTree(tree)).toBe(3);
    });
  });

  describe('filterOutMissingDeps', () => {
    it('handles tree without dependencies', () => {
      const tree: DepTree = {
        name: 'root',
        version: '1.0.0',
      };
      const result = filterOutMissingDeps(tree);
      expect(result.filteredDepTree).toEqual(tree);
      expect(result.missingDeps).toEqual([]);
    });

    it('filters out missing lockfile entries and collects them', () => {
      const tree: DepTree = {
        name: 'root',
        version: '1.0.0',
        dependencies: {
          validDep: { name: 'validDep', version: '1.0.0' },
          missingDep1: {
            name: 'missingDep1',
            version: '2.0.0',
            missingLockFileEntry: true,
          } as any,
          missingDep2: {
            name: 'missingDep2',
            version: '3.0.0',
            labels: { missingLockFileEntry: 'true' },
          } as any,
        },
      };

      const result = filterOutMissingDeps(tree);
      expect(Object.keys(result.filteredDepTree.dependencies!)).toEqual([
        'validDep',
      ]);
      expect(result.missingDeps).toEqual([
        'missingDep1@2.0.0',
        'missingDep2@3.0.0',
      ]);
    });
  });
});
