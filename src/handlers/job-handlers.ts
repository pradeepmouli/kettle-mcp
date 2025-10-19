/**
 * Tool handlers for Kettle job management
 */

import {
	normalizeKettleJson,
	parseJob,
} from '../parser/xml-parser.js';
import {
	JobSchema,
	type GetJobInput,
	type GetJobOutput,
	type GetJobStatusInput,
	type GetJobStatusOutput,
	type ValidateArtifactInput,
	type ValidateArtifactOutput,
} from '../schemas/index.js';
import { getFileStats, readFile } from '../utils/filesystem.js';
import { validateJob } from '../utils/validation.js';

// ============================================================================
// Get Job
// ============================================================================

/**
 * Read and parse a job file
 */
export async function getJob(input: GetJobInput): Promise<GetJobOutput> {
	// Read file
	const xmlContent = await readFile(input.path);

	// Parse XML
	const parsed = parseJob(xmlContent);
	const normalized = normalizeKettleJson(parsed);

	// Validate schema
	const job = JobSchema.parse(normalized);

	// Get file stats
	const stats = await getFileStats(input.path);

	return {
		job,
		path: input.path,
		size: stats.size,
	};
}

// ============================================================================
// Get Job Status
// ============================================================================

/**
 * Get job status including structure and validation
 */
export async function getJobStatus(
	input: GetJobStatusInput
): Promise<GetJobStatusOutput> {
	// Determine path
	let path: string;
	if ('path' in input) {
		path = input.path;
	} else {
		// TODO: Implement name-based lookup
		throw new Error('Name-based lookup not yet implemented');
	}

	// Read and parse job
	const { job } = await getJob({ path });

	// Validate
	const validation = validateJob(job);

	// Extract entries
	const entries = Array.isArray(job.entries)
		? job.entries.map((entry) => ({
			name: entry.name,
			type: entry.type,
			status: undefined, // Runtime status not available in local mode
			result: undefined,
			errors: undefined,
		}))
		: [];

	return {
		name: job.name,
		path,
		status: 'waiting', // Local files are always waiting unless executed
		entries,
		validation,
		executionStatus: undefined, // No execution in progress
	};
}

// ============================================================================
// Validate Job
// ============================================================================

/**
 * Validate a job file
 */
export async function validateJobFile(
	input: ValidateArtifactInput
): Promise<ValidateArtifactOutput> {
	// Read and parse job
	const { job } = await getJob({ path: input.path });

	// Validate
	const result = validateJob(job);

	return {
		path: input.path,
		type: 'job',
		result,
	};
}
