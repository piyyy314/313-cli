import * as fs from 'fs';
import * as path from 'path';

let cachedVersion: string | null = null;

/**
 * Optimization (Bolt):
 * Synchronous file-system read operations (`fs.readFileSync`) and JSON parsing (`JSON.parse`)
 * are blocking and incur repeated overhead when `getVersion()` is invoked across multiple HTTP
 * requests, analytics events, and SARIF reports. We cache the version string in `cachedVersion`
 * so that subsequent calls are O(1) property lookups without disk I/O.
 */
export function getVersion(): string {
  if (cachedVersion !== null) {
    return cachedVersion;
  }

  const root = path.resolve(__dirname, '../..');

  const { version } = JSON.parse(
    fs.readFileSync(path.join(root, 'package.json'), 'utf8'),
  );

  cachedVersion = version;
  return version;
}

export function clearVersionCache(): void {
  cachedVersion = null;
}

/**
 * We use pkg to create standalone builds (binaries).
 * pkg uses `process.pkg` to identify itself at runtime so we can do the same.
 * https://github.com/vercel/pkg
 */
export function isStandaloneBuild() {
  return 'pkg' in process;
}
