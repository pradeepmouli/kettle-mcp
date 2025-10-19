/**
 * MCP Tool definitions for Kettle server
 *
 * Defines all tools exposed by the Kettle MCP server, mapped from Carte REST API.
 * Each tool includes Zod schema validation for inputs and outputs.
 */

import { z } from 'zod';
import {
	AddJobInputSchema,
	AddJobOutputSchema,
	AddTransformationInputSchema,
	AddTransformationOutputSchema,
	CleanupTransformationInputSchema,
	CleanupTransformationOutputSchema,
	// Edit
	EditArtifactInputSchema,
	EditArtifactOutputSchema,
	ExecuteJobInputSchema,
	ExecuteJobOutputSchema,
	ExecuteTransformationInputSchema,
	ExecuteTransformationOutputSchema,
	// Job Management
	GetJobInputSchema,
	GetJobOutputSchema,
	GetJobStatusInputSchema,
	GetJobStatusOutputSchema,
	// Utility
	GetPropertiesInputSchema,
	GetPropertiesOutputSchema,
	// Server Management
	GetServerStatusInputSchema,
	GetServerStatusOutputSchema,
	// Transformation Management
	GetTransformationInputSchema,
	GetTransformationOutputSchema,
	GetTransformationStatusInputSchema,
	GetTransformationStatusOutputSchema,
	ListArtifactsInputSchema,
	ListArtifactsOutputSchema,
	PauseTransformationInputSchema,
	PauseTransformationOutputSchema,
	RegisterJobInputSchema,
	RegisterJobOutputSchema,
	RegisterTransformationInputSchema,
	RegisterTransformationOutputSchema,
	RemoveJobInputSchema,
	RemoveJobOutputSchema,
	RemoveTransformationInputSchema,
	RemoveTransformationOutputSchema,
	SearchArtifactsInputSchema,
	SearchArtifactsOutputSchema,
	SniffStepInputSchema,
	SniffStepOutputSchema,
	StartJobInputSchema,
	StartJobOutputSchema,
	StartTransformationInputSchema,
	StartTransformationOutputSchema,
	StopJobInputSchema,
	StopJobOutputSchema,
	StopTransformationInputSchema,
	StopTransformationOutputSchema,
	// Validation & Search
	ValidateArtifactInputSchema,
	ValidateArtifactOutputSchema,
} from '../schemas/index.js';

// ============================================================================
// Tool Definition Interface
// ============================================================================

export interface KettleToolDefinition<TInput = unknown, TOutput = unknown> {
	name: string;
	description: string;
	inputSchema: z.ZodType<TInput>;
	outputSchema: z.ZodType<TOutput>;
	carteEndpoint?: string; // Mapped Carte REST endpoint
	localOnly?: boolean; // Local-only tool (not in Carte)
	requiresOptIn?: boolean; // Requires explicit opt-in (e.g., execution)
}

// ============================================================================
// Server Management Tools
// ============================================================================

export const getServerStatusTool: KettleToolDefinition = {
	name: 'kettle_getServerStatus',
	description: 'Get server status including workspace summary, running jobs/transformations, and system info',
	inputSchema: GetServerStatusInputSchema,
	outputSchema: GetServerStatusOutputSchema,
	carteEndpoint: 'GET /kettle/status',
};

// ============================================================================
// Transformation Management Tools
// ============================================================================

export const getTransformationTool: KettleToolDefinition = {
	name: 'kettle_getTransformation',
	description: 'Read and parse a transformation (.ktr) file',
	inputSchema: GetTransformationInputSchema,
	outputSchema: GetTransformationOutputSchema,
	localOnly: true,
};

export const getTransformationStatusTool: KettleToolDefinition = {
	name: 'kettle_getTransformationStatus',
	description: 'Get transformation status including structure, validation, and execution state',
	inputSchema: GetTransformationStatusInputSchema,
	outputSchema: GetTransformationStatusOutputSchema,
	carteEndpoint: 'GET /kettle/transStatus',
};

export const addTransformationTool: KettleToolDefinition = {
	name: 'kettle_addTransformation',
	description: 'Add a transformation from XML content',
	inputSchema: AddTransformationInputSchema,
	outputSchema: AddTransformationOutputSchema,
	carteEndpoint: 'POST /kettle/addTrans',
};

export const registerTransformationTool: KettleToolDefinition = {
	name: 'kettle_registerTransformation',
	description: 'Register a transformation from filesystem',
	inputSchema: RegisterTransformationInputSchema,
	outputSchema: RegisterTransformationOutputSchema,
	carteEndpoint: 'GET /kettle/registerTrans',
};

export const executeTransformationTool: KettleToolDefinition = {
	name: 'kettle_executeTransformation',
	description: 'Execute a transformation (local-only, opt-in required)',
	inputSchema: ExecuteTransformationInputSchema,
	outputSchema: ExecuteTransformationOutputSchema,
	carteEndpoint: 'GET /kettle/executeTrans',
	requiresOptIn: true,
};

export const startTransformationTool: KettleToolDefinition = {
	name: 'kettle_startTransformation',
	description: 'Start transformation execution',
	inputSchema: StartTransformationInputSchema,
	outputSchema: StartTransformationOutputSchema,
	carteEndpoint: 'GET /kettle/startTrans',
	requiresOptIn: true,
};

export const stopTransformationTool: KettleToolDefinition = {
	name: 'kettle_stopTransformation',
	description: 'Stop transformation execution',
	inputSchema: StopTransformationInputSchema,
	outputSchema: StopTransformationOutputSchema,
	carteEndpoint: 'GET /kettle/stopTrans',
};

export const pauseTransformationTool: KettleToolDefinition = {
	name: 'kettle_pauseTransformation',
	description: 'Pause transformation execution (Carte-only, not supported locally)',
	inputSchema: PauseTransformationInputSchema,
	outputSchema: PauseTransformationOutputSchema,
	carteEndpoint: 'GET /kettle/pauseTrans',
	localOnly: false,
};

export const removeTransformationTool: KettleToolDefinition = {
	name: 'kettle_removeTransformation',
	description: 'Remove a transformation from the server or delete from filesystem',
	inputSchema: RemoveTransformationInputSchema,
	outputSchema: RemoveTransformationOutputSchema,
	carteEndpoint: 'GET /kettle/removeTrans',
};

export const cleanupTransformationTool: KettleToolDefinition = {
	name: 'kettle_cleanupTransformation',
	description: 'Cleanup transformation resources',
	inputSchema: CleanupTransformationInputSchema,
	outputSchema: CleanupTransformationOutputSchema,
	carteEndpoint: 'GET /kettle/cleanupTrans',
};

// ============================================================================
// Job Management Tools
// ============================================================================

export const getJobTool: KettleToolDefinition = {
	name: 'kettle_getJob',
	description: 'Read and parse a job (.kjb) file',
	inputSchema: GetJobInputSchema,
	outputSchema: GetJobOutputSchema,
	localOnly: true,
};

export const getJobStatusTool: KettleToolDefinition = {
	name: 'kettle_getJobStatus',
	description: 'Get job status including structure, validation, and execution state',
	inputSchema: GetJobStatusInputSchema,
	outputSchema: GetJobStatusOutputSchema,
	carteEndpoint: 'GET /kettle/jobStatus',
};

export const addJobTool: KettleToolDefinition = {
	name: 'kettle_addJob',
	description: 'Add a job from XML content',
	inputSchema: AddJobInputSchema,
	outputSchema: AddJobOutputSchema,
	carteEndpoint: 'POST /kettle/addJob',
};

export const registerJobTool: KettleToolDefinition = {
	name: 'kettle_registerJob',
	description: 'Register a job from filesystem',
	inputSchema: RegisterJobInputSchema,
	outputSchema: RegisterJobOutputSchema,
	carteEndpoint: 'GET /kettle/registerJob',
};

export const executeJobTool: KettleToolDefinition = {
	name: 'kettle_executeJob',
	description: 'Execute a job (local-only, opt-in required)',
	inputSchema: ExecuteJobInputSchema,
	outputSchema: ExecuteJobOutputSchema,
	carteEndpoint: 'GET /kettle/executeJob',
	requiresOptIn: true,
};

export const startJobTool: KettleToolDefinition = {
	name: 'kettle_startJob',
	description: 'Start job execution',
	inputSchema: StartJobInputSchema,
	outputSchema: StartJobOutputSchema,
	carteEndpoint: 'GET /kettle/startJob',
	requiresOptIn: true,
};

export const stopJobTool: KettleToolDefinition = {
	name: 'kettle_stopJob',
	description: 'Stop job execution',
	inputSchema: StopJobInputSchema,
	outputSchema: StopJobOutputSchema,
	carteEndpoint: 'GET /kettle/stopJob',
};

export const removeJobTool: KettleToolDefinition = {
	name: 'kettle_removeJob',
	description: 'Remove a job from the server or delete from filesystem',
	inputSchema: RemoveJobInputSchema,
	outputSchema: RemoveJobOutputSchema,
	carteEndpoint: 'GET /kettle/removeJob',
};

// ============================================================================
// Validation & Search Tools
// ============================================================================

export const validateArtifactTool: KettleToolDefinition = {
	name: 'kettle_validateArtifact',
	description: 'Validate a transformation or job for structural issues',
	inputSchema: ValidateArtifactInputSchema,
	outputSchema: ValidateArtifactOutputSchema,
	localOnly: true,
};

export const searchArtifactsTool: KettleToolDefinition = {
	name: 'kettle_searchArtifacts',
	description: 'Search for transformations and jobs by name, step type, parameter, etc.',
	inputSchema: SearchArtifactsInputSchema,
	outputSchema: SearchArtifactsOutputSchema,
	localOnly: true,
};

export const listTransformationsTool: KettleToolDefinition = {
	name: 'kettle_listTransformations',
	description: 'List all transformations in the workspace',
	inputSchema: ListArtifactsInputSchema,
	outputSchema: ListArtifactsOutputSchema,
	carteEndpoint: 'GET /carte/transformations',
};

export const listJobsTool: KettleToolDefinition = {
	name: 'kettle_listJobs',
	description: 'List all jobs in the workspace',
	inputSchema: ListArtifactsInputSchema,
	outputSchema: ListArtifactsOutputSchema,
	localOnly: true,
};

// ============================================================================
// Edit Tools
// ============================================================================

export const editArtifactTool: KettleToolDefinition = {
	name: 'kettle_editArtifact',
	description: 'Edit a transformation or job (add/update/delete steps, entries, hops, parameters)',
	inputSchema: EditArtifactInputSchema,
	outputSchema: EditArtifactOutputSchema,
	localOnly: true,
};

// ============================================================================
// Utility Tools
// ============================================================================

export const getPropertiesTool: KettleToolDefinition = {
	name: 'kettle_getProperties',
	description: 'Get server configuration properties',
	inputSchema: GetPropertiesInputSchema,
	outputSchema: GetPropertiesOutputSchema,
	carteEndpoint: 'GET /kettle/properties',
};

export const sniffStepTool: KettleToolDefinition = {
	name: 'kettle_sniffStep',
	description: 'Sniff data output from a transformation step (preview)',
	inputSchema: SniffStepInputSchema,
	outputSchema: SniffStepOutputSchema,
	carteEndpoint: 'GET /kettle/sniffStep',
};

// ============================================================================
// Tool Registry
// ============================================================================

export const ALL_TOOLS: KettleToolDefinition[] = [
	// Server Management
	getServerStatusTool,
	// Transformation Management
	getTransformationTool,
	getTransformationStatusTool,
	addTransformationTool,
	registerTransformationTool,
	executeTransformationTool,
	startTransformationTool,
	stopTransformationTool,
	pauseTransformationTool,
	removeTransformationTool,
	cleanupTransformationTool,
	// Job Management
	getJobTool,
	getJobStatusTool,
	addJobTool,
	registerJobTool,
	executeJobTool,
	startJobTool,
	stopJobTool,
	removeJobTool,
	// Validation & Search
	validateArtifactTool,
	searchArtifactsTool,
	listTransformationsTool,
	listJobsTool,
	// Edit
	editArtifactTool,
	// Utility
	getPropertiesTool,
	sniffStepTool,
];

export const TOOLS_BY_NAME = new Map(
	ALL_TOOLS.map((tool) => [tool.name, tool])
);
