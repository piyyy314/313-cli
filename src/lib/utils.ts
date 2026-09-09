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
]);

export function obfuscateArgs(
  args: ArgsOptions | MethodArgs,
): ArgsOptions | MethodArgs {
  const obfuscatedArgs = cloneDeep(args);

  function redactObject(obj: unknown): void {
    if (!obj || typeof obj !== 'object') {
      return;
    }

    if (Array.isArray(obj)) {
      for (const item of obj) {
        redactObject(item);
      }
      return;
    }

    const record = obj as Record<string, unknown>;
    for (const key of Object.keys(record)) {
      if (SENSITIVE_KEYS.has(key) && record[key]) {
        record[key] = `${key}-set`;
      } else if (typeof record[key] === 'object' && record[key] !== null) {
        redactObject(record[key]);
      }
    }
  }

  redactObject(obfuscatedArgs);

  return obfuscatedArgs;
}

export function truncateForLog(value: string): string {
  return value.length > MAX_STRING_LENGTH
    ? value.slice(0, MAX_STRING_LENGTH) + '...(log line truncated)'
    : value;
}
