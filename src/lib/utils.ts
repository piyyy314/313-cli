import * as cloneDeep from 'lodash.clonedeep';
import { DepGraph } from '@snyk/dep-graph';
import { ArgsOptions, MethodArgs } from '../cli/args';
import { MAX_STRING_LENGTH } from './constants';

export function countPathsToGraphRoot(graph: DepGraph): number {
  return graph
    .getPkgs()
    .reduce((acc, pkg) => acc + graph.countPathsToRoot(pkg), 0);
}

export function obfuscateArgs(
  args: ArgsOptions | MethodArgs,
): ArgsOptions | MethodArgs {
  const obfuscatedArgs = cloneDeep(args);
  const keysToObfuscate = [
    'username',
    'password',
    'token',
    'tfc-token',
    'tfcToken',
  ];

  const obfuscateObject = (obj: any) => {
    if (!obj || typeof obj !== 'object') {
      return;
    }
    for (const key of keysToObfuscate) {
      if (obj[key]) {
        obj[key] = `${key}-set`;
      }
    }
  };

  obfuscateObject(obfuscatedArgs);
  if (Array.isArray(obfuscatedArgs) && obfuscatedArgs[1]) {
    obfuscateObject(obfuscatedArgs[1]);
  }

  return obfuscatedArgs;
}

export function truncateForLog(value: string): string {
  return value.length > MAX_STRING_LENGTH
    ? value.slice(0, MAX_STRING_LENGTH) + '...(log line truncated)'
    : value;
}
