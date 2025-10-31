import fs from 'fs';
import { beforeEach, describe, expect, it } from 'vitest';
import * as execHandlers from '../handlers/execution-handlers';

const TEST_FILE = '/tmp/test.ktr';

function setEnv(vars: Record<string, string | undefined>) {
  for (const [k, v] of Object.entries(vars)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
}

describe('Execution Handlers', () => {
  beforeEach(() => {
    setEnv({
      KETTLE_MCP_ALLOW_EXECUTION: '1',
      KETTLE_MCP_EXEC_ROOT: '/tmp',
      KETTLE_MCP_AUTO_CONFIRM: '1',
    });
    fs.writeFileSync(TEST_FILE, '<transformation></transformation>');
  });

  it('executes transformation if allowed', async () => {
    const result = await execHandlers.executeTransformation({ path: TEST_FILE });
    expect(typeof result).toBe('object');
    expect(result && (result as any).success).toBe(true);
    expect(result && (result as any).output).toContain('Executing transformation');
  });

  it('blocks execution if env var not set', async () => {
    setEnv({ KETTLE_MCP_ALLOW_EXECUTION: undefined });
    await expect(execHandlers.executeTransformation({ path: TEST_FILE })).rejects.toThrow(
      /not allowed/
    );
  });

  it('blocks execution if path not allowed', async () => {
    setEnv({ KETTLE_MCP_EXEC_ROOT: '/not-allowed' });
    await expect(execHandlers.executeTransformation({ path: TEST_FILE })).rejects.toThrow(
      /not allowed/
    );
  });

  it('blocks execution if file missing', async () => {
    await expect(
      execHandlers.executeTransformation({ path: '/tmp/does-not-exist.ktr' })
    ).rejects.toThrow(/does not exist/);
  });

  it('throws for stopTransformation (not implemented)', async () => {
    await expect(execHandlers.stopTransformation({ path: TEST_FILE })).rejects.toThrow(
      /not implemented/
    );
  });

  it('executes job if allowed', async () => {
    fs.writeFileSync('/tmp/test.kjb', '<job></job>');
    const result = await execHandlers.executeJob({ path: '/tmp/test.kjb' });
    expect(typeof result).toBe('object');
    expect(result && (result as any).success).toBe(true);
    expect(result && (result as any).output).toContain('Executing job');
  });

  it('throws for stopJob (not implemented)', async () => {
    await expect(execHandlers.stopJob({ path: '/tmp/test.kjb' })).rejects.toThrow(
      /not implemented/
    );
  });
});
