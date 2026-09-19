// check if vuln was published in the last month
export function isNewVuln(vuln) {
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

/**
 * Fast O(1) check to determine if an object has enumerable keys without
 * allocating a temporary string array via Object.keys().
 */
function hasKeys(obj: Record<string, unknown> | undefined | null): boolean {
  if (!obj) {
    return false;
  }
  for (const key in obj) {
    return true;
  }
  return false;
}

export function isUpgradable(testResult: any): boolean {
  if (testResult.remediation) {
    const {
      remediation: { upgrade = {}, pin = {} },
    } = testResult;
    return hasKeys(upgrade) || hasKeys(pin);
  }
  // if remediation is not available, fallback on vuln properties
  const { vulnerabilities = {} } = testResult;
  return vulnerabilities.some(isVulnUpgradable);
}

export function hasUpgrades(testResults: any[]): boolean {
  return testResults.some(isUpgradable);
}

export function isPatchable(testResult: any): boolean {
  if (testResult.remediation) {
    const {
      remediation: { patch = {} },
    } = testResult;
    return hasKeys(patch);
  }
  // if remediation is not available, fallback on vuln properties
  const { vulnerabilities = {} } = testResult;
  return vulnerabilities.some(isVulnPatchable);
}

export function hasPatches(testResults: any[]): boolean {
  return testResults.some(isPatchable);
}

export function isVulnUpgradable(vuln) {
  return vuln.isUpgradable || vuln.isPinnable;
}

export function isVulnPatchable(vuln) {
  return vuln.isPatchable;
}

export function isVulnFixable(vuln) {
  return isVulnUpgradable(vuln) || isVulnPatchable(vuln);
}
