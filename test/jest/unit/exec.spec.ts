import { executeCommand } from '../../../src/lib/exec';

describe('executeCommand', () => {
  it('executes a command safely using execFile', async () => {
    const result = await executeCommand('node -v');
    expect(result).toMatch(/^v\d+\.\d+\.\d+/);
  });

  it('rejects on invalid command / error output', async () => {
    await expect(
      executeCommand("node -e console.error('failure')"),
    ).rejects.toThrow("failure / node -e console.error('failure')");
  });
});
