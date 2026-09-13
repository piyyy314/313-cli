import { test } from 'tap';
import * as childProcess from 'child_process';
import * as sinon from 'sinon';
import { copy } from '../../src/cli/copy';

test('copy', async (t) => {
  t.test('invokes execFileSync with appropriate binary and args', async (t) => {
    const stub = sinon
      .stub(childProcess, 'execFileSync')
      .returns(Buffer.from(''));

    try {
      copy('hello world');

      t.equal(stub.calledOnce, true, 'execFileSync called once');

      const [cmd, args, options] = stub.firstCall.args;
      t.equal(typeof cmd, 'string', 'command binary is a string');
      t.equal(Array.isArray(args), true, 'arguments are passed as an array');
      t.same(
        options,
        { input: 'hello world' },
        'input passed correctly in options',
      );
    } finally {
      stub.restore();
    }
  });
});
