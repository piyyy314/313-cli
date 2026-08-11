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
  // Since we only modify specific properties (username, password) of ArgsOptions (object)
  // or inside MethodArgs (array of string or ArgsOptions), we can perform a fast, selective clone
  // instead of a full recursive deep clone using lodash.clonedeep.
  if (Array.isArray(args)) {
    const obfuscatedArgs = [...args] as MethodArgs;
    for (let i = 0; i < obfuscatedArgs.length; i++) {
      const item = obfuscatedArgs[i];
      if (item && typeof item === 'object' && !Array.isArray(item)) {
        // Shallow copy the ArgsOptions object within MethodArgs
        const objCopy = { ...item } as ArgsOptions;
        if (objCopy['username']) {
          objCopy['username'] = 'username-set';
        }
        if (objCopy['password']) {
          objCopy['password'] = 'password-set';
        }
        obfuscatedArgs[i] = objCopy;
      }
    }
    return obfuscatedArgs;
  } else if (args && typeof args === 'object') {
    const obfuscatedArgs = { ...args } as ArgsOptions;
    if (obfuscatedArgs['username']) {
      obfuscatedArgs['username'] = 'username-set';
    }
    if (
      obfuscatedArgs[1] &&
      typeof obfuscatedArgs[1] === 'object' &&
      !Array.isArray(obfuscatedArgs[1]) &&
      obfuscatedArgs[1]['username']
    ) {
      obfuscatedArgs[1] = {
        ...(obfuscatedArgs[1] as object),
        username: 'username-set',
      } as any;
    }

    if (obfuscatedArgs['password']) {
      obfuscatedArgs['password'] = 'password-set';
    }
    if (
      obfuscatedArgs[1] &&
      typeof obfuscatedArgs[1] === 'object' &&
      !Array.isArray(obfuscatedArgs[1]) &&
      obfuscatedArgs[1]['password']
    ) {
      obfuscatedArgs[1] = {
        ...(obfuscatedArgs[1] as object),
        password: 'password-set',
      } as any;
    }
    return obfuscatedArgs;
  }
  return args;
}

export function truncateForLog(value: string): string {
  return value.length > MAX_STRING_LENGTH
    ? value.slice(0, MAX_STRING_LENGTH) + '...(log line truncated)'
    : value;
}
