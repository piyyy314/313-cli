// Helper function to check if an object has any keys without allocating an array with Object.keys()
// Optimization (Bolt): O(1) early exit loop avoids array allocation and O(N) key extraction overhead.
function hasKeys(obj: Record<string, any> | undefined | null): boolean {
  if (!obj) {
    return false;
  }
  for (const _key in obj) {
    return true;
  }
  return false;
}

// check if vuln was published in the last month
export function isNewVuln(vuln: any): boolean {
  const MONTH = 30 * 24 * 60 * 60 * 1000;
  const publicationTime = new Date(vuln.publicationTime).getTime();
  return publicationTime > Date.now() - MONTH;
}

export function isFixable(testResult: any): boolean {
  return isUpgradable(testResult) || isPatchable(testResult);
}

export function hasFixes(testResults: any[]): boolean {
  return testResults.some(isFixable);
}

export function isUpgradable(testResult: any): boolean {
  if (testResult.remediation) {
    const {
      remediation: { upgrade, pin },
    } = testResult;
    return hasKeys(upgrade) || hasKeys(pin);
  }
  // if remediation is not available, fallback on vuln properties
  const { vulnerabilities = [] } = testResult;
  return vulnerabilities.some(isVulnUpgradable);
}

export function hasUpgrades(testResults: any[]): boolean {
  return testResults.some(isUpgradable);
}

export function isPatchable(testResult: any): boolean {
  if (testResult.remediation) {
    const {
      remediation: { patch },
    } = testResult;
    return hasKeys(patch);
  }
  // if remediation is not available, fallback on vuln properties
  const { vulnerabilities = [] } = testResult;
  return vulnerabilities.some(isVulnPatchable);
}

export function hasPatches(testResults: any[]): boolean {
  return testResults.some(isPatchable);
}

export function isVulnUpgradable(vuln: any): boolean {
  return Boolean(vuln.isUpgradable || vuln.isPinnable);
}

export function isVulnPatchable(vuln: any): boolean {
  return Boolean(vuln.isPatchable);
}

export function isVulnFixable(vuln: any): boolean {
  return isVulnUpgradable(vuln) || isVulnPatchable(vuln);
}
