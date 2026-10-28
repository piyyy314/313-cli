import * as cloneDeep from 'lodash.clonedeep';
import { DepGraph } from '@snyk/dep-graph';
import { ArgsOptions, MethodArgs } from '../cli/args';
import { MAX_STRING_LENGTH } from './constants';

export function countPathsToGraphRoot(graph: DepGraph): number {
  return graph
    .getPkgs()
    .reduce((acc, pkg) => acc + graph.countPathsToRoot(pkg), 0);
}

const SENSITIVE_KEYS = ['username', 'password', 'token', 'tfc-token'];

export function obfuscateArgs(
  args: ArgsOptions | MethodArgs,
): ArgsOptions | MethodArgs {
  const obfuscatedArgs = cloneDeep(args);

  for (const key of SENSITIVE_KEYS) {
    if (obfuscatedArgs[key]) {
      obfuscatedArgs[key] = `${key}-set`;
    }
    if (obfuscatedArgs[1] && obfuscatedArgs[1][key]) {
      obfuscatedArgs[1][key] = `${key}-set`;
    }
  }

  return obfuscatedArgs;
}

export function truncateForLog(value: string): string {
  return value.length > MAX_STRING_LENGTH
    ? value.slice(0, MAX_STRING_LENGTH) + '...(log line truncated)'
    : value;
}
