import fs from 'fs';
import { join } from 'path';
import { beforeAll, describe, expect, it } from 'vitest';
import { saveJob } from '../../handlers/edit-handlers';
import {
	getJob,
	validateJobFile,
} from '../../handlers/job-handlers';

const SAMPLES_DIR = join(__dirname, '../../../examples/sample_kettle_files');
const SRC_JOB = join(SAMPLES_DIR, 'sample_job.kjb');
const TEMP_JOB = '/tmp/e2e_job_edit_flow.kjb';

function ensureTempCopy() {
	fs.copyFileSync(SRC_JOB, TEMP_JOB);
}

describe('E2E: job read → validate → edit → validate', () => {
	beforeAll(() => {
		ensureTempCopy();
	});

	it('reads and validates, edits with backup+diff, and re-validates', async () => {
		// Read
		const read1 = await getJob({ path: TEMP_JOB });
		expect(read1.job).toBeDefined();
		expect(read1.path).toBe(TEMP_JOB);
		expect(read1.size).toBeGreaterThan(0);

		// Validate
		const v1 = await validateJobFile({ path: TEMP_JOB });
		expect(v1.result.valid).toBe(true);

		// Edit: update description
		const updated = {
			...read1.job,
			description: 'E2E updated job description',
		} as typeof read1.job;

		const saved = await saveJob({ path: TEMP_JOB, job: updated, createBackup: true });
		expect(saved.success).toBe(true);
		expect(saved.backupPath).toBeDefined();
		expect(saved.backupPath!).toMatch(/\.backup\.\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z\.kjb$/);
		// Diff should show added or changed description line
		if (saved.diff) {
			expect(saved.diff).toMatch(/^\+.*<description>E2E updated job description<\/description>/m);
		}

		// Re-validate
		const v2 = await validateJobFile({ path: TEMP_JOB });
		expect(v2.result.valid).toBe(true);

		// Re-read to confirm change persisted
		const read2 = await getJob({ path: TEMP_JOB });
		expect(read2.job.description).toBe('E2E updated job description');
	});
});
