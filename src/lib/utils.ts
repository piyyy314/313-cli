import * as cloneDeep from 'lodash.clonedeep';
import { DepGraph } from '@snyk/dep-graph';
import { ArgsOptions, MethodArgs } from '../cli/args';
import { MAX_STRING_LENGTH } from './constants';

export function countPathsToGraphRoot(graph: DepGraph): number {
  return graph
    .getPkgs()
    .reduce((acc, pkg) => acc + graph.countPathsToRoot(pkg), 0);
}

const SENSITIVE_KEYS = new Set([
  'username',
  'password',
  'token',
  'tfctoken',
  'azurermaccountkey',
  'fetchtfstateheaders',
  'apikey',
  'snyktoken',
  'oauthtoken',
  'auth',
  'authorization',
  'clientsecret',
  'secret',
  'accesstoken',
  'refreshtoken',
]);

function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[-_]/g, '');
}

function recursiveObfuscate(obj: any, visited = new WeakSet()): void {
  if (!obj || typeof obj !== 'object' || visited.has(obj)) {
    return;
  }
  visited.add(obj);

  for (const key of Object.keys(obj)) {
    const normalizedKey = normalizeKey(key);
    if (SENSITIVE_KEYS.has(normalizedKey)) {
      if (obj[key] !== undefined && obj[key] !== null) {
        obj[key] = `${key}-set`;
      }
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      recursiveObfuscate(obj[key], visited);
    }
  }
}

export function obfuscateArgs(
  args: ArgsOptions | MethodArgs,
): ArgsOptions | MethodArgs {
  const obfuscatedArgs = cloneDeep(args);
  recursiveObfuscate(obfuscatedArgs);
  return obfuscatedArgs;
}

export function truncateForLog(value: string): string {
  return value.length > MAX_STRING_LENGTH
    ? value.slice(0, MAX_STRING_LENGTH) + '...(log line truncated)'
    : value;
}
