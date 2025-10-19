/**
 * Tool handlers for editing Kettle artifacts
 * Supports atomic writes, diff preview, backups, and validation
 */

import type { z } from 'zod';
import {
	buildJob,
	buildTransformation,
	denormalizeKettleJson,
} from '../parser/xml-parser.js';
import {
	JobSchema,
	SaveJobInputSchema,
	SaveJobOutputSchema,
	SaveTransformationInputSchema,
	SaveTransformationOutputSchema,
	TransformationSchema,
} from '../schemas/index.js';
import {
	createBackup,
	createUnifiedDiff,
	fileExists,
	writeFile,
} from '../utils/filesystem.js';
import {
	validateJob,
	validateTransformation,
} from '../utils/validation.js';

// Type inference from Zod schemas
type SaveTransformationInput = z.infer<typeof SaveTransformationInputSchema>;
type SaveTransformationOutput = z.infer<typeof SaveTransformationOutputSchema>;
type SaveJobInput = z.infer<typeof SaveJobInputSchema>;
type SaveJobOutput = z.infer<typeof SaveJobOutputSchema>;

// ============================================================================
// Add/Update Transformation
// ============================================================================

/**
 * Save or update a transformation file
 * - Validates input transformation schema
 * - Creates backup if file exists
 * - Performs structural validation
 * - Generates diff preview
 * - Atomically writes file
 */
export async function saveTransformation(
	input: SaveTransformationInput
): Promise<SaveTransformationOutput> {
	const { path, transformation, createBackup: createBackupFile = true } = input;

	// Validate input transformation schema
	const validated = TransformationSchema.parse(transformation);

	// Perform structural validation
	const validation = validateTransformation(validated);
	if (!validation.valid) {
		throw new Error(
			`Transformation validation failed: ${validation.issues.map(i => i.message).join(', ')}`
		);
	}

	// Check if file exists for backup and diff
	const exists = await fileExists(path);
	let backupPath: string | undefined;
	let diff: string | undefined;

	if (exists) {
		// Create backup
		if (createBackupFile) {
			backupPath = await createBackup(path);
		}

		// Generate diff preview
		try {
			const { readFile } = await import('../utils/filesystem.js');
			const oldContent = await readFile(path);

			// Build new XML
			const denormalized = denormalizeKettleJson(validated);
			const newContent = buildTransformation(denormalized);

			diff = createUnifiedDiff(oldContent, newContent, { filename: path });
		} catch (error) {
			// If diff generation fails, continue anyway
			console.warn('Failed to generate diff:', error);
		}
	}

	// Build XML from normalized transformation
	const denormalized = denormalizeKettleJson(validated);
	const xmlContent = buildTransformation(denormalized);

	// Atomically write file
	await writeFile(path, xmlContent);

	return {
		path,
		success: true,
		backupPath,
		diff,
		validation,
	};
}

// ============================================================================
// Add/Update Job
// ============================================================================

/**
 * Save or update a job file
 * - Validates input job schema
 * - Creates backup if file exists
 * - Performs structural validation
 * - Generates diff preview
 * - Atomically writes file
 */
export async function saveJob(
	input: SaveJobInput
): Promise<SaveJobOutput> {
	const { path, job, createBackup: createBackupFile = true } = input;

	// Validate input job schema
	const validated = JobSchema.parse(job);

	// Perform structural validation
	const validation = validateJob(validated);
	if (!validation.valid) {
		throw new Error(
			`Job validation failed: ${validation.issues.map(i => i.message).join(', ')}`
		);
	}

	// Check if file exists for backup and diff
	const exists = await fileExists(path);
	let backupPath: string | undefined;
	let diff: string | undefined;

	if (exists) {
		// Create backup
		if (createBackupFile) {
			backupPath = await createBackup(path);
		}

		// Generate diff preview
		try {
			const { readFile } = await import('../utils/filesystem.js');
			const oldContent = await readFile(path);

			// Build new XML
			const denormalized = denormalizeKettleJson(validated);
			const newContent = buildJob(denormalized);

			diff = createUnifiedDiff(oldContent, newContent, { filename: path });
		} catch (error) {
			// If diff generation fails, continue anyway
			console.warn('Failed to generate diff:', error);
		}
	}

	// Build XML from normalized job
	const denormalized = denormalizeKettleJson(validated);
	const xmlContent = buildJob(denormalized);

	// Atomically write file
	await writeFile(path, xmlContent);

	return {
		path,
		success: true,
		backupPath,
		diff,
		validation,
	};
}
