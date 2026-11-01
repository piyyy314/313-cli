import { warnSomeGradleManifestsNotScanned } from '../../../../../src/lib/plugins/get-deps-from-plugin';
import * as path from 'path';

describe('warnSomeGradleManifestsNotScanned', () => {
  const root = '/root/project';

  it('returns null when all detected Gradle manifests are scanned', () => {
    const allFilesFound = [
      path.resolve(root, 'build.gradle'),
      path.resolve(root, 'subproject/build.gradle.kts'),
    ];
    const scannedProjects = [
      { targetFile: 'build.gradle' },
      { meta: { targetFile: 'subproject/build.gradle.kts' } },
    ];

    const result = warnSomeGradleManifestsNotScanned(
      scannedProjects as any,
      allFilesFound,
      root,
    );

    expect(result).toBeNull();
  });

  it('returns warning message when some Gradle manifests are not scanned', () => {
    const allFilesFound = [
      path.resolve(root, 'build.gradle'),
      path.resolve(root, 'unscanned/build.gradle'),
      path.resolve(root, 'subproject/build.gradle.kts'),
    ];
    const scannedProjects = [{ targetFile: 'build.gradle' }];

    const result = warnSomeGradleManifestsNotScanned(
      scannedProjects as any,
      allFilesFound,
      root,
    );

    expect(result).not.toBeNull();
    expect(result).toContain(
      '2/3 detected Gradle manifests did not return dependencies',
    );
  });

  it('ignores non-gradle files when filtering detected files and scanned projects', () => {
    const allFilesFound = [
      path.resolve(root, 'package.json'),
      path.resolve(root, 'build.gradle'),
    ];
    const scannedProjects = [
      { targetFile: 'package.json' },
      { targetFile: 'build.gradle' },
    ];

    const result = warnSomeGradleManifestsNotScanned(
      scannedProjects as any,
      allFilesFound,
      root,
    );

    expect(result).toBeNull();
  });
});
