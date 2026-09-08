const test = require('tap').test;
const childProcess = require('child_process');
const executeCommand = require('../../src/lib/exec').executeCommand;
const npm = require('../../src/lib/npm').default;
const getVersion = require('../../src/lib/npm').getVersion;
const yarn = require('../../src/lib/yarn').yarn;

test('executeCommand uses execFile safely', async (t) => {
  let calledFile = null;
  let calledArgs = null;
  const origExecFile = childProcess.execFile;

  childProcess.execFile = (file, args, options, callback) => {
    calledFile = file;
    calledArgs = args;
    if (typeof options === 'function') {
      callback = options;
    }
    callback(null, 'ok\n', '');
  };

  t.teardown(() => {
    childProcess.execFile = origExecFile;
  });

  const res = await executeCommand('echo hello world', '/tmp');
  t.equal(res, 'ok');
  t.equal(calledFile, 'echo');
  t.same(calledArgs, ['hello', 'world']);
});

test('npm function uses execFile safely with array args', async (t) => {
  let calledFile = null;
  let calledArgs = null;
  const origExecFile = childProcess.execFile;

  childProcess.execFile = (file, args, options, callback) => {
    calledFile = file;
    calledArgs = args;
    callback(null, 'installed', '');
  };

  t.teardown(() => {
    childProcess.execFile = origExecFile;
  });

  await npm('install', ['lodash'], true, '/tmp', ['--save-exact']);
  t.equal(calledFile, 'npm');
  t.same(calledArgs, ['install', '--save-exact', 'lodash']);
});

test('getVersion function uses execFile safely', async (t) => {
  let calledFile = null;
  let calledArgs = null;
  const origExecFile = childProcess.execFile;

  childProcess.execFile = (file, args, options, callback) => {
    calledFile = file;
    calledArgs = args;
    callback(null, '10.0.0', '');
  };

  t.teardown(() => {
    childProcess.execFile = origExecFile;
  });

  const ver = await getVersion();
  t.equal(ver, '10.0.0');
  t.equal(calledFile, 'npm');
  t.same(calledArgs, ['--version']);
});

test('yarn function uses execFile safely with array args', async (t) => {
  let calledFile = null;
  let calledArgs = null;
  const origExecFile = childProcess.execFile;

  childProcess.execFile = (file, args, options, callback) => {
    calledFile = file;
    calledArgs = args;
    callback(null, 'installed', '');
  };

  t.teardown(() => {
    childProcess.execFile = origExecFile;
  });

  await yarn('add', ['express'], true, '/tmp', ['--dev']);
  t.equal(calledFile, 'yarn');
  t.same(calledArgs, ['add', '--dev', 'express']);
});
