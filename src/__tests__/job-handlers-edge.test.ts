import fs from 'fs';
import { join } from 'path';
import { describe, expect, it } from 'vitest';
import { validateJobFile } from '../handlers/job-handlers';

const TEMP_INVALID_JOB = '/tmp/invalid_job.kjb';
const TEMP_MALFORMED_JOB = '/tmp/malformed_job.kjb';

describe('Job Handler Edge Cases', () => {
	it('should fail validation for invalid job structure', async () => {
		fs.writeFileSync(TEMP_INVALID_JOB, '<job><name>missing_entries</name></job>');
		try {
			await validateJobFile({ path: TEMP_INVALID_JOB });
			throw new Error('Expected validation to fail');
		} catch (error: any) {
			expect(error.issues).toEqual(
				expect.arrayContaining([
					expect.objectContaining({ path: expect.arrayContaining(['entries']), message: expect.stringMatching(/Required/) }),
					expect.objectContaining({ path: expect.arrayContaining(['hops']), message: expect.stringMatching(/Required/) })
				])
			);
		}
	});

	it('should throw for malformed XML', async () => {
		fs.writeFileSync(TEMP_MALFORMED_JOB, '<job><name>bad');
		try {
			await validateJobFile({ path: TEMP_MALFORMED_JOB });
			throw new Error('Expected parse to fail');
		} catch (error: any) {
			expect(error.issues).toEqual(
				expect.arrayContaining([
					expect.objectContaining({ path: expect.arrayContaining(['entries']), message: expect.stringMatching(/Required/) }),
					expect.objectContaining({ path: expect.arrayContaining(['hops']), message: expect.stringMatching(/Required/) })
				])
			);
		}
	});
});
