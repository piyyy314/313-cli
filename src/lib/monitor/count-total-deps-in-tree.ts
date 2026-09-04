import { DepTree } from '../types';

export function countTotalDependenciesInTree(depTree: DepTree): number {
  let count = 0;
  const deps = depTree.dependencies;
  if (deps) {
    // Bolt: Use for...in loop instead of Object.keys() to avoid allocating
    // temporary key arrays during recursive tree traversal.
    for (const name in deps) {
      const dep = deps[name];
      if (dep) {
        count += 1 + countTotalDependenciesInTree(dep);
      }
    }
  }
  return count;
}
