import { DepTree } from '../types';

interface FilteredDepTree {
  filteredDepTree: DepTree;
  missingDeps: string[];
}

export function filterOutMissingDeps(depTree: DepTree): FilteredDepTree {
  const filteredDeps = {};
  const missingDeps: string[] = [];

  const deps = depTree.dependencies;
  if (!deps) {
    return {
      filteredDepTree: depTree,
      missingDeps,
    };
  }

  // Bolt: Use for...in loop instead of Object.keys() to avoid allocating temporary key arrays.
  for (const depKey in deps) {
    const dep = deps[depKey];
    if (
      (dep as any).missingLockFileEntry ||
      ((dep as any).labels && (dep as any).labels.missingLockFileEntry)
    ) {
      // TODO(kyegupov): add field to the type
      missingDeps.push(`${dep.name}@${dep.version}`);
    } else {
      filteredDeps[depKey] = dep;
    }
  }
  const filteredDepTree: DepTree = {
    ...depTree,
    dependencies: filteredDeps,
  };

  return {
    filteredDepTree,
    missingDeps,
  };
}
