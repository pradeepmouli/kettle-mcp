/**
 * Tests for edit handlers (saveTransformation, saveJob)
 */

import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { saveJob, saveTransformation } from '../handlers/edit-handlers.js';
import type { Job, Transformation } from '../schemas/kettle-types.js';
import { fileExists, readFile } from '../utils/filesystem.js';

describe('Edit Handlers', () => {
	let tempDir: string;
	let testTransformationPath: string;
	let testJobPath: string;

	beforeEach(async () => {
		// Create temporary directory for test files
		tempDir = await mkdtemp(join(tmpdir(), 'kettle-mcp-edit-test-'));
		testTransformationPath = join(tempDir, 'test.ktr');
		testJobPath = join(tempDir, 'test.kjb');
	});

	afterEach(async () => {
		// Clean up temporary directory
		await rm(tempDir, { recursive: true, force: true });
	});

	describe('saveTransformation', () => {
		const sampleTransformation: Transformation = {
			info: {
				name: 'Test Transformation',
				description: 'Test description',
				extended_description: '',
				trans_version: '',
				trans_type: 'Normal',
				trans_status: 0,
				directory: '/',
				parameters: [],
				log: {},
				maxdate: {},
				size_rowset: 10000,
				sleep_time_empty: 50,
				sleep_time_full: 50,
				unique_connections: 'N',
				feedback_shown: 'Y',
				feedback_size: 50000,
				using_thread_priorities: 'Y',
				shared_objects_file: '',
				capture_step_performance: 'N',
				step_performance_capturing_delay: 1000,
				step_performance_capturing_size_limit: 100,
				dependencies: [],
				created_user: '',
				created_date: '',
				modified_user: '',
				modified_date: ''
			},
			notepads: [],
			order: [],
			steps: []
		};

		it('should create a new transformation file', async () => {
			const result = await saveTransformation({
				path: testTransformationPath,
				transformation: sampleTransformation,
				createBackup: false
			});

			expect(result.success).toBe(true);
			expect(result.path).toBe(testTransformationPath);
			expect(result.backupPath).toBeUndefined();
			expect(result.diff).toBeUndefined();

			// Verify file was created
			const exists = await fileExists(testTransformationPath);
			expect(exists).toBe(true);

			// Verify content is valid XML
			const content = await readFile(testTransformationPath);
			expect(content).toContain('<?xml version="1.0" encoding="UTF-8"?>');
			expect(content).toContain('<transformation>');
			expect(content).toContain('<name>Test Transformation</name>');
		});

		it('should update an existing transformation file', async () => {
			// Create initial file
			await saveTransformation({
				path: testTransformationPath,
				transformation: sampleTransformation,
				createBackup: false
			});

			// Update the transformation
			const updated: Transformation = {
				...sampleTransformation,
				info: {
					...sampleTransformation.info,
					name: 'Updated Transformation',
					description: 'Updated description'
				}
			};

			const result = await saveTransformation({
				path: testTransformationPath,
				transformation: updated,
				createBackup: false
			});

			expect(result.success).toBe(true);
			expect(result.diff).toBeDefined();
			expect(result.diff).toContain('Test Transformation');
			expect(result.diff).toContain('Updated Transformation');

			// Verify updated content
			const content = await readFile(testTransformationPath);
			expect(content).toContain('<name>Updated Transformation</name>');
			expect(content).toContain('<description>Updated description</description>');
		});

		it('should create a backup when requested', async () => {
			// Create initial file
			await saveTransformation({
				path: testTransformationPath,
				transformation: sampleTransformation,
				createBackup: false
			});

			// Update with backup
			const updated: Transformation = {
				...sampleTransformation,
				info: {
					...sampleTransformation.info,
					name: 'Updated Transformation'
				}
			};

			const result = await saveTransformation({
				path: testTransformationPath,
				transformation: updated,
				createBackup: true
			});

			expect(result.success).toBe(true);
			expect(result.backupPath).toBeDefined();
			// Match ISO backup file format: test.backup.YYYY-MM-DDTHH-MM-SS-SSSZ.ktr
			expect(result.backupPath).toMatch(/\.backup\.\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z\.ktr$/);

			// Verify backup exists and contains original content
			const backupExists = await fileExists(result.backupPath!);
			expect(backupExists).toBe(true);

			const backupContent = await readFile(result.backupPath!);
			expect(backupContent).toContain('<name>Test Transformation</name>');
		});

		it('should generate a unified diff for updates', async () => {
			// Create initial file
			await saveTransformation({
				path: testTransformationPath,
				transformation: sampleTransformation,
				createBackup: false
			});

			// Update the transformation
			const updated: Transformation = {
				...sampleTransformation,
				info: {
					...sampleTransformation.info,
					description: 'Changed description'
				}
			};

			const result = await saveTransformation({
				path: testTransformationPath,
				transformation: updated,
				createBackup: false
			});

			expect(result.success).toBe(true);
			expect(result.diff).toBeDefined();
			// Check for unified diff markers
			expect(result.diff).toMatch(/^-.*<description>Test description<\/description>/m);
			expect(result.diff).toMatch(/^\+.*<description>Changed description<\/description>/m);
		});

		it('should reject invalid transformation structure', async () => {
			const invalid = {
				transformation: {
					// Missing required 'info' field
					notepads: [],
					order: [],
					step: []
				}
			} as unknown as Transformation;

			await expect(async () => {
				await saveTransformation({
					path: testTransformationPath,
					transformation: invalid,
					createBackup: false
				});
			}).rejects.toThrow(); // Accept any thrown error (ZodError)

			// Verify file was not created
			const exists = await fileExists(testTransformationPath);
			expect(exists).toBe(false);
		});

		it('should handle transformations with steps', async () => {
			const withSteps: Transformation = {
				...sampleTransformation,
				steps: [
					{
						name: 'Table Input',
						type: 'TableInput',
						description: '',
						distribute: 'Y',
						custom_distribution: '',
						copies: 1,
						partitioning: {
							method: 'none',
							schema_name: ''
						},
						connection: 'localhost',
						sql: 'SELECT * FROM users',
						limit: 0,
						lookup: '',
						execute_each_row: false,
						variables_active: false,
						lazy_conversion_active: false
					}
				]
			};

			const result = await saveTransformation({
				path: testTransformationPath,
				transformation: withSteps,
				createBackup: false
			});

			expect(result.success).toBe(true);

			// Verify step was saved
			const content = await readFile(testTransformationPath);
			expect(content).toContain('<step>');
			expect(content).toContain('<name>Table Input</name>');
			expect(content).toContain('<type>TableInput</type>');
		});
	});

	describe('saveJob', () => {
		const sampleJob: Job = {
			name: 'Test Job',
			description: 'Test description',
			extended_description: '',
			job_version: '',
			job_status: 0,
			directory: '/',
			created_user: '',
			created_date: '',
			modified_user: '',
			modified_date: '',
			parameters: [],
			entries: [],
			hops: [],
			notepads: []
		};

		it('should create a new job file', async () => {
			const result = await saveJob({
				path: testJobPath,
				job: sampleJob,
				createBackup: false
			});

			expect(result.success).toBe(true);
			expect(result.path).toBe(testJobPath);
			expect(result.backupPath).toBeUndefined();
			expect(result.diff).toBeUndefined();

			// Verify file was created
			const exists = await fileExists(testJobPath);
			expect(exists).toBe(true);

			// Verify content is valid XML
			const content = await readFile(testJobPath);
			expect(content).toContain('<?xml version="1.0" encoding="UTF-8"?>');
			expect(content).toContain('<job>');
			expect(content).toContain('<name>Test Job</name>');
		});

		it('should update an existing job file', async () => {
			// Create initial file
			await saveJob({
				path: testJobPath,
				job: sampleJob,
				createBackup: false
			});

			// Update the job
			const updated: Job = {
				...sampleJob,
				name: 'Updated Job',
				description: 'Updated description'
			};

			const result = await saveJob({
				path: testJobPath,
				job: updated,
				createBackup: false
			});

			expect(result.success).toBe(true);
			expect(result.diff).toBeDefined();
			expect(result.diff).toContain('Test Job');
			expect(result.diff).toContain('Updated Job');

			// Verify updated content
			const content = await readFile(testJobPath);
			expect(content).toContain('<name>Updated Job</name>');
			expect(content).toContain('<description>Updated description</description>');
		});

		it('should create a backup when requested', async () => {
			// Create initial file
			await saveJob({
				path: testJobPath,
				job: sampleJob,
				createBackup: false
			});

			// Update with backup
			const updated: Job = {
				...sampleJob,
				name: 'Updated Job'
			};

			const result = await saveJob({
				path: testJobPath,
				job: updated,
				createBackup: true
			});

			expect(result.success).toBe(true);
			expect(result.backupPath).toBeDefined();
			expect(result.backupPath).toMatch(/\.backup\.\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z\.kjb$/);

			// Verify backup exists and contains original content
			const backupExists = await fileExists(result.backupPath!);
			expect(backupExists).toBe(true);

			const backupContent = await readFile(result.backupPath!);
			expect(backupContent).toContain('<name>Test Job</name>');
		});

		it('should generate a unified diff for updates', async () => {
			// Create initial file
			await saveJob({
				path: testJobPath,
				job: sampleJob,
				createBackup: false
			});

			// Update the job
			const updated: Job = {
				...sampleJob,
				description: 'Changed description'
			};

			const result = await saveJob({
				path: testJobPath,
				job: updated,
				createBackup: false
			});

			expect(result.success).toBe(true);
			expect(result.diff).toBeDefined();
			expect(result.diff).toMatch(/^-.*<description>Test description<\/description>/m);
			expect(result.diff).toMatch(/^\+.*<description>Changed description<\/description>/m);
		});

		it('should reject invalid job structure', async () => {
			const invalid = {
				job: {
					// Missing required fields
					entries: []
				}
			} as unknown as Job;

			await expect(async () => {
				await saveJob({
					path: testJobPath,
					job: invalid,
					createBackup: false
				});
			}).rejects.toThrow();

			// Verify file was not created
			const exists = await fileExists(testJobPath);
			expect(exists).toBe(false);
		});

		it('should handle jobs with entries', async () => {
			const withEntries: Job = {
				...sampleJob,
				entries: [
					{
						name: 'START',
						type: 'SPECIAL',
						description: '',
						start: 'Y',
						dummy: 'N',
						repeat: 'N',
						schedulerType: 0,
						intervalSeconds: 0,
						intervalMinutes: 60,
						hour: 12,
						minutes: 0,
						weekDay: 0,
						DayOfMonth: 1,
						parallel: 'N',
						xloc: 100,
						yloc: 100,
						attributes: {}
					}
				]
			};

			const result = await saveJob({
				path: testJobPath,
				job: withEntries,
				createBackup: false
			});

			expect(result.success).toBe(true);

			// Verify entry was saved
			const content = await readFile(testJobPath);
			expect(content).toContain('<entry>');
			expect(content).toContain('<name>START</name>');
			expect(content).toContain('<type>SPECIAL</type>');
		});
	});
});
