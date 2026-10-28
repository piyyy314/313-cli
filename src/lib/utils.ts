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
  'tfc-token',
  'azurerm-account-key',
  'fetch-tfstate-headers',
  'api-key',
  'snykToken',
  'snyk-token',
  'oauthToken',
  'oauth-token',
  'auth',
]);

function recursiveObfuscate(obj: any, visited = new WeakSet()): void {
  if (!obj || typeof obj !== 'object' || visited.has(obj)) {
    return;
  }
  visited.add(obj);

  for (const key of Object.keys(obj)) {
    if (SENSITIVE_KEYS.has(key)) {
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
