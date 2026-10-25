import { PackageExpanded } from 'snyk-resolve-deps/dist/types';

// Bolt Optimization: Recursively collect policy values into a single accumulator array
// using a for...in loop over dependencies to eliminate intermediate array allocations
// (Object.keys(), .map(), .filter()) and lodash.flatten calls.
function collectPolicies(pkg: PackageExpanded, acc: string[]): void {
  if (!pkg) {
    return;
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore: broken type
  if (pkg.snyk) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore: broken type
    const policy = pkg.snyk;
    if (Array.isArray(policy)) {
      for (let i = 0; i < policy.length; i++) {
        if (policy[i]) {
          acc.push(policy[i]);
        }
      }
    } else if (policy) {
      acc.push(policy);
    }
    return;
  }

  if (!pkg.dependencies) {
    return;
  }

  for (const name in pkg.dependencies) {
    if (Object.prototype.hasOwnProperty.call(pkg.dependencies, name)) {
      collectPolicies(pkg.dependencies[name], acc);
    }
  }
}

export function pluckPolicies(pkg: PackageExpanded): string[] | string {
  if (!pkg) {
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore: broken type
  if (pkg.snyk) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore: broken type
    return pkg.snyk;
  }

  if (!pkg.dependencies) {
    return [];
  }

  const res: string[] = [];
  for (const name in pkg.dependencies) {
    if (Object.prototype.hasOwnProperty.call(pkg.dependencies, name)) {
      collectPolicies(pkg.dependencies[name], res);
    }
  }

  return res;
}
