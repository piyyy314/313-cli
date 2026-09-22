const fs = require('fs');

let cachedIsDocker: boolean | null = null;

/**
 * Checks if the execution is running inside a Docker container.
 *
 * Optimization (Bolt):
 * Synchronous file-system read operations (fs.statSync, fs.readFileSync) are blocking
 * and relatively expensive. We cache the calculated result of isDocker() inside `cachedIsDocker`
 * so that subsequent calls are O(1) and do not access the file system.
 * Caching is bypassed during tests (NODE_ENV === 'test') to support different mocking setups
 * in the test suite.
 */
export function isDocker(): boolean {
  if (process.env.NODE_ENV === 'test') {
    return hasDockerEnv() || hasDockerCGroup();
  }
  if (cachedIsDocker !== null) {
    return cachedIsDocker;
  }
  const result = hasDockerEnv() || hasDockerCGroup();
  cachedIsDocker = result;
  return result;
}

function hasDockerEnv() {
  try {
    fs.statSync('/.dockerenv');
    return true;
  } catch (_) {
    return false;
  }
}

function hasDockerCGroup() {
  try {
    return fs.readFileSync('/proc/self/cgroup', 'utf8').includes('docker');
  } catch (_) {
    return false;
  }
}
