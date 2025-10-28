
import * as fs from 'fs/promises';
import { tmpdir } from 'os';
import * as path from 'path';
import { parseKettleXml } from '../../src/kettle/xml-utils';
import { addJobEntry, addJobHop } from '../../src/tools/add_job_entry';
import { removeJobEntry, removeJobHop } from '../../src/tools/remove_job_entry';
import { updateJobEntry } from '../../src/tools/update_job_entry';

describe('Job Workflow Integration Tests', () => {
	const testDir = path.join(tmpdir(), 'kettle-mcp-integration', 'jobs');
	const testFile = path.join(testDir, 'etl_job.kjb');

	beforeEach(async () => {
		await fs.mkdir(testDir, { recursive: true });

		// Create a realistic job file with START entry
		const initialJob = `<?xml version="1.0" encoding="UTF-8"?>
<job>
  <name>etl_job</name>
  <description>ETL job orchestration</description>
  <extended_description/>
  <job_version/>
  <directory>/</directory>
  <created_user>-</created_user>
  <created_date>2025/01/01 00:00:00.000</created_date>
  <modified_user>-</modified_user>
  <modified_date>2025/01/01 00:00:00.000</modified_date>
  <parameters>
  </parameters>
  <connection>
  </connection>
  <slaveservers>
  </slaveservers>
  <job-log-table>
    <connection/>
    <schema/>
    <table/>
    <size_limit_lines/>
    <interval/>
    <timeout_days/>
  </job-log-table>
  <jobentry-log-table>
    <connection/>
    <schema/>
    <table/>
    <timeout_days/>
  </jobentry-log-table>
  <channel-log-table>
    <connection/>
    <schema/>
    <table/>
    <timeout_days/>
  </channel-log-table>
  <pass_batchid>N</pass_batchid>
  <shared_objects_file/>
  <entries>
    <entry>
      <name>START</name>
      <description/>
      <type>SPECIAL</type>
      <start>Y</start>
      <dummy>N</dummy>
      <repeat>N</repeat>
      <schedulerType>0</schedulerType>
      <intervalSeconds>0</intervalSeconds>
      <intervalMinutes>60</intervalMinutes>
      <hour>12</hour>
      <minutes>0</minutes>
      <weekDay>1</weekDay>
      <DayOfMonth>1</DayOfMonth>
      <parallel>N</parallel>
      <draw>Y</draw>
      <nr>0</nr>
      <xloc>50</xloc>
      <yloc>50</yloc>
    </entry>
  </entries>
  <hops>
  </hops>
  <notepads>
  </notepads>
</job>`;

		await fs.writeFile(testFile, initialJob, 'utf-8');
	});

	afterEach(async () => {
		try {
			await fs.rm(testDir, { recursive: true, force: true });
		} catch (error) {
			// Ignore cleanup errors
		}
	});

	it('should build a complete job workflow from scratch', async () => {
		// Step 1: Add a transformation execution entry
		const trans1Result = await addJobEntry(
			testFile,
			'Extract Customer Data',
			'TRANS',
			{
				filename: '/etl/transformations/extract_customers.ktr',
			},
			{ guiX: 200, guiY: 50 }
		);
		expect(trans1Result.success).toBe(true);

		// Step 2: Add another transformation
		const trans2Result = await addJobEntry(
			testFile,
			'Load Customer Data',
			'TRANS',
			{
				filename: '/etl/transformations/load_customers.ktr',
			},
			{ guiX: 400, guiY: 50 }
		);
		expect(trans2Result.success).toBe(true);

		// Step 3: Add a log entry on success
		const logSuccessResult = await addJobEntry(
			testFile,
			'Log Success',
			'WRITE_TO_LOG',
			{
				logmessage: 'Customer ETL completed successfully',
				loglevel: 'Basic',
			},
			{ guiX: 600, guiY: 50 }
		);
		expect(logSuccessResult.success).toBe(true);

		// Step 4: Add a log entry on failure
		const logErrorResult = await addJobEntry(
			testFile,
			'Log Error',
			'WRITE_TO_LOG',
			{
				logmessage: 'Customer ETL failed',
				loglevel: 'Error',
			},
			{ guiX: 400, guiY: 150 }
		);
		expect(logErrorResult.success).toBe(true);

		// Step 5: Connect with hops
		const hop1 = await addJobHop(testFile, 'START', 'Extract Customer Data');
		expect(hop1.success).toBe(true);

		const hop2 = await addJobHop(testFile, 'Extract Customer Data', 'Load Customer Data');
		expect(hop2.success).toBe(true);

		const hop3 = await addJobHop(testFile, 'Load Customer Data', 'Log Success');
		expect(hop3.success).toBe(true);

		const hop4 = await addJobHop(testFile, 'Load Customer Data', 'Log Error', {
			evaluation: false,
			unconditional: false,
		});
		expect(hop4.success).toBe(true);

		// Step 6: Verify the complete structure
		const job = await parseKettleXml(testFile);
		const entries = Array.isArray(job.job.entries.entry)
			? job.job.entries.entry
			: [job.job.entries.entry];

		expect(entries).toHaveLength(5); // START + 4 new entries
		expect(entries.map((e: any) => e.name)).toContain('Extract Customer Data');
		expect(entries.map((e: any) => e.name)).toContain('Load Customer Data');
		expect(entries.map((e: any) => e.name)).toContain('Log Success');
		expect(entries.map((e: any) => e.name)).toContain('Log Error');

		const hops = job.job.hops.hop
			? Array.isArray(job.job.hops.hop)
				? job.job.hops.hop
				: [job.job.hops.hop]
			: [];

		expect(hops).toHaveLength(4);
	});

	it('should update multiple job entries and maintain consistency', async () => {
		// Setup: Create initial job entries
		await addJobEntry(testFile, 'Transform1', 'TRANS', {
			filename: '/etl/trans1.ktr',
		});
		await addJobEntry(testFile, 'Transform2', 'TRANS', {
			filename: '/etl/trans2.ktr',
		});
		await addJobEntry(testFile, 'LogMessage', 'WRITE_TO_LOG', {
			logmessage: 'Initial message',
			loglevel: 'Basic',
		});
		await addJobHop(testFile, 'START', 'Transform1');
		await addJobHop(testFile, 'Transform1', 'Transform2');
		await addJobHop(testFile, 'Transform2', 'LogMessage');

		// Update entry 1: Change transformation filename
		const update1 = await updateJobEntry(testFile, 'Transform1', {
			configuration: {
				filename: '/etl/production/extract.ktr',
			},
		});
		expect(update1.success).toBe(true);

		// Update entry 2: Move GUI position
		const update2 = await updateJobEntry(testFile, 'Transform2', {
			guiX: 500,
			guiY: 100,
		});
		expect(update2.success).toBe(true);

		// Update entry 3: Change log message
		const update3 = await updateJobEntry(testFile, 'LogMessage', {
			configuration: {
				logmessage: 'ETL pipeline completed successfully',
				loglevel: 'Detailed',
			},
		});
		expect(update3.success).toBe(true);

		// Verify all changes
		const job = await parseKettleXml(testFile);
		const entries = Array.isArray(job.job.entries.entry)
			? job.job.entries.entry
			: [job.job.entries.entry];

		const entry1 = entries.find((e: any) => e.name === 'Transform1');
		expect(entry1.filename).toBe('/etl/production/extract.ktr');

		const entry2 = entries.find((e: any) => e.name === 'Transform2');
		expect(entry2.xloc).toBe(500);
		expect(entry2.yloc).toBe(100);

		const entry3 = entries.find((e: any) => e.name === 'LogMessage');
		expect(entry3.logmessage).toBe('ETL pipeline completed successfully');
		expect(entry3.loglevel).toBe('Detailed');

		// Verify hops are still intact
		const hops = job.job.hops.hop
			? Array.isArray(job.job.hops.hop)
				? job.job.hops.hop
				: [job.job.hops.hop]
			: [];
		expect(hops).toHaveLength(3);
	});

	it('should handle complex job entry removal with hop cleanup', async () => {
		// Setup: Create a branching job
		await addJobEntry(testFile, 'Extract', 'TRANS', {
			filename: '/etl/extract.ktr',
		});
		await addJobEntry(testFile, 'Validate', 'TRANS', {
			filename: '/etl/validate.ktr',
		});
		await addJobEntry(testFile, 'LoadProd', 'TRANS', {
			filename: '/etl/load_prod.ktr',
		});
		await addJobEntry(testFile, 'LoadStaging', 'TRANS', {
			filename: '/etl/load_staging.ktr',
		});

		// Create connections
		await addJobHop(testFile, 'START', 'Extract');
		await addJobHop(testFile, 'Extract', 'Validate');
		await addJobHop(testFile, 'Validate', 'LoadProd');
		await addJobHop(testFile, 'Validate', 'LoadStaging', { evaluation: false });

		// Remove the Validate entry (should auto-remove connected hops)
		const removeResult = await removeJobEntry(testFile, 'Validate');
		expect(removeResult.success).toBe(true);

		// Verify Validate is gone
		const job = await parseKettleXml(testFile);
		const entries = Array.isArray(job.job.entries.entry)
			? job.job.entries.entry
			: [job.job.entries.entry];

		expect(entries.find((e: any) => e.name === 'Validate')).toBeUndefined();
		expect(entries.find((e: any) => e.name === 'Extract')).toBeDefined();
		expect(entries.find((e: any) => e.name === 'LoadProd')).toBeDefined();

		// Verify hops to/from Validate are removed
		const hops = job.job.hops.hop
			? Array.isArray(job.job.hops.hop)
				? job.job.hops.hop
				: [job.job.hops.hop]
			: [];

		expect(hops.find((h: any) => h.from === 'Validate' || h.to === 'Validate')).toBeUndefined();
		expect(hops.find((h: any) => h.from === 'START' && h.to === 'Extract')).toBeDefined();
	});

	it('should maintain backup files throughout workflow', async () => {
		// Add entry 1
		await addJobEntry(testFile, 'Entry1', 'TRANS', {
			filename: '/etl/t1.ktr',
		});

		let backupExists = await fs
			.access(`${testFile}.backup`)
			.then(() => true)
			.catch(() => false);
		expect(backupExists).toBe(true);

		// Add entry 2
		await addJobEntry(testFile, 'Entry2', 'WRITE_TO_LOG', {
			logmessage: 'Test',
			loglevel: 'Basic',
		});

		backupExists = await fs
			.access(`${testFile}.backup`)
			.then(() => true)
			.catch(() => false);
		expect(backupExists).toBe(true);

		// Update entry
		await updateJobEntry(testFile, 'Entry1', {
			guiX: 300,
		});

		backupExists = await fs
			.access(`${testFile}.backup`)
			.then(() => true)
			.catch(() => false);
		expect(backupExists).toBe(true);

		// Remove entry
		await removeJobEntry(testFile, 'Entry2');

		backupExists = await fs
			.access(`${testFile}.backup`)
			.then(() => true)
			.catch(() => false);
		expect(backupExists).toBe(true);
	});

	it('should handle error recovery in job operations', async () => {
		// Add valid entry
		const result1 = await addJobEntry(testFile, 'ValidEntry', 'TRANS', {
			filename: '/etl/valid.ktr',
		});
		expect(result1.success).toBe(true);

		// Try to add duplicate entry (should fail)
		const result2 = await addJobEntry(testFile, 'ValidEntry', 'WRITE_TO_LOG', {
			logmessage: 'Test',
			loglevel: 'Basic',
		});
		expect(result2.success).toBe(false);
		expect(result2.error).toContain('already exists');

		// Verify original entry is unchanged
		const job = await parseKettleXml(testFile);
		const entries = Array.isArray(job.job.entries.entry)
			? job.job.entries.entry
			: [job.job.entries.entry];

		const validEntry = entries.find((e: any) => e.name === 'ValidEntry');
		expect(validEntry).toBeDefined();
		expect(validEntry.type).toBe('TRANS');

		// Try to update non-existent entry
		const result3 = await updateJobEntry(testFile, 'NonExistent', {
			guiX: 500,
		});
		expect(result3.success).toBe(false);
		expect(result3.error).toContain('not found');

		// Verify file is still valid
		const job2 = await parseKettleXml(testFile);
		expect(job2.job).toBeDefined();
	});

	it('should handle large jobs with many entries', async () => {
		// Create 15 job entries in a linear pipeline
		const entryCount = 15;
		for (let i = 1; i <= entryCount; i++) {
			const result = await addJobEntry(
				testFile,
				`Entry${i}`,
				i % 3 === 0 ? 'WRITE_TO_LOG' : 'TRANS',
				i % 3 === 0
					? { logmessage: `Log message ${i}`, loglevel: 'Basic' }
					: { filename: `/etl/trans${i}.ktr` },
				{ guiX: i * 100, guiY: 100 }
			);
			expect(result.success).toBe(true);
		}

		// Connect START to first entry
		await addJobHop(testFile, 'START', 'Entry1');

		// Connect them in sequence
		for (let i = 1; i < entryCount; i++) {
			const result = await addJobHop(testFile, `Entry${i}`, `Entry${i + 1}`);
			expect(result.success).toBe(true);
		}

		// Verify all entries and hops exist
		const job = await parseKettleXml(testFile);
		const entries = Array.isArray(job.job.entries.entry)
			? job.job.entries.entry
			: [job.job.entries.entry];

		expect(entries).toHaveLength(entryCount + 1); // +1 for START

		const hops = job.job.hops.hop
			? Array.isArray(job.job.hops.hop)
				? job.job.hops.hop
				: [job.job.hops.hop]
			: [];

		expect(hops).toHaveLength(entryCount);

		// Update a middle entry
		const updateResult = await updateJobEntry(testFile, 'Entry8', {
			guiX: 1500,
			guiY: 200,
		});
		expect(updateResult.success).toBe(true);

		// Remove a middle entry
		const removeResult = await removeJobEntry(testFile, 'Entry10');
		expect(removeResult.success).toBe(true);

		// Verify final state
		const finalJob = await parseKettleXml(testFile);
		const finalEntries = Array.isArray(finalJob.job.entries.entry)
			? finalJob.job.entries.entry
			: [finalJob.job.entries.entry];

		expect(finalEntries).toHaveLength(entryCount); // entryCount - 1 removed + 1 START
		expect(finalEntries.find((e: any) => e.name === 'Entry10')).toBeUndefined();
	});

	it('should handle conditional and unconditional hops correctly', async () => {
		// Create a branching structure
		await addJobEntry(testFile, 'CheckData', 'TRANS', {
			filename: '/etl/check.ktr',
		});
		await addJobEntry(testFile, 'ProcessSuccess', 'TRANS', {
			filename: '/etl/success.ktr',
		});
		await addJobEntry(testFile, 'ProcessFailure', 'TRANS', {
			filename: '/etl/failure.ktr',
		});
		await addJobEntry(testFile, 'AlwaysRun', 'WRITE_TO_LOG', {
			logmessage: 'Job completed',
			loglevel: 'Basic',
		});

		// Add different types of hops
		await addJobHop(testFile, 'START', 'CheckData');
		await addJobHop(testFile, 'CheckData', 'ProcessSuccess', {
			evaluation: true,
		});
		await addJobHop(testFile, 'CheckData', 'ProcessFailure', {
			evaluation: false,
		});
		await addJobHop(testFile, 'ProcessSuccess', 'AlwaysRun');
		await addJobHop(testFile, 'ProcessFailure', 'AlwaysRun', {
			unconditional: true,
		});

		// Verify hop types
		const job = await parseKettleXml(testFile);
		const hops = job.job.hops.hop
			? Array.isArray(job.job.hops.hop)
				? job.job.hops.hop
				: [job.job.hops.hop]
			: [];

		expect(hops).toHaveLength(5);

		const successHop = hops.find((h: any) => h.from === 'CheckData' && h.to === 'ProcessSuccess');
		expect(successHop.evaluation).toBe('Y');

		const failureHop = hops.find((h: any) => h.from === 'CheckData' && h.to === 'ProcessFailure');
		expect(failureHop.evaluation).toBe('N');
	});
});
