import * as cloneDeep from 'lodash.clonedeep';
import { DepGraph } from '@snyk/dep-graph';
import { ArgsOptions, MethodArgs } from '../cli/args';
import { MAX_STRING_LENGTH } from './constants';

export function countPathsToGraphRoot(graph: DepGraph): number {
  return graph
    .getPkgs()
    .reduce((acc, pkg) => acc + graph.countPathsToRoot(pkg), 0);
}

const SENSITIVE_KEYS = [
  'username',
  'password',
  'token',
  'tfc-token',
  'azurerm-account-key',
  'fetch-tfstate-headers',
  'api-key',
];

export function obfuscateArgs(
  args: ArgsOptions | MethodArgs,
): ArgsOptions | MethodArgs {
  const obfuscatedArgs = cloneDeep(args);

  const options = Array.isArray(obfuscatedArgs)
    ? obfuscatedArgs
    : [obfuscatedArgs];

  for (const arg of options) {
    if (typeof arg !== 'object' || arg === null) {
      continue;
    }
    for (const key of SENSITIVE_KEYS) {
      if (arg[key]) {
        arg[key] = `${key}-set`;
      }
    }
  }

  return obfuscatedArgs;
}

export function truncateForLog(value: string): string {
  return value.length > MAX_STRING_LENGTH
    ? value.slice(0, MAX_STRING_LENGTH) + '...(log line truncated)'
    : value;
}
