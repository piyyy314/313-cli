import { countUniqueVulns } from '../../../../../src/lib/snyk-test/run-test';
import { AnnotatedIssue } from '../../../../../src/lib/snyk-test/legacy';

describe('countUniqueVulns', () => {
  it('returns 0 when vulnerabilities array is empty', () => {
    expect(countUniqueVulns([])).toBe(0);
  });

  it('returns count of unique vulnerability IDs when all IDs are distinct', () => {
    const vulns = [
      { id: 'SNYK-JS-LODASH-567746' },
      { id: 'SNYK-JS-EXPRESS-123456' },
      { id: 'SNYK-JS-AXIOS-987654' },
    ] as AnnotatedIssue[];

    expect(countUniqueVulns(vulns)).toBe(3);
  });

  it('correctly deduplicates vulnerabilities with identical IDs', () => {
    const vulns = [
      { id: 'SNYK-JS-LODASH-567746' },
      { id: 'SNYK-JS-LODASH-567746' },
      { id: 'SNYK-JS-EXPRESS-123456' },
      { id: 'SNYK-JS-LODASH-567746' },
    ] as AnnotatedIssue[];

    expect(countUniqueVulns(vulns)).toBe(2);
  });
});
