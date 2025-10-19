import fs from 'fs';
import { join } from 'path';
import { beforeAll, describe, expect, it } from 'vitest';
import {
	executeTransformation,
} from '../../handlers/execution-handlers';
import {
	listArtifacts,
	searchArtifacts,
} from '../../handlers/search-handlers';
import { getTransformation } from '../../handlers/transformation-handlers';

const SAMPLES_DIR = join(__dirname, '../../../examples/sample_kettle_files');

function setEnv(vars: Record<string, string | undefined>) {
	for (const [k, v] of Object.entries(vars)) {
		if (v === undefined) delete process.env[k];
		else process.env[k] = v;
	}
}

describe('E2E: search → get → execute (dry-run)', () => {
	beforeAll(() => {
		setEnv({
			KETTLE_MCP_ALLOW_EXECUTION: '1',
			KETTLE_MCP_EXEC_ROOT: SAMPLES_DIR,
			KETTLE_MCP_AUTO_CONFIRM: '1',
		});
	});

	it('searches, retrieves, and executes transformation (echo stub)', async () => {
		const search = await searchArtifacts({ query: 'sample', type: 'all', directory: SAMPLES_DIR, maxResults: 10 });
		expect(search.total).toBeGreaterThan(0);

		const entry = search.results.find(r => r.type === 'transformation');
		expect(entry).toBeDefined();

		const trans = await getTransformation({ path: entry!.path });
		expect(trans.transformation.info.name).toBeDefined();

		// Execute (stubbed echo)
		const exec = await executeTransformation({ path: entry!.path, timeoutMs: 2000 });
		expect(typeof exec).toBe('object');
		expect((exec as any).success).toBe(true);
		expect((exec as any).output).toContain('Executing transformation');
	});
});
