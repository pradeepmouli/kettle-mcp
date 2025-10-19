/**
 * Zod schemas for Kettle artifact JSON representations
 *
 * These schemas validate the JSON representation of .ktr (transformation)
 * and .kjb (job) files, ensuring type safety and runtime validation.
 */

import { z } from 'zod';

// ============================================================================
// Common Types
// ============================================================================

export const KettleEnabledSchema = z.enum(['Y', 'N']);

export const KettleCoordinatesSchema = z.object({
	xloc: z.number().optional(),
	yloc: z.number().optional(),
});

export const KettleNotepadSchema = z.object({
	note: z.string(),
	xloc: z.number().optional(),
	yloc: z.number().optional(),
	width: z.number().optional(),
	height: z.number().optional(),
	fontname: z.string().optional(),
	fontsize: z.number().optional(),
	fontbold: KettleEnabledSchema.optional(),
	fontitalic: KettleEnabledSchema.optional(),
	fontcolorred: z.number().optional(),
	fontcolorgreen: z.number().optional(),
	fontcolorblue: z.number().optional(),
	backgroundcolorred: z.number().optional(),
	backgroundcolorgreen: z.number().optional(),
	backgroundcolorblue: z.number().optional(),
	bordercolorred: z.number().optional(),
	bordercolorgreen: z.number().optional(),
	bordercolorblue: z.number().optional(),
});

export const KettleParameterSchema = z.object({
	name: z.string(),
	default_value: z.string().optional(),
	description: z.string().optional(),
});

export const KettleAttributesSchema = z.record(z.string(), z.unknown()).optional();

// ============================================================================
// Transformation (*.ktr) Types
// ============================================================================

export const TransformationHopSchema = z.object({
	from: z.string(),
	to: z.string(),
	enabled: KettleEnabledSchema,
});

export const TransformationStepFieldSchema = z.object({
	name: z.string(),
	type: z.string().optional(),
	format: z.string().optional(),
	currency: z.string().optional(),
	decimal: z.string().optional(),
	group: z.string().optional(),
	nullif: z.string().optional(),
	length: z.number().optional(),
	precision: z.number().optional(),
	set_empty_string: KettleEnabledSchema.optional(),
	trim_type: z.string().optional(),
});

export const TransformationStepSchema = z.object({
	name: z.string(),
	type: z.string(),
	description: z.string().optional(),
	distribute: KettleEnabledSchema.optional(),
	custom_distribution: z.string().optional(),
	copies: z.number().optional(),
	partitioning: z.object({
		method: z.string().optional(),
		schema_name: z.string().optional(),
	}).optional(),
	// Step-specific fields (dynamic, preserved as-is)
	fields: z.array(TransformationStepFieldSchema).optional(),
	limit: z.number().optional(),
	// GUI coordinates
	GUI: KettleCoordinatesSchema.optional(),
	// Preserve unknown fields for round-trip safety
	attributes: KettleAttributesSchema,
}).passthrough(); // Allow additional fields

export const TransformationInfoSchema = z.object({
	name: z.string(),
	description: z.string().optional(),
	extended_description: z.string().optional(),
	trans_version: z.string().optional(),
	trans_type: z.string().optional(),
	directory: z.string().optional(),
	parameters: z.array(KettleParameterSchema).optional(),
	created_user: z.string().optional(),
	created_date: z.string().optional(),
	modified_user: z.string().optional(),
	modified_date: z.string().optional(),
	size_rowset: z.number().optional(),
	sleep_time_empty: z.number().optional(),
	sleep_time_full: z.number().optional(),
	unique_connections: KettleEnabledSchema.optional(),
	feedback_shown: KettleEnabledSchema.optional(),
	feedback_size: z.number().optional(),
	using_thread_priorities: KettleEnabledSchema.optional(),
	shared_objects_file: z.string().optional(),
	capture_step_performance: KettleEnabledSchema.optional(),
	step_performance_capturing_delay: z.number().optional(),
	step_performance_capturing_size_limit: z.number().optional(),
	// Preserve log, maxdate, dependencies, etc. as passthrough
	attributes: KettleAttributesSchema,
}).passthrough();

export const TransformationSchema = z.object({
	info: TransformationInfoSchema,
	notepads: z.array(KettleNotepadSchema).optional(),
	order: z.array(TransformationHopSchema),
	steps: z.array(TransformationStepSchema),
	step_error_handling: z.unknown().optional(),
	slave_transformation: KettleEnabledSchema.optional(),
	attributes: KettleAttributesSchema,
});

export type Transformation = z.infer<typeof TransformationSchema>;
export type TransformationStep = z.infer<typeof TransformationStepSchema>;
export type TransformationHop = z.infer<typeof TransformationHopSchema>;

// ============================================================================
// Job (*.kjb) Types
// ============================================================================

export const JobHopSchema = z.object({
	from: z.string(),
	to: z.string(),
	from_nr: z.number().optional(),
	to_nr: z.number().optional(),
	enabled: KettleEnabledSchema,
	evaluation: KettleEnabledSchema.optional(),
	unconditional: KettleEnabledSchema.optional(),
});

export const JobEntrySchema = z.object({
	name: z.string(),
	type: z.string(),
	description: z.string().optional(),
	start: KettleEnabledSchema.optional(),
	dummy: KettleEnabledSchema.optional(),
	repeat: KettleEnabledSchema.optional(),
	schedulerType: z.number().optional(),
	intervalSeconds: z.number().optional(),
	intervalMinutes: z.number().optional(),
	hour: z.number().optional(),
	minutes: z.number().optional(),
	weekDay: z.number().optional(),
	DayOfMonth: z.number().optional(),
	parallel: KettleEnabledSchema.optional(),
	draw: KettleEnabledSchema.optional(),
	nr: z.number().optional(),
	xloc: z.number().optional(),
	yloc: z.number().optional(),
	// Entry-specific fields (dynamic, preserved as-is)
	logmessage: z.string().optional(),
	loglevel: z.string().optional(),
	logsubject: z.string().optional(),
	filename: z.string().optional(),
	// Preserve unknown fields for round-trip safety
	attributes: KettleAttributesSchema,
}).passthrough(); // Allow additional fields

export const JobSchema = z.object({
	name: z.string(),
	description: z.string().optional(),
	extended_description: z.string().optional(),
	job_version: z.string().optional(),
	job_status: z.number().optional(),
	directory: z.string().optional(),
	created_user: z.string().optional(),
	created_date: z.string().optional(),
	modified_user: z.string().optional(),
	modified_date: z.string().optional(),
	parameters: z.array(KettleParameterSchema).optional(),
	entries: z.array(JobEntrySchema),
	hops: z.array(JobHopSchema),
	notepads: z.array(KettleNotepadSchema).optional(),
	// Preserve log tables, channels, etc. as passthrough
	attributes: KettleAttributesSchema,
}).passthrough();

export type Job = z.infer<typeof JobSchema>;
export type JobEntry = z.infer<typeof JobEntrySchema>;
export type JobHop = z.infer<typeof JobHopSchema>;

// ============================================================================
// Validation & Search Types
// ============================================================================

export const ValidationIssueSchema = z.object({
	severity: z.enum(['error', 'warning', 'info']),
	code: z.string(),
	message: z.string(),
	element: z.string().optional(), // step/entry name
	line: z.number().optional(),
	suggestion: z.string().optional(),
});

export const ValidationResultSchema = z.object({
	valid: z.boolean(),
	issues: z.array(ValidationIssueSchema),
	summary: z.object({
		errors: z.number(),
		warnings: z.number(),
		info: z.number(),
	}),
});

export type ValidationResult = z.infer<typeof ValidationResultSchema>;
export type ValidationIssue = z.infer<typeof ValidationIssueSchema>;

export const SearchIndexEntrySchema = z.object({
	path: z.string(),
	type: z.enum(['transformation', 'job']),
	name: z.string(),
	description: z.string().optional(),
	steps: z.array(z.string()).optional(), // step names
	entries: z.array(z.string()).optional(), // entry names
	stepTypes: z.array(z.string()).optional(), // unique step types
	entryTypes: z.array(z.string()).optional(), // unique entry types
	parameters: z.array(z.string()).optional(), // parameter names
	modified_date: z.string().optional(),
});

export type SearchIndexEntry = z.infer<typeof SearchIndexEntrySchema>;

// ============================================================================
// Execution Types
// ============================================================================

export const ExecutionStatusSchema = z.enum([
	'waiting',
	'running',
	'finished',
	'stopped',
	'error',
]);

export const ExecutionResultSchema = z.object({
	status: ExecutionStatusSchema,
	exitCode: z.number(),
	stdout: z.string(),
	stderr: z.string(),
	duration: z.number(), // milliseconds
	startTime: z.string().optional(),
	endTime: z.string().optional(),
	errors: z.array(z.string()).optional(),
});

export type ExecutionResult = z.infer<typeof ExecutionResultSchema>;
export type ExecutionStatus = z.infer<typeof ExecutionStatusSchema>;
