/**
 * MCP Server implementation for Kettle-MCP
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema, Tool } from '@modelcontextprotocol/sdk/types.js';
import {
	cleanupTransformation,
	// Execution
	executeJob,
	executeTransformation,
	// Read
	getJob,
	// Status
	getJobStatus,
	// Server status/lifecycle
	getServerStatus,
	getTransformation,
	getTransformationStatus,
	listArtifacts,
	registerJob,
	registerTransformation,
	removeJob,
	removeTransformation,
	// Edit
	saveJob,
	saveTransformation,
	// Search/List
	searchArtifacts,
	startJob,
	startTransformation,
	stopJob,
	stopTransformation,
	// Validate
	validateJobFile,
	validateTransformationFile,
} from './handlers/index.js';
import { listJobEntryTypesTool, listStepTypesTool } from './tools/discovery_tools.js';

/**
 * Available MCP tools for Kettle operations
 */
const KETTLE_TOOLS: Tool[] = [
	{
		name: 'read_kettle_job',
		description: 'Read and parse a Pentaho Kettle job file (.kjb)',
		inputSchema: {
			type: 'object',
			properties: {
				path: { type: 'string', description: 'Path to the Kettle job file (.kjb)' },
			},
			required: ['path'],
		},
	},
	{
		name: 'read_kettle_transformation',
		description: 'Read and parse a Pentaho Kettle transformation file (.ktr)',
		inputSchema: {
			type: 'object',
			properties: {
				path: { type: 'string', description: 'Path to the Kettle transformation file (.ktr)' },
			},
			required: ['path'],
		},
	},
	{
		name: 'get_kettle_job_status',
		description: 'Get job status including structure and validation',
		inputSchema: {
			type: 'object',
			properties: { path: { type: 'string', description: 'Path to the job file (.kjb)' } },
			required: ['path'],
		},
	},
	{
		name: 'get_kettle_transformation_status',
		description: 'Get transformation status including structure and validation',
		inputSchema: {
			type: 'object',
			properties: { path: { type: 'string', description: 'Path to the transformation file (.ktr)' } },
			required: ['path'],
		},
	},
	{
		name: 'validate_kettle_job',
		description: 'Validate a Kettle job file (.kjb)',
		inputSchema: {
			type: 'object',
			properties: { path: { type: 'string' } },
			required: ['path'],
		},
	},
	{
		name: 'validate_kettle_transformation',
		description: 'Validate a Kettle transformation file (.ktr)',
		inputSchema: {
			type: 'object',
			properties: { path: { type: 'string' } },
			required: ['path'],
		},
	},
	{
		name: 'list_kettle_steps',
		description: 'List available Kettle step types for transformations with optional category and tag filtering',
		inputSchema: {
			type: 'object',
			properties: {
				category: {
					type: 'string',
					description: 'Filter by step category (Input, Output, Transform, etc.)',
				},
				tag: {
					type: 'string',
					description: 'Filter by tag (database, csv, json, transform, etc.)',
				},
			},
		},
	},
	{
		name: 'list_kettle_job_entries',
		description: 'List available Kettle job entry types with optional filtering by category or tag',
		inputSchema: {
			type: 'object',
			properties: {
				category: {
					type: 'string',
					description: 'Filter by job entry category (e.g., "General")',
				},
				tag: {
					type: 'string',
					description: 'Filter by tag (e.g., "workflow", "orchestration", "etl")',
				},
			},
		},
	},
	{
		name: 'search_kettle_artifacts',
		description: 'Search for Kettle artifacts (ktr/kjb) in a directory',
		inputSchema: {
			type: 'object',
			properties: {
				query: { type: 'string' },
				type: { type: 'string', enum: ['transformation', 'job', 'all'] },
				directory: { type: 'string' },
				maxResults: { type: 'number' },
			},
			required: ['query'],
		},
	},
	{
		name: 'list_kettle_artifacts',
		description: 'List Kettle artifacts (ktr/kjb) in a directory',
		inputSchema: {
			type: 'object',
			properties: {
				type: { type: 'string', enum: ['transformation', 'job', 'all'] },
				directory: { type: 'string' },
				detailed: { type: 'boolean' },
			},
			required: ['type'],
		},
	},
	{
		name: 'save_kettle_transformation',
		description: 'Save or update a Kettle transformation file (.ktr)',
		inputSchema: {
			type: 'object',
			properties: { path: { type: 'string' }, transformation: { type: 'object' }, createBackup: { type: 'boolean' } },
			required: ['path', 'transformation'],
		},
	},
	{
		name: 'save_kettle_job',
		description: 'Save or update a Kettle job file (.kjb)',
		inputSchema: {
			type: 'object',
			properties: { path: { type: 'string' }, job: { type: 'object' }, createBackup: { type: 'boolean' } },
			required: ['path', 'job'],
		},
	},
	{
		name: 'execute_kettle_transformation',
		description: 'Execute a Kettle transformation (local mode, guarded)',
		inputSchema: { type: 'object', properties: { path: { type: 'string' }, timeoutMs: { type: 'number' } }, required: ['path'] },
	},
	{
		name: 'execute_kettle_job',
		description: 'Execute a Kettle job (local mode, guarded)',
		inputSchema: { type: 'object', properties: { path: { type: 'string' }, timeoutMs: { type: 'number' } }, required: ['path'] },
	},
	{ name: 'start_kettle_transformation', description: 'Start a Kettle transformation', inputSchema: { type: 'object', properties: { path: { type: 'string' }, timeoutMs: { type: 'number' } }, required: ['path'] } },
	{ name: 'stop_kettle_transformation', description: 'Stop a Kettle transformation', inputSchema: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] } },
	{ name: 'start_kettle_job', description: 'Start a Kettle job', inputSchema: { type: 'object', properties: { path: { type: 'string' }, timeoutMs: { type: 'number' } }, required: ['path'] } },
	{ name: 'stop_kettle_job', description: 'Stop a Kettle job', inputSchema: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] } },
	{ name: 'get_server_status', description: 'Get server status and registered artifacts', inputSchema: { type: 'object', properties: {} } },
	{ name: 'register_kettle_transformation', description: 'Register a transformation path', inputSchema: { type: 'object', properties: { filePath: { type: 'string' } }, required: ['filePath'] } },
	{ name: 'register_kettle_job', description: 'Register a job path', inputSchema: { type: 'object', properties: { filePath: { type: 'string' } }, required: ['filePath'] } },
	{ name: 'remove_kettle_transformation', description: 'Remove a registered transformation', inputSchema: { type: 'object', properties: { filePath: { type: 'string' } }, required: ['filePath'] } },
	{ name: 'remove_kettle_job', description: 'Remove a registered job', inputSchema: { type: 'object', properties: { filePath: { type: 'string' } }, required: ['filePath'] } },
	{ name: 'cleanup_kettle_transformation', description: 'Cleanup temp/logs for a transformation', inputSchema: { type: 'object', properties: { filePath: { type: 'string' } }, required: ['filePath'] } },
];

/**
 * Register all Kettle MCP tools with the server
 */
export function registerTools(server: Server): void {
	// List available tools
	server.setRequestHandler(ListToolsRequestSchema, () => ({
		tools: KETTLE_TOOLS,
	}));

	// Handle tool calls
	server.setRequestHandler(CallToolRequestSchema, async (request) => {
		const { name, arguments: args } = request.params;

		switch (name) {
			case 'read_kettle_job':
				try {
					const res = await getJob({ path: (args as { path: string; }).path });
					return { content: [{ type: 'json', json: res }] } as any;
				} catch (err: any) {
					return { content: [{ type: 'json', json: { error: err?.message || String(err) } }] } as any;
				}

			case 'read_kettle_transformation':
				try {
					const res = await getTransformation({ path: (args as { path: string; }).path });
					return { content: [{ type: 'json', json: res }] } as any;
				} catch (err: any) {
					return { content: [{ type: 'json', json: { error: err?.message || String(err) } }] } as any;
				}

			case 'get_kettle_job_status':
				try {
					const res = await getJobStatus({ path: (args as { path: string; }).path });
					return { content: [{ type: 'json', json: res }] } as any;
				} catch (err: any) {
					return { content: [{ type: 'json', json: { error: err?.message || String(err) } }] } as any;
				}

			case 'get_kettle_transformation_status':
				try {
					const res = await getTransformationStatus({ path: (args as { path: string; }).path });
					return { content: [{ type: 'json', json: res }] } as any;
				} catch (err: any) {
					return { content: [{ type: 'json', json: { error: err?.message || String(err) } }] } as any;
				}

			case 'validate_kettle_job':
				try {
					const res = await validateJobFile({ path: (args as { path: string; }).path });
					return { content: [{ type: 'json', json: res }] } as any;
				} catch (err: any) {
					return { content: [{ type: 'json', json: { error: err?.message || String(err) } }] } as any;
				}

			case 'validate_kettle_transformation':
				try {
					const res = await validateTransformationFile({ path: (args as { path: string; }).path });
					return { content: [{ type: 'json', json: res }] } as any;
				} catch (err: any) {
					return { content: [{ type: 'json', json: { error: err?.message || String(err) } }] } as any;
				}

			case 'list_kettle_steps':
				try {
					const category = args?.category as string | undefined;
					const tag = args?.tag as string | undefined;
					const res = await listStepTypesTool(category, tag);
					return { content: [{ type: 'json', json: res }] } as any;
				} catch (err: any) {
					return { content: [{ type: 'json', json: { error: err?.message || String(err) } }] } as any;
				}

			case 'list_kettle_job_entries':
				try {
					const category = args?.category as string | undefined;
					const tag = args?.tag as string | undefined;
					const res = await listJobEntryTypesTool(category, tag);
					return { content: [{ type: 'json', json: res }] } as any;
				} catch (err: any) {
					return { content: [{ type: 'json', json: { error: err?.message || String(err) } }] } as any;
				}

			case 'search_kettle_artifacts':
				try {
					const res = await searchArtifacts(args as any);
					return { content: [{ type: 'json', json: res }] } as any;
				} catch (err: any) {
					return { content: [{ type: 'json', json: { error: err?.message || String(err) } }] } as any;
				}

			case 'list_kettle_artifacts':
				try {
					const res = await listArtifacts(args as any);
					return { content: [{ type: 'json', json: res }] } as any;
				} catch (err: any) {
					return { content: [{ type: 'json', json: { error: err?.message || String(err) } }] } as any;
				}

			case 'save_kettle_transformation':
				try {
					const res = await saveTransformation(args as any);
					return { content: [{ type: 'json', json: res }] } as any;
				} catch (err: any) {
					return { content: [{ type: 'json', json: { error: err?.message || String(err) } }] } as any;
				}

			case 'save_kettle_job':
				try {
					const res = await saveJob(args as any);
					return { content: [{ type: 'json', json: res }] } as any;
				} catch (err: any) {
					return { content: [{ type: 'json', json: { error: err?.message || String(err) } }] } as any;
				}

			case 'execute_kettle_transformation':
				try {
					const res = await executeTransformation(args as any);
					return { content: [{ type: 'json', json: res }] } as any;
				} catch (err: any) {
					return { content: [{ type: 'json', json: { error: err?.message || String(err) } }] } as any;
				}

			case 'execute_kettle_job':
				try {
					const res = await executeJob(args as any);
					return { content: [{ type: 'json', json: res }] } as any;
				} catch (err: any) {
					return { content: [{ type: 'json', json: { error: err?.message || String(err) } }] } as any;
				}

			case 'start_kettle_transformation':
				try {
					const res = await startTransformation(args as any);
					return { content: [{ type: 'json', json: res }] } as any;
				} catch (err: any) {
					return { content: [{ type: 'json', json: { error: err?.message || String(err) } }] } as any;
				}

			case 'stop_kettle_transformation':
				try {
					const res = await stopTransformation(args as any);
					return { content: [{ type: 'json', json: res }] } as any;
				} catch (err: any) {
					return { content: [{ type: 'json', json: { error: err?.message || String(err) } }] } as any;
				}

			case 'start_kettle_job':
				try {
					const res = await startJob(args as any);
					return { content: [{ type: 'json', json: res }] } as any;
				} catch (err: any) {
					return { content: [{ type: 'json', json: { error: err?.message || String(err) } }] } as any;
				}

			case 'stop_kettle_job':
				try {
					const res = await stopJob(args as any);
					return { content: [{ type: 'json', json: res }] } as any;
				} catch (err: any) {
					return { content: [{ type: 'json', json: { error: err?.message || String(err) } }] } as any;
				}

			case 'get_server_status':
				try {
					const res = await Promise.resolve(getServerStatus());
					return { content: [{ type: 'json', json: res }] } as any;
				} catch (err: any) {
					return { content: [{ type: 'json', json: { error: err?.message || String(err) } }] } as any;
				}

			case 'register_kettle_transformation':
				try {
					const res = await Promise.resolve(registerTransformation(args as any));
					return { content: [{ type: 'json', json: res }] } as any;
				} catch (err: any) {
					return { content: [{ type: 'json', json: { error: err?.message || String(err) } }] } as any;
				}

			case 'register_kettle_job':
				try {
					const res = await Promise.resolve(registerJob(args as any));
					return { content: [{ type: 'json', json: res }] } as any;
				} catch (err: any) {
					return { content: [{ type: 'json', json: { error: err?.message || String(err) } }] } as any;
				}

			case 'remove_kettle_transformation':
				try {
					const res = await Promise.resolve(removeTransformation(args as any));
					return { content: [{ type: 'json', json: res }] } as any;
				} catch (err: any) {
					return { content: [{ type: 'json', json: { error: err?.message || String(err) } }] } as any;
				}

			case 'remove_kettle_job':
				try {
					const res = await Promise.resolve(removeJob(args as any));
					return { content: [{ type: 'json', json: res }] } as any;
				} catch (err: any) {
					return { content: [{ type: 'json', json: { error: err?.message || String(err) } }] } as any;
				}

			case 'cleanup_kettle_transformation':
				try {
					const res = await Promise.resolve(cleanupTransformation(args as any));
					return { content: [{ type: 'json', json: res }] } as any;
				} catch (err: any) {
					return { content: [{ type: 'json', json: { error: err?.message || String(err) } }] } as any;
				}

			default:
				throw new Error(`Unknown tool: ${name}`);
		}
	});
}
