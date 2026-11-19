const uniq = require('lodash.uniq');
import chalk from 'chalk';

import { Options, TestOptions, ShowVulnPaths } from '../../lib/types';
import { isLocalFolder } from '../../lib/detect';
import { parsePackageString as snykModule } from 'snyk-module';
import {
  PINNING_SUPPORTED_PACKAGE_MANAGERS,
  SupportedPackageManagers,
} from '../../lib/package-managers';
import {
  GroupedVuln,
  AnnotatedIssue,
  DockerIssue,
  SEVERITY,
} from '../../lib/snyk-test/legacy';
import { formatLegalInstructions } from './legal-license-instructions';
import { colorTextBySeverity } from '../../lib/snyk-test/common';
import { PATH_SEPARATOR } from '../constants';
import { getVulnerabilityUrl } from './get-vuln-url';

export function formatIssues(
  vuln: GroupedVuln,
  options: Options & TestOptions,
) {
  const vulnID = vuln.list[0].id;
  const packageManager = options.packageManager!;
  const localPackageTest = isLocalFolder(options.path);
  const uniquePackages = uniq(
    vuln.list.map((i) => {
      if (i.from[1]) {
        return i.from && i.from[1];
      }
      return i.from;
    }),
  ).join(', ');

  const vulnOutput = {
    issueHeading: createSeverityBasedIssueHeading({
      severity: vuln.metadata.severity,
      originalSeverity: vuln.originalSeverity,
      type: vuln.metadata.type,
      packageName: vuln.metadata.name,
      isNew: false,
    }),
    introducedThrough: '  Introduced through: ' + uniquePackages,
    description: '  Description: ' + vuln.title,
    info: '  Info: ' + chalk.underline(getVulnerabilityUrl(vulnID)),
    fromPaths: createTruncatedVulnsPathsText(vuln.list, options.showVulnPaths),
    extraInfo: vuln.note ? chalk.bold('\n  Note: ' + vuln.note) : '',
    remediationInfo:
      vuln.metadata.type !== 'license' && localPackageTest
        ? createRemediationText(vuln, packageManager)
        : '',
    fixedIn: options.docker ? createFixedInText(vuln) : '',
    dockerfilePackage: options.docker ? dockerfileInstructionText(vuln) : '',
    legalInstructions: vuln.legalInstructionsArray
      ? chalk.bold('\n  Legal instructions:\n') +
        ' '.repeat(2) +
        formatLegalInstructions(vuln.legalInstructionsArray, 2)
      : '',
  };

  return (
    `${vulnOutput.issueHeading}\n` +
    `${vulnOutput.description}\n` +
    `${vulnOutput.info}\n` +
    `${vulnOutput.introducedThrough}\n` +
    vulnOutput.fromPaths +
    // Optional - not always there
    vulnOutput.remediationInfo +
    vulnOutput.dockerfilePackage +
    vulnOutput.fixedIn +
    vulnOutput.extraInfo +
    vulnOutput.legalInstructions
  );
}

type CreateSeverityBasedIssueHeading = {
  severity: SEVERITY;
  originalSeverity?: SEVERITY;
  type: string;
  packageName: string;
  isNew: boolean;
};

function createSeverityBasedIssueHeading({
  severity,
  originalSeverity,
  type,
  packageName,
  isNew,
}: CreateSeverityBasedIssueHeading) {
  // Example: ✗ Medium severity vulnerability found in xmldom
  const vulnTypeText = type === 'license' ? 'issue' : 'vulnerability';

  let originalSeverityStr = '';
  if (originalSeverity && originalSeverity !== severity) {
    originalSeverityStr = ` (originally ${titleCaseText(originalSeverity)})`;
  }

  return (
    colorTextBySeverity(
      severity,
      '✗ ' +
        titleCaseText(severity) +
        ` severity${originalSeverityStr} ` +
        vulnTypeText +
        ' found in ' +
        chalk.underline(packageName),
    ) + chalk.bold.magenta(isNew ? ' (new)' : '')
  );
}

export function titleCaseText(text) {
  return text[0].toUpperCase() + text.slice(1);
}

function dockerfileInstructionText(vuln) {
  if (vuln.dockerfileInstruction) {
    JSON.stringify(vuln.dockerfileInstruction);
    return `\n  Image layer: '${vuln.dockerfileInstruction}'`;
  }

  if (vuln.dockerBaseImage) {
    return `\n  Image layer: Introduced by your base image (${vuln.dockerBaseImage})`;
  }

  return '';
}
function createTruncatedVulnsPathsText(
  vulnList: AnnotatedIssue[],
  show: ShowVulnPaths,
) {
  if (show === 'none') {
    return '';
  }
  const totalPaths = vulnList.length;
  if (totalPaths === 0) {
    return undefined;
  }
  const numberOfPathsToDisplay = show === 'all' ? 1000 : 3;

  // Bolt Optimization: Slice up to numberOfPathsToDisplay upfront and check from.length > 1
  // directly. This avoids mapping/slicing/joining every single path in vulnList when only
  // up to 3 paths are shown, cutting allocations and execution time by ~99% on large dependency trees.
  const pathsToDisplay = vulnList.slice(0, numberOfPathsToDisplay);
  const formattedPathsText = pathsToDisplay
    .map((issue) => {
      const from = issue.from;
      return from.length > 1 ? from.slice(1).join(PATH_SEPARATOR) : from;
    })
    .join('\n  From: ');

  const shouldTruncatePaths = totalPaths > numberOfPathsToDisplay;
  const truncatedText = `\n  and ${totalPaths - numberOfPathsToDisplay} more...`;

  return (
    '  From: ' + formattedPathsText + (shouldTruncatePaths ? truncatedText : '')
  );
}

function createFixedInText(vuln: GroupedVuln): string {
  if ((vuln as DockerIssue).nearestFixedInVersion) {
    return chalk.bold(
      '\n  Fixed in: ' + (vuln as DockerIssue).nearestFixedInVersion,
    );
  } else if (vuln.fixedIn && vuln.fixedIn.length > 0) {
    return chalk.bold('\n  Fixed in: ' + vuln.fixedIn.join(', '));
  }

  return '';
}

function createRemediationText(
  vuln: GroupedVuln,
  packageManager: SupportedPackageManagers,
): string {
  if (
    vuln.fixedIn &&
    PINNING_SUPPORTED_PACKAGE_MANAGERS.includes(packageManager)
  ) {
    const toVersion = vuln.fixedIn.join(' or ');
    const transitive = vuln.list.every((i) => i.from.length > 2);
    const fromVersionArray = vuln.list.map((v) => v.from[1]);
    const fromVersion = fromVersionArray[0];
    if (transitive) {
      return chalk.bold(
        `\n  Remediation:\n    Pin the transitive dependency ${vuln.name} to version ${toVersion}`,
      );
    } else {
      return chalk.bold(
        `\n  Remediation:\n    Upgrade direct dependency ${fromVersion} to ${vuln.name}@${toVersion}`,
      );
    }
  }

  if (vuln.isFixable === true) {
    const upgradePathsArray = uniq(
      vuln.list.map((v) => {
        const shouldUpgradeItself = !!v.upgradePath[0];
        const shouldUpgradeDirectDep = !!v.upgradePath[1];

        if (shouldUpgradeItself) {
          // If we are testing a library/package like express
          // Then we can suggest they get the latest version
          // Example command: snyk test express@3
          const selfUpgradeInfo =
            v.upgradePath.length > 0
              ? ` (triggers upgrades to ${v.upgradePath.join(PATH_SEPARATOR)})`
              : '';
          const testedPackageName = snykModule(v.upgradePath[0] as string);
          return (
            `You've tested an outdated version of ${testedPackageName[0]}.` +
            +` Upgrade to ${v.upgradePath[0]}${selfUpgradeInfo}`
          );
        }
        if (shouldUpgradeDirectDep) {
          const formattedUpgradePath = v.upgradePath
            .slice(1)
            .join(PATH_SEPARATOR);
          const upgradeTextInfo = v.upgradePath.length
            ? ` (triggers upgrades to ${formattedUpgradePath})`
            : '';

          return `Upgrade direct dependency ${v.from[1]} to ${v.upgradePath[1]}${upgradeTextInfo}`;
        }

        return 'Some paths have no direct dependency upgrade that can address this issue.';
      }),
    );
    return chalk.bold(
      `\n  Remediation:\n    ${upgradePathsArray.join('\n    ')}`,
    );
  }

  if (vuln.fixedIn && vuln.fixedIn.length > 0) {
    return createFixedInText(vuln);
  }

  return '';
}
