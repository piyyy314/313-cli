import { DepTree } from '../types';

export function dropEmptyDeps(depTree: DepTree) {
  const deps = depTree.dependencies;
  if (deps) {
    let hasKeys = false;
    // Bolt: Use for...in loop instead of Object.keys() to avoid temporary key array
    // allocations and redundant property lookups on large dependency trees.
    for (const k in deps) {
      hasKeys = true;
      dropEmptyDeps(deps[k]);
    }
    if (!hasKeys) {
      delete depTree.dependencies;
    }
  }
  return depTree;
}
