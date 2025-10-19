import fs from 'fs';
import { beforeAll, describe, expect, it } from 'vitest';
import * as statusHandlers from '../handlers/server-status-handlers';
import os from 'os';

const TEST_TRANS = `${os.tmpdir()}/test-status.ktr`;
const TEST_JOB = `${os.tmpdir()}/test-status.kjb`;

describe('Server Status and Lifecycle Handlers', () => {
	beforeAll(() => {
		fs.writeFileSync(TEST_TRANS, '<transformation></transformation>');
		fs.writeFileSync(TEST_JOB, '<job></job>');
	});

	it('returns server status', () => {
		const status = statusHandlers.getServerStatus();
		expect(status.status).toBe('running');
		expect(status.mode).toBe('local');
	});

	it('registers a transformation', () => {
		const result = statusHandlers.registerTransformation({ filePath: TEST_TRANS });
		expect(result.success).toBe(true);
		expect(result.registered).toBe(TEST_TRANS);
	});

	it('registers a job', () => {
		const result = statusHandlers.registerJob({ filePath: TEST_JOB });
		expect(result.success).toBe(true);
		expect(result.registered).toBe(TEST_JOB);
	});

	it('removes a transformation', () => {
		const result = statusHandlers.removeTransformation({ filePath: TEST_TRANS });
		expect(result.success).toBe(true);
		expect(result.removed).toBe(TEST_TRANS);
	});

	it('removes a job', () => {
		const result = statusHandlers.removeJob({ filePath: TEST_JOB });
		expect(result.success).toBe(true);
		expect(result.removed).toBe(TEST_JOB);
	});

	it('cleans up a transformation', () => {
		const result = statusHandlers.cleanupTransformation({ filePath: TEST_TRANS });
		expect(result.success).toBe(true);
		expect(result.cleaned).toBe(TEST_TRANS);
	});

	it('throws if registering missing transformation', () => {
		expect(() => statusHandlers.registerTransformation({ filePath: '/tmp/does-not-exist.ktr' })).toThrow(/does not exist/);
	});

	it('throws if registering missing job', () => {
		expect(() => statusHandlers.registerJob({ filePath: '/tmp/does-not-exist.kjb' })).toThrow(/does not exist/);
	});
});
