import { SEVERITIES, SEVERITY } from '../snyk-test/common';

// Bolt Optimization: Pre-compute a severity value lookup map at module load time
// to replace O(N) array searching (`SEVERITIES.find`) with O(1) property lookup
// when sorting and formatting vulnerabilities by severity.
const SEVERITY_VALUE_MAP: Record<string, number> = {
  none: 0,
  ...SEVERITIES.reduce(
    (acc, s) => {
      acc[s.verboseName] = s.value;
      return acc;
    },
    {} as Record<string, number>,
  ),
};

export function getSeverityValue(severity: SEVERITY | 'none'): number {
  return SEVERITY_VALUE_MAP[severity] ?? 0;
}
