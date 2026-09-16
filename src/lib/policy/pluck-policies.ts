import { PackageExpanded } from 'snyk-resolve-deps/dist/types';

/**
 * Recursively extracts Snyk policy locations/content from a dependency tree node.
 * Uses a single result array accumulator and `for...in` traversal over `pkg.dependencies`
 * to avoid temporary key array allocations (`Object.keys()`) and `lodash.flatten` array copying.
 */
function collectPolicies(pkg: PackageExpanded, results: string[]): void {
  if (!pkg) {
    return;
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore: broken type
  if (pkg.snyk) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore: broken type
    const snykVal = pkg.snyk;
    if (Array.isArray(snykVal)) {
      results.push(...snykVal);
    } else {
      results.push(snykVal);
    }
    return;
  }

  if (!pkg.dependencies) {
    return;
  }

  for (const name in pkg.dependencies) {
    if (Object.prototype.hasOwnProperty.call(pkg.dependencies, name)) {
      collectPolicies(pkg.dependencies[name], results);
    }
  }
}

export function pluckPolicies(pkg: PackageExpanded): string[] {
  const results: string[] = [];
  collectPolicies(pkg, results);
  return results;
}
