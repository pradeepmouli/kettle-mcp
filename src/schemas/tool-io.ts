/**
 * Zod schemas for MCP tool I/O envelopes
 *
 * These schemas validate the input arguments and output results
 * for each MCP tool exposed by the Kettle server.
 */

import { z } from 'zod';
import {
	ExecutionResultSchema,
	ExecutionStatusSchema,
	JobSchema,
	SearchIndexEntrySchema,
	TransformationSchema,
	ValidationResultSchema,
} from './kettle-types.js';

// ============================================================================
// Common Tool I/O Types
// ============================================================================

export const FilePathInputSchema = z.object({
	path: z.string().describe('Absolute or workspace-relative path to the file'),
});

export const NameInputSchema = z.object({
	name: z.string().describe('Name of the transformation or job'),
	id: z.string().optional().describe('Optional ID for disambiguation'),
});

export const XmlFormatInputSchema = z.object({
	xml: z.boolean().optional().describe('Output format: true for XML, false for HTML/JSON'),
});

// ============================================================================
// Server Management Tools
// ============================================================================

export const GetServerStatusInputSchema = z.object({
	...XmlFormatInputSchema.shape,
});

export const GetServerStatusOutputSchema = z.object({
	status: z.string(),
	workspacePath: z.string(),
	transformations: z.array(z.object({
		name: z.string(),
		path: z.string(),
		status: ExecutionStatusSchema.optional(),
	})),
	jobs: z.array(z.object({
		name: z.string(),
		path: z.string(),
		status: ExecutionStatusSchema.optional(),
	})),
	systemInfo: z.object({
		nodeVersion: z.string(),
		platform: z.string(),
		arch: z.string(),
		memoryUsage: z.record(z.string(), z.number()),
	}),
});

// ============================================================================
// Transformation Management Tools
// ============================================================================

// Read/Parse Transformation
export const GetTransformationInputSchema = FilePathInputSchema;
export const GetTransformationOutputSchema = z.object({
	transformation: TransformationSchema,
	path: z.string(),
	size: z.number(),
});

// Get Transformation Status
export const GetTransformationStatusInputSchema = z.intersection(
	NameInputSchema,
	XmlFormatInputSchema,
).or(FilePathInputSchema.merge(XmlFormatInputSchema));

export const GetTransformationStatusOutputSchema = z.object({
	name: z.string(),
	path: z.string().optional(),
	status: ExecutionStatusSchema,
	steps: z.array(z.object({
		name: z.string(),
		type: z.string(),
		status: z.string().optional(),
		linesRead: z.number().optional(),
		linesWritten: z.number().optional(),
		errors: z.number().optional(),
	})),
	validation: ValidationResultSchema.optional(),
	executionStatus: ExecutionResultSchema.optional(),
});

// Add/Register Transformation
export const AddTransformationInputSchema = z.object({
	content: z.string().describe('XML content of the transformation'),
	name: z.string().optional().describe('Optional name override'),
	path: z.string().optional().describe('Optional target path'),
});

export const AddTransformationOutputSchema = z.object({
	success: z.boolean(),
	name: z.string(),
	path: z.string(),
	id: z.string().optional(),
});

export const RegisterTransformationInputSchema = FilePathInputSchema.merge(XmlFormatInputSchema);
export const RegisterTransformationOutputSchema = AddTransformationOutputSchema;

// Execute Transformation
export const ExecuteTransformationInputSchema = z.intersection(
	NameInputSchema,
	z.object({
		sync: z.boolean().optional().describe('Synchronous execution (default: false)'),
		timeout: z.number().optional().describe('Timeout in milliseconds'),
		params: z.record(z.string(), z.string()).optional().describe('Transformation parameters'),
		dryRun: z.boolean().optional().describe('Preview without execution'),
		confirm: z.boolean().optional().describe('User confirmation required'),
	}),
).or(
	FilePathInputSchema.merge(z.object({
		sync: z.boolean().optional(),
		timeout: z.number().optional(),
		params: z.record(z.string(), z.string()).optional(),
		dryRun: z.boolean().optional(),
		confirm: z.boolean().optional(),
	})),
);

export const ExecuteTransformationOutputSchema = z.object({
	success: z.boolean(),
	result: ExecutionResultSchema,
	preview: z.string().optional(), // Dry-run preview
});

// Start/Stop/Pause Transformation
export const StartTransformationInputSchema = z.intersection(
	NameInputSchema,
	XmlFormatInputSchema,
).or(FilePathInputSchema.merge(XmlFormatInputSchema));

export const StartTransformationOutputSchema = z.object({
	success: z.boolean(),
	name: z.string(),
	status: ExecutionStatusSchema,
	message: z.string().optional(),
});

export const StopTransformationInputSchema = StartTransformationInputSchema;
export const StopTransformationOutputSchema = StartTransformationOutputSchema;

export const PauseTransformationInputSchema = StartTransformationInputSchema;
export const PauseTransformationOutputSchema = StartTransformationOutputSchema;

// Remove Transformation
export const RemoveTransformationInputSchema = z.intersection(
	NameInputSchema,
	XmlFormatInputSchema,
).or(FilePathInputSchema.merge(XmlFormatInputSchema));

export const RemoveTransformationOutputSchema = z.object({
	success: z.boolean(),
	name: z.string(),
	message: z.string().optional(),
});

// Cleanup Transformation
export const CleanupTransformationInputSchema = RemoveTransformationInputSchema;
export const CleanupTransformationOutputSchema = RemoveTransformationOutputSchema;

// ============================================================================
// Job Management Tools
// ============================================================================

// Read/Parse Job
export const GetJobInputSchema = FilePathInputSchema;
export const GetJobOutputSchema = z.object({
	job: JobSchema,
	path: z.string(),
	size: z.number(),
});

// Get Job Status
export const GetJobStatusInputSchema = z.intersection(
	NameInputSchema,
	XmlFormatInputSchema,
).or(FilePathInputSchema.merge(XmlFormatInputSchema));

export const GetJobStatusOutputSchema = z.object({
	name: z.string(),
	path: z.string().optional(),
	status: ExecutionStatusSchema,
	entries: z.array(z.object({
		name: z.string(),
		type: z.string(),
		status: z.string().optional(),
		result: z.string().optional(),
		errors: z.number().optional(),
	})),
	validation: ValidationResultSchema.optional(),
	executionStatus: ExecutionResultSchema.optional(),
});

// Add/Register Job
export const AddJobInputSchema = z.object({
	content: z.string().describe('XML content of the job'),
	name: z.string().optional().describe('Optional name override'),
	path: z.string().optional().describe('Optional target path'),
});

export const AddJobOutputSchema = z.object({
	success: z.boolean(),
	name: z.string(),
	path: z.string(),
	id: z.string().optional(),
});

export const RegisterJobInputSchema = FilePathInputSchema.merge(XmlFormatInputSchema);
export const RegisterJobOutputSchema = AddJobOutputSchema;

// Execute Job
export const ExecuteJobInputSchema = z.intersection(
	NameInputSchema,
	z.object({
		sync: z.boolean().optional().describe('Synchronous execution (default: false)'),
		timeout: z.number().optional().describe('Timeout in milliseconds'),
		params: z.record(z.string(), z.string()).optional().describe('Job parameters'),
		dryRun: z.boolean().optional().describe('Preview without execution'),
		confirm: z.boolean().optional().describe('User confirmation required'),
	}),
).or(
	FilePathInputSchema.merge(z.object({
		sync: z.boolean().optional(),
		timeout: z.number().optional(),
		params: z.record(z.string(), z.string()).optional(),
		dryRun: z.boolean().optional(),
		confirm: z.boolean().optional(),
	})),
);

export const ExecuteJobOutputSchema = z.object({
	success: z.boolean(),
	result: ExecutionResultSchema,
	preview: z.string().optional(), // Dry-run preview
});

// Start/Stop Job
export const StartJobInputSchema = z.intersection(
	NameInputSchema,
	XmlFormatInputSchema,
).or(FilePathInputSchema.merge(XmlFormatInputSchema));

export const StartJobOutputSchema = z.object({
	success: z.boolean(),
	name: z.string(),
	status: ExecutionStatusSchema,
	message: z.string().optional(),
});

export const StopJobInputSchema = StartJobInputSchema;
export const StopJobOutputSchema = StartJobOutputSchema;

// Remove Job
export const RemoveJobInputSchema = z.intersection(
	NameInputSchema,
	XmlFormatInputSchema,
).or(FilePathInputSchema.merge(XmlFormatInputSchema));

export const RemoveJobOutputSchema = z.object({
	success: z.boolean(),
	name: z.string(),
	message: z.string().optional(),
});

// ============================================================================
// Validation & Search Tools
// ============================================================================

// Validate Transformation/Job
export const ValidateArtifactInputSchema = FilePathInputSchema.merge(z.object({
	strict: z.boolean().optional().describe('Strict validation mode'),
	version: z.string().optional().describe('Target Kettle version (default: 9.x)'),
}));

export const ValidateArtifactOutputSchema = z.object({
	path: z.string(),
	type: z.enum(['transformation', 'job']),
	result: ValidationResultSchema,
});

// Search Artifacts
export const SearchArtifactsInputSchema = z.object({
	query: z.string().describe('Search query (name, step type, parameter, etc.)'),
	type: z.enum(['transformation', 'job', 'all']).optional().describe('Filter by type'),
	directory: z.string().optional().describe('Search root directory'),
	maxResults: z.number().optional().describe('Maximum results to return'),
});

export const SearchArtifactsOutputSchema = z.object({
	results: z.array(SearchIndexEntrySchema),
	total: z.number(),
	query: z.string(),
});

// List Transformations/Jobs
export const ListArtifactsInputSchema = z.object({
	type: z.enum(['transformation', 'job', 'all']),
	directory: z.string().optional().describe('Search root directory'),
	detailed: z.boolean().optional().describe('Include detailed metadata'),
});

export const ListArtifactsOutputSchema = z.object({
	artifacts: z.array(SearchIndexEntrySchema),
	total: z.number(),
});

// ============================================================================
// Edit Tools
// ============================================================================

// Edit Transformation/Job
export const EditArtifactInputSchema = z.object({
	path: z.string().describe('Path to the artifact'),
	changes: z.array(z.object({
		operation: z.enum(['add', 'update', 'delete']),
		target: z.enum(['step', 'entry', 'hop', 'parameter', 'info']),
		name: z.string().optional().describe('Target element name'),
		data: z.unknown().optional().describe('New or updated data'),
	})),
	dryRun: z.boolean().optional().describe('Preview changes without applying'),
	backup: z.boolean().optional().describe('Create backup (default: true)'),
});

export const EditArtifactOutputSchema = z.object({
	success: z.boolean(),
	path: z.string(),
	changes: z.number(),
	diff: z.string().optional(), // Unified diff
	backupPath: z.string().optional(),
});

// ============================================================================
// Utility Tools
// ============================================================================

// Get Properties
export const GetPropertiesInputSchema = XmlFormatInputSchema;
export const GetPropertiesOutputSchema = z.object({
	properties: z.record(z.string(), z.string()),
});

// Sniff Step
export const SniffStepInputSchema = z.object({
	trans: z.string().describe('Transformation name or path'),
	step: z.string().describe('Step name'),
	copynr: z.number().optional().describe('Copy number'),
	type: z.string().optional().describe('Data type filter'),
	maxRows: z.number().optional().describe('Maximum rows to sniff'),
});

export const SniffStepOutputSchema = z.object({
	step: z.string(),
	rows: z.array(z.record(z.string(), z.unknown())),
	fields: z.array(z.object({
		name: z.string(),
		type: z.string(),
	})),
});

// ============================================================================
// Export All Schemas
// ============================================================================

export type GetServerStatusInput = z.infer<typeof GetServerStatusInputSchema>;
export type GetServerStatusOutput = z.infer<typeof GetServerStatusOutputSchema>;

export type GetTransformationInput = z.infer<typeof GetTransformationInputSchema>;
export type GetTransformationOutput = z.infer<typeof GetTransformationOutputSchema>;

export type GetTransformationStatusInput = z.infer<typeof GetTransformationStatusInputSchema>;
export type GetTransformationStatusOutput = z.infer<typeof GetTransformationStatusOutputSchema>;

export type ExecuteTransformationInput = z.infer<typeof ExecuteTransformationInputSchema>;
export type ExecuteTransformationOutput = z.infer<typeof ExecuteTransformationOutputSchema>;

export type GetJobInput = z.infer<typeof GetJobInputSchema>;
export type GetJobOutput = z.infer<typeof GetJobOutputSchema>;

export type GetJobStatusInput = z.infer<typeof GetJobStatusInputSchema>;
export type GetJobStatusOutput = z.infer<typeof GetJobStatusOutputSchema>;

export type ExecuteJobInput = z.infer<typeof ExecuteJobInputSchema>;
export type ExecuteJobOutput = z.infer<typeof ExecuteJobOutputSchema>;

export type ValidateArtifactInput = z.infer<typeof ValidateArtifactInputSchema>;
export type ValidateArtifactOutput = z.infer<typeof ValidateArtifactOutputSchema>;

export type SearchArtifactsInput = z.infer<typeof SearchArtifactsInputSchema>;
export type SearchArtifactsOutput = z.infer<typeof SearchArtifactsOutputSchema>;

export type ListArtifactsInput = z.infer<typeof ListArtifactsInputSchema>;
export type ListArtifactsOutput = z.infer<typeof ListArtifactsOutputSchema>;

export type EditArtifactInput = z.infer<typeof EditArtifactInputSchema>;
export type EditArtifactOutput = z.infer<typeof EditArtifactOutputSchema>;

export type SniffStepInput = z.infer<typeof SniffStepInputSchema>;
export type SniffStepOutput = z.infer<typeof SniffStepOutputSchema>;

// ============================================================================
// Local File Operations (not Carte REST API)
// ============================================================================

/**
 * Save/update a transformation to a file
 * Local-only operation that takes a Transformation object
 */
export const SaveTransformationInputSchema = z.object({
	path: z.string().describe('Path to save the transformation file'),
	transformation: TransformationSchema,
	createBackup: z.boolean().optional().default(true).describe('Create backup before overwriting'),
});

export const SaveTransformationOutputSchema = z.object({
	path: z.string(),
	success: z.boolean(),
	backupPath: z.string().optional(),
	diff: z.string().optional().describe('Unified diff if file was updated'),
	validation: ValidationResultSchema,
});

export type SaveTransformationInput = z.infer<typeof SaveTransformationInputSchema>;
export type SaveTransformationOutput = z.infer<typeof SaveTransformationOutputSchema>;

/**
 * Save/update a job to a file
 * Local-only operation that takes a Job object
 */
export const SaveJobInputSchema = z.object({
	path: z.string().describe('Path to save the job file'),
	job: JobSchema,
	createBackup: z.boolean().optional().default(true).describe('Create backup before overwriting'),
});

export const SaveJobOutputSchema = z.object({
	path: z.string(),
	success: z.boolean(),
	backupPath: z.string().optional(),
	diff: z.string().optional().describe('Unified diff if file was updated'),
	validation: ValidationResultSchema,
});

export type SaveJobInput = z.infer<typeof SaveJobInputSchema>;
export type SaveJobOutput = z.infer<typeof SaveJobOutputSchema>;
