const fs = require('fs');

let cachedIsDocker: boolean | null = null;

export function isDocker(): boolean {
  if (cachedIsDocker !== null) {
    return cachedIsDocker;
  }
  const result = hasDockerEnv() || hasDockerCGroup();
  cachedIsDocker = result;
  return result;
}

export function resetIsDockerCache(): void {
  cachedIsDocker = null;
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
