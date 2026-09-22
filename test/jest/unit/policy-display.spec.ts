import * as policy from 'snyk-policy';
import * as fs from 'fs';
import { display } from '../../../src/lib/display-policy';
import stripAnsi = require('strip-ansi');
import { getFixturePath } from '../util/getFixturePath';

it('test sensibly bails if gets an old .snyk format', async () => {
  const filename = getFixturePath('snyk-config-no-version');
  const loadedPolicy = await policy.load(filename);
  const expectedFile = await fs.readFileSync(filename + '/expected', 'utf8');

  const [displayPolicy, expectedFileString] = await Promise.all([
    display(loadedPolicy),
    expectedFile,
  ]);
  const result = stripAnsi(displayPolicy)
    .trim()
    .split('\n')
    .slice(3)
    .join('\n');

  const expected = expectedFileString.trim().split('\n').slice(3).join('\n');

  expect(result).toEqual(expected);
});

it('correctly maps license vs vulnerability URLs when displaying policy rules', async () => {
  const loadedPolicy = {
    version: 'v1.0.0',
    __filename: '.snyk',
    __created: new Date().toISOString(),
    __modified: new Date().toISOString(),
    ignore: {
      'snyk:lic:npm:foo:GPL-2.0': [
        {
          '*': {
            reason: 'license accepted',
          },
        },
      ],
      'SNYK-JS-LODASH-567746': [
        {
          '*': {
            reason: 'not affected',
          },
        },
      ],
    },
    patch: {},
    exclude: {},
  } as any;

  const displayOutput = stripAnsi(await display(loadedPolicy));
  expect(displayOutput).toContain(
    'https://snyk.io/vuln/snyk:lic:npm:foo:GPL-2.0',
  );
  expect(displayOutput).toContain(
    'https://security.snyk.io/vuln/SNYK-JS-LODASH-567746',
  );
});
