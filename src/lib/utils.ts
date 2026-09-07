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
  'tfcToken',
  'azurerm-account-key',
  'azurermAccountKey',
  'fetch-tfstate-headers',
  'fetchTfstateHeaders',
  'api-key',
  'apiKey',
  'client-secret',
  'clientSecret',
  'auth-token',
  'authToken',
  'oauth-token',
  'oauthToken',
  'session-token',
  'sessionToken',
  'secret',
]);

function obfuscateObject(obj: Record<string, any>): void {
  for (const key of Object.keys(obj)) {
    if (SENSITIVE_KEYS.has(key) && obj[key]) {
      obj[key] = `${key}-set`;
    }
  }
}

export function obfuscateArgs(
  args: ArgsOptions | MethodArgs,
): ArgsOptions | MethodArgs {
  const obfuscatedArgs = cloneDeep(args);

  if (Array.isArray(obfuscatedArgs)) {
    for (const item of obfuscatedArgs) {
      if (item && typeof item === 'object') {
        obfuscateObject(item);
      }
    }
  } else if (obfuscatedArgs && typeof obfuscatedArgs === 'object') {
    obfuscateObject(obfuscatedArgs);
  }

  return obfuscatedArgs;
}

export function truncateForLog(value: string): string {
  return value.length > MAX_STRING_LENGTH
    ? value.slice(0, MAX_STRING_LENGTH) + '...(log line truncated)'
    : value;
}
