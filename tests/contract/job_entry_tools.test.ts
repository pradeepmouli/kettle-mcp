
import * as fs from 'fs/promises';
import { tmpdir } from 'os';
import * as path from 'path';
import { parseKettleXml } from '../../src/kettle/xml-utils';
import { addJobEntry, addJobHop } from '../../src/tools/add_job_entry';
import { removeJobEntry, removeJobHop } from '../../src/tools/remove_job_entry';
import { updateJobEntry } from '../../src/tools/update_job_entry';

describe('Job Entry Tools Contract Tests', () => {
	const testDir = path.join(tmpdir(), 'kettle-mcp-tests', 'jobs');
	const sampleFile = path.join(testDir, 'test_job.kjb');

	beforeEach(async () => {
		// Create test directory
		await fs.mkdir(testDir, { recursive: true });

		// Create a minimal job file for testing
		const minimalJob = `<?xml version="1.0" encoding="UTF-8"?>
<job>
  <name>test_job</name>
  <description>Test job</description>
  <extended_description/>
  <job_version/>
  <directory>/</directory>
  <created_user>-</created_user>
  <created_date>2025/01/01 00:00:00.000</created_date>
  <modified_user>-</modified_user>
  <modified_date>2025/01/01 00:00:00.000</modified_date>
  <parameters>
  </parameters>
  <entries>
    <entry>
      <name>START</name>
      <description/>
      <type>SPECIAL</type>
      <attributes/>
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
      <attributes_kjc/>
    </entry>
  </entries>
  <hops>
  </hops>
  <notepads>
  </notepads>
  <order>
  </order>
</job>`;

		await fs.writeFile(sampleFile, minimalJob, 'utf-8');
	});

	afterEach(async () => {
		// Clean up test files
		try {
			await fs.rm(testDir, { recursive: true, force: true });
		} catch (error) {
			// Ignore cleanup errors
		}
	});

	describe('addJobEntry', () => {
		it('should add a new job entry with valid configuration', async () => {
			const result = await addJobEntry(
				sampleFile,
				'LogMessage',
				'WRITE_TO_LOG',
				{
					logmessage: 'Job started successfully',
					loglevel: 'Basic',
				},
				{
					guiX: 150,
					guiY: 50,
					description: 'Log start message',
				}
			);

			expect(result.success).toBe(true);
			expect(result.error).toBeUndefined();

			// Verify the entry was added
			const job = await parseKettleXml(sampleFile);
			const entries = Array.isArray(job.job.entries?.entry)
				? job.job.entries.entry
				: job.job.entries?.entry
					? [job.job.entries.entry]
					: [];

			const newEntry = entries.find((e: any) => e.name === 'LogMessage');
			expect(newEntry).toBeDefined();
			expect(newEntry.type).toBe('WRITE_TO_LOG');
			expect(newEntry.xloc).toBe(150);
			expect(newEntry.yloc).toBe(50);
		});

		it('should reject entry with duplicate name', async () => {
			const result = await addJobEntry(
				sampleFile,
				'START', // This already exists
				'WRITE_TO_LOG',
				{
					message: 'Test',
					logLevel: 'Basic',
				}
			);

			expect(result.success).toBe(false);
			expect(result.error).toContain('already exists');
		});

		it('should reject entry with invalid configuration', async () => {
			const result = await addJobEntry(
				sampleFile,
				'BadEntry',
				'TRANS',
				{
					// Missing required 'filename' field
					runConfiguration: 'local',
				}
			);

			expect(result.success).toBe(false);
			expect(result.error).toBeDefined();
		});

		it('should use default coordinates if not provided', async () => {
			const result = await addJobEntry(sampleFile, 'DefaultCoords', 'WRITE_TO_LOG', {
				logmessage: 'Test message',
				loglevel: 'Basic',
			});

			expect(result.success).toBe(true);

			const job = await parseKettleXml(sampleFile);
			const entries = Array.isArray(job.job.entries?.entry)
				? job.job.entries.entry
				: job.job.entries?.entry
					? [job.job.entries.entry]
					: [];

			const newEntry = entries.find((e: any) => e.name === 'DefaultCoords');
			expect(newEntry.xloc).toBe(100);
			expect(newEntry.yloc).toBe(100);
		});

		it('should handle TRANS entry type correctly', async () => {
			const result = await addJobEntry(
				sampleFile,
				'RunTransformation',
				'TRANS',
				{
					filename: '/path/to/transformation.ktr',
					runConfiguration: 'local',
					logLevel: 'Basic',
				},
				{
					guiX: 200,
					guiY: 50,
				}
			);

			expect(result.success).toBe(true);

			const job = await parseKettleXml(sampleFile);
			const entries = Array.isArray(job.job.entries?.entry)
				? job.job.entries.entry
				: job.job.entries?.entry
					? [job.job.entries.entry]
					: [];

			const transEntry = entries.find((e: any) => e.name === 'RunTransformation');
			expect(transEntry).toBeDefined();
			expect(transEntry.type).toBe('TRANS');
		});
		it('should create backup file before modification', async () => {
			await addJobEntry(sampleFile, 'BackupTest', 'WRITE_TO_LOG', {
				logmessage: 'Backup test',
				loglevel: 'Basic',
			});

			const backupFile = `${sampleFile}.backup`;
			const backupExists = await fs
				.access(backupFile)
				.then(() => true)
				.catch(() => false);

			expect(backupExists).toBe(true);
		});
	});


	describe('addJobHop', () => {
		beforeEach(async () => {
			// Add a second entry to connect
			await addJobEntry(sampleFile, 'LogMessage', 'WRITE_TO_LOG', {
				logmessage: 'Test',
				loglevel: 'Basic',
			});
		});

		it('should add a hop between existing entries', async () => {
			const result = await addJobHop(sampleFile, 'START', 'LogMessage', {
				enabled: true,
				evaluation: true,
				unconditional: false,
			});

			expect(result.success).toBe(true);
			expect(result.error).toBeUndefined();

			// Verify the hop was added
			const job = await parseKettleXml(sampleFile);
			const hops = job.job.hops?.hop
				? Array.isArray(job.job.hops.hop)
					? job.job.hops.hop
					: [job.job.hops.hop]
				: [];

			const hop = hops.find((h: any) => h.from === 'START' && h.to === 'LogMessage');
			expect(hop).toBeDefined();
		});

		it('should reject hop with non-existent source entry', async () => {
			const result = await addJobHop(sampleFile, 'NonExistent', 'LogMessage');

			expect(result.success).toBe(false);
			expect(result.error).toContain('does not exist');
		});

		it('should reject hop with non-existent target entry', async () => {
			const result = await addJobHop(sampleFile, 'START', 'NonExistent');

			expect(result.success).toBe(false);
			expect(result.error).toContain('does not exist');
		});

		it('should reject duplicate hop', async () => {
			// Add the hop once
			await addJobHop(sampleFile, 'START', 'LogMessage');

			// Try to add it again
			const result = await addJobHop(sampleFile, 'START', 'LogMessage');

			expect(result.success).toBe(false);
			expect(result.error).toContain('already exists');
		});

		it('should use default hop options if not provided', async () => {
			const result = await addJobHop(sampleFile, 'START', 'LogMessage');

			expect(result.success).toBe(true);

			const job = await parseKettleXml(sampleFile);
			const hops = job.job.hops?.hop
				? Array.isArray(job.job.hops.hop)
					? job.job.hops.hop
					: [job.job.hops.hop]
				: [];

			const hop = hops.find((h: any) => h.from === 'START' && h.to === 'LogMessage');
			expect(hop.enabled).toBe('Y');
			expect(hop.evaluation).toBe('Y');
		});
	});

	describe('updateJobEntry', () => {
		beforeEach(async () => {
			// Add an entry to update
			await addJobEntry(sampleFile, 'LogMessage', 'WRITE_TO_LOG', {
				logmessage: 'Original message',
				loglevel: 'Basic',
			});
		});

		it('should update entry configuration', async () => {
			const result = await updateJobEntry(sampleFile, 'LogMessage', {
				configuration: {
					logmessage: 'Updated message',
					loglevel: 'Detailed',
				},
			});

			expect(result.success).toBe(true);
			expect(result.error).toBeUndefined();

			// Verify the configuration was updated
			const job = await parseKettleXml(sampleFile);
			const entries = Array.isArray(job.job.entries?.entry)
				? job.job.entries.entry
				: job.job.entries?.entry
					? [job.job.entries.entry]
					: [];

			const updatedEntry = entries.find((e: any) => e.name === 'LogMessage');
			expect(updatedEntry.logmessage).toBe('Updated message');
			expect(updatedEntry.loglevel).toBe('Detailed');
		});

		it('should update entry coordinates', async () => {
			const result = await updateJobEntry(sampleFile, 'LogMessage', {
				guiX: 250,
				guiY: 150,
			});

			expect(result.success).toBe(true);

			// Verify coordinates were updated
			const job = await parseKettleXml(sampleFile);
			const entries = Array.isArray(job.job.entries?.entry)
				? job.job.entries.entry
				: job.job.entries?.entry
					? [job.job.entries.entry]
					: [];

			const updatedEntry = entries.find((e: any) => e.name === 'LogMessage');
			expect(updatedEntry.xloc).toBe(250);
			expect(updatedEntry.yloc).toBe(150);
		});

		it('should update both configuration and coordinates', async () => {
			const result = await updateJobEntry(sampleFile, 'LogMessage', {
				configuration: {
					logmessage: 'New message',
					loglevel: 'Debug',
				},
				guiX: 300,
				guiY: 200,
			});

			expect(result.success).toBe(true);

			const job = await parseKettleXml(sampleFile);
			const entries = Array.isArray(job.job.entries?.entry)
				? job.job.entries.entry
				: job.job.entries?.entry
					? [job.job.entries.entry]
					: [];

			const updatedEntry = entries.find((e: any) => e.name === 'LogMessage');
			expect(updatedEntry.logmessage).toBe('New message');
			expect(updatedEntry.xloc).toBe(300);
			expect(updatedEntry.yloc).toBe(200);
		});

		it('should reject update for non-existent entry', async () => {
			const result = await updateJobEntry(sampleFile, 'NonExistent', {
				guiX: 400,
			});

			expect(result.success).toBe(false);
			expect(result.error).toContain('not found');
		});

		it('should create backup file before update', async () => {
			await updateJobEntry(sampleFile, 'LogMessage', {
				guiX: 220,
			});

			const backupFile = `${sampleFile}.backup`;
			const backupExists = await fs
				.access(backupFile)
				.then(() => true)
				.catch(() => false);

			expect(backupExists).toBe(true);
		});
	});

	describe('removeJobEntry', () => {
		beforeEach(async () => {
			// Add entries for removal tests
			await addJobEntry(sampleFile, 'LogMessage', 'WRITE_TO_LOG', {
				logmessage: 'Test',
				loglevel: 'Basic',
			});
			await addJobEntry(sampleFile, 'RunTrans', 'TRANS', {
				filename: '/test.ktr',
			});
		});

		it('should remove a job entry', async () => {
			const result = await removeJobEntry(sampleFile, 'LogMessage');

			expect(result.success).toBe(true);
			expect(result.error).toBeUndefined();

			// Verify the entry was removed
			const job = await parseKettleXml(sampleFile);
			const entries = Array.isArray(job.job.entries?.entry)
				? job.job.entries.entry
				: job.job.entries?.entry
					? [job.job.entries.entry]
					: [];

			const removedEntry = entries.find((e: any) => e.name === 'LogMessage');
			expect(removedEntry).toBeUndefined();

			// Verify other entries still exist
			const startEntry = entries.find((e: any) => e.name === 'START');
			expect(startEntry).toBeDefined();
		});

		it('should auto-remove connected hops when removing an entry', async () => {
			// Add hops
			await addJobHop(sampleFile, 'START', 'LogMessage');
			await addJobHop(sampleFile, 'LogMessage', 'RunTrans');

			// Remove the middle entry
			const result = await removeJobEntry(sampleFile, 'LogMessage');

			expect(result.success).toBe(true);

			// Verify hops were removed
			const job = await parseKettleXml(sampleFile);
			const hops = job.job.hops?.hop
				? Array.isArray(job.job.hops.hop)
					? job.job.hops.hop
					: [job.job.hops.hop]
				: [];

			const logMessageHops = hops.filter(
				(h: any) => h.from === 'LogMessage' || h.to === 'LogMessage'
			);
			expect(logMessageHops).toHaveLength(0);
		});

		it('should reject removal of non-existent entry', async () => {
			const result = await removeJobEntry(sampleFile, 'NonExistent');

			expect(result.success).toBe(false);
			expect(result.error).toContain('not found');
		});

		it('should create backup file before removal', async () => {
			await removeJobEntry(sampleFile, 'LogMessage');

			const backupFile = `${sampleFile}.backup`;
			const backupExists = await fs
				.access(backupFile)
				.then(() => true)
				.catch(() => false);

			expect(backupExists).toBe(true);
		});
	});

	describe('removeJobHop', () => {
		beforeEach(async () => {
			// Add entries and hops for removal tests
			await addJobEntry(sampleFile, 'LogMessage', 'WRITE_TO_LOG', {
				logmessage: 'Test',
				loglevel: 'Basic',
			});
			await addJobEntry(sampleFile, 'RunTrans', 'TRANS', {
				filename: '/test.ktr',
			});
			await addJobHop(sampleFile, 'START', 'LogMessage');
			await addJobHop(sampleFile, 'LogMessage', 'RunTrans');
		});

		it('should remove a specific hop', async () => {
			const result = await removeJobHop(sampleFile, 'START', 'LogMessage');

			expect(result.success).toBe(true);
			expect(result.error).toBeUndefined();

			// Verify the hop was removed
			const job = await parseKettleXml(sampleFile);
			const hops = job.job.hops?.hop
				? Array.isArray(job.job.hops.hop)
					? job.job.hops.hop
					: [job.job.hops.hop]
				: [];

			const removedHop = hops.find((h: any) => h.from === 'START' && h.to === 'LogMessage');
			expect(removedHop).toBeUndefined();
		});

		it('should not affect other hops when removing one', async () => {
			await removeJobHop(sampleFile, 'START', 'LogMessage');

			// Verify the other hop still exists
			const job = await parseKettleXml(sampleFile);
			const hops = job.job.hops?.hop
				? Array.isArray(job.job.hops.hop)
					? job.job.hops.hop
					: [job.job.hops.hop]
				: [];

			const remainingHop = hops.find(
				(h: any) => h.from === 'LogMessage' && h.to === 'RunTrans'
			);
			expect(remainingHop).toBeDefined();
		});

		it('should reject removal of non-existent hop', async () => {
			const result = await removeJobHop(sampleFile, 'START', 'RunTrans');

			expect(result.success).toBe(false);
			expect(result.error).toContain('not found');
		});

		it('should create backup file before removal', async () => {
			await removeJobHop(sampleFile, 'LogMessage', 'RunTrans');

			const backupFile = `${sampleFile}.backup`;
			const backupExists = await fs
				.access(backupFile)
				.then(() => true)
				.catch(() => false);

			expect(backupExists).toBe(true);
		});
	});
});
