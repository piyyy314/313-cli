import * as abbrev from 'abbrev';
import { UnsupportedOptionCombinationError, CustomError } from '../lib/errors';

interface ModeData {
  allowedCommands: Array<string>;
  config: (args) => [];
}

const modes: Record<string, ModeData> = {
  unmanaged: {
    allowedCommands: ['test', 'monitor'],
    config: (args): [] => {
      args['unmanaged'] = true;
      return args;
    },
  },
  container: {
    allowedCommands: ['test', 'monitor'],
    config: (args): [] => {
      args['docker'] = true;

      return args;
    },
  },
  iac: {
    allowedCommands: ['test', 'update-exclude-policy', 'describe'],
    config: (args): [] => {
      args['iac'] = true;

      return args;
    },
  },
  code: {
    allowedCommands: ['test'],
    config: (args): [] => {
      args['code'] = true;

      return args;
    },
  },
};

export function parseMode(mode: string, args): string {
  if (isValidMode(mode)) {
    const command: string = args._[0];

    if (isValidCommand(mode, command)) {
      configArgs(mode, args);
      mode = args._.shift();
    }
  }

  return mode;
}

// Pre-compute command abbreviations per mode at module load to avoid dynamic allocations and repeated abbrev() calls
const modeAliases: Record<string, Record<string, string>> = Object.keys(
  modes,
).reduce(
  (acc, mode) => {
    acc[mode] = abbrev(modes[mode].allowedCommands);
    return acc;
  },
  {} as Record<string, Record<string, string>>,
);

// Pre-compiled regex for formatting list of allowed commands
const LAST_COMMA_REGEX = /, ([^,]*)$/;

export function modeValidation(args: object) {
  const mode = args['command'];
  const commands: Array<string> = args['options']._;

  if (isValidMode(mode) && commands.length <= 1) {
    const allowed = modes[mode].allowedCommands
      .join(', ')
      .replace(LAST_COMMA_REGEX, ' or $1');
    const message = `use snyk ${mode} with ${allowed}`;

    throw new CustomError(message);
  }

  const command = commands[0];
  if (isValidMode(mode) && !isValidCommand(mode, command)) {
    const notSupported = [mode, command];

    throw new UnsupportedOptionCombinationError(notSupported);
  }
}

export function displayModeHelp(mode: string, args) {
  if (isValidMode(mode)) {
    const command: string = args._[0];

    if (!isValidCommand(mode, command) || args['help']) {
      args['help'] = mode;
    }
  }

  return mode;
}

function isValidMode(mode: string): boolean {
  // O(1) lookup avoiding Object.keys array allocation on every call
  return Object.prototype.hasOwnProperty.call(modes, mode);
}

function isValidCommand(mode: string, command: string): boolean {
  // O(1) lookup using pre-computed modeAliases avoiding dynamic abbrev() object allocations
  const aliases = modeAliases[mode];
  return !!aliases && Object.prototype.hasOwnProperty.call(aliases, command);
}

function configArgs(mode: string, args): [] {
  return modes[mode].config(args);
}
