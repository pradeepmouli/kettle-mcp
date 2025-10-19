/**
 * Tool handlers for Kettle transformation management
 */

import {
	normalizeKettleJson,
	parseTransformation,
} from '../parser/xml-parser.js';
import {
	TransformationSchema,
	type GetTransformationInput,
	type GetTransformationOutput,
	type GetTransformationStatusInput,
	type GetTransformationStatusOutput,
	type ValidateArtifactInput,
	type ValidateArtifactOutput,
} from '../schemas/index.js';
import { getFileStats, readFile } from '../utils/filesystem.js';
import { validateTransformation } from '../utils/validation.js';

// ============================================================================
// Get Transformation
// ============================================================================

/**
 * Read and parse a transformation file
 */
export async function getTransformation(
	input: GetTransformationInput
): Promise<GetTransformationOutput> {
	// Read file
	const xmlContent = await readFile(input.path);

	// Parse XML
	const parsed = parseTransformation(xmlContent);
	const normalized = normalizeKettleJson(parsed);

	// Validate schema
	const transformation = TransformationSchema.parse(normalized);

	// Get file stats
	const stats = await getFileStats(input.path);

	return {
		transformation,
		path: input.path,
		size: stats.size,
	};
}

// ============================================================================
// Get Transformation Status
// ============================================================================

/**
 * Get transformation status including structure and validation
 */
export async function getTransformationStatus(
	input: GetTransformationStatusInput
): Promise<GetTransformationStatusOutput> {
	// Determine path
	let path: string;
	if ('path' in input) {
		path = input.path;
	} else {
		// TODO: Implement name-based lookup
		throw new Error('Name-based lookup not yet implemented');
	}

	// Read and parse transformation
	const { transformation } = await getTransformation({ path });

	// Validate
	const validation = validateTransformation(transformation);

	// Extract steps
	const steps = Array.isArray(transformation.steps)
		? transformation.steps.map((step) => ({
			name: step.name,
			type: step.type,
			status: undefined, // Runtime status not available in local mode
			linesRead: undefined,
			linesWritten: undefined,
			errors: undefined,
		}))
		: [];

	return {
		name: transformation.info.name,
		path,
		status: 'waiting', // Local files are always waiting unless executed
		steps,
		validation,
		executionStatus: undefined, // No execution in progress
	};
}

// ============================================================================
// Validate Transformation
// ============================================================================

/**
 * Validate a transformation file
 */
export async function validateTransformationFile(
	input: ValidateArtifactInput
): Promise<ValidateArtifactOutput> {
	// Read and parse transformation
	const { transformation } = await getTransformation({ path: input.path });

	// Validate
	const result = validateTransformation(transformation);

	return {
		path: input.path,
		type: 'transformation',
		result,
	};
}
