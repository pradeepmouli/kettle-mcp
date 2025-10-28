import { z } from 'zod';
import { JobEntryCategory, type JobEntryType } from './types.js';

/**
 * START job entry (no configuration needed)
 */
const startConfigSchema = z.object({});

/**
 * TRANS (Execute transformation) job entry
 */
const transConfigSchema = z.object({
	filename: z.string().describe('Path to transformation file (.ktr)'),
	runConfiguration: z.string().optional().describe('Run configuration name'),
	logLevel: z.enum(['Basic', 'Detailed', 'Debug', 'Rowlevel', 'Error', 'Nothing']).optional(),
});

/**
 * WRITE_TO_LOG job entry
 */
const writeToLogConfigSchema = z.object({
	logmessage: z.string().describe('Message to write to log'),
	loglevel: z.enum(['Basic', 'Detailed', 'Debug', 'Rowlevel', 'Error']).default('Basic'),
});

/**
 * General job entry types registry
 */
export const GENERAL_JOB_ENTRIES: Record<string, JobEntryType> = {
	START: {
		typeId: 'START',
		category: JobEntryCategory.GENERAL,
		displayName: 'Start',
		description: 'Define the start point of a job workflow. Every job must begin with a START entry. This entry marks the execution entry point and has no configuration. Use as the first entry in any job to establish the workflow beginning.',
		tags: ['start', 'entry', 'workflow', 'orchestration'],
		configurationSchema: startConfigSchema,
		examples: [
			{
				name: 'Job Entry Point',
				description: 'Standard start entry for a job',
				configuration: {},
			},
		],
	},
	TRANS: {
		typeId: 'TRANS',
		category: JobEntryCategory.GENERAL,
		displayName: 'Transformation',
		description: 'Execute a Pentaho Kettle transformation (.ktr file) as part of a job workflow. Allows orchestration of ETL processes, passing parameters, and controlling execution with run configurations. Use for integrating data transformations into job workflows and building complex ETL pipelines with multiple transformation steps.',
		tags: ['transformation', 'execute', 'workflow', 'orchestration', 'etl', 'nested'],
		configurationSchema: transConfigSchema,
		examples: [
			{
				name: 'Execute ETL Transformation',
				description: 'Run a customer data transformation within a job',
				configuration: {
					filename: '/transformations/customer_etl.ktr',
					runConfiguration: 'Production',
					logLevel: 'Basic',
				},
			},
			{
				name: 'Debug Transformation',
				description: 'Execute transformation with detailed logging for troubleshooting',
				configuration: {
					filename: '/transformations/data_quality_check.ktr',
					logLevel: 'Debug',
				},
			},
		],
	},
	WRITE_TO_LOG: {
		typeId: 'WRITE_TO_LOG',
		category: JobEntryCategory.GENERAL,
		displayName: 'Write to Log',
		description: 'Write a custom message to the job execution log with specified log level. Supports variable substitution for dynamic messages. Use for debugging, audit trails, checkpoints, and monitoring job execution progress. Essential for production job monitoring and troubleshooting.',
		tags: ['log', 'debug', 'workflow', 'monitoring'],
		configurationSchema: writeToLogConfigSchema,
		examples: [
			{
				name: 'Job Checkpoint',
				description: 'Log job progress at key checkpoints',
				configuration: {
					logmessage: 'Starting customer data processing for ${DATE}',
					loglevel: 'Basic',
				},
			},
			{
				name: 'Debug Information',
				description: 'Log detailed debug information during development',
				configuration: {
					logmessage: 'Variable values: customer_count=${CUSTOMER_COUNT}, errors=${ERROR_COUNT}',
					loglevel: 'Debug',
				},
			},
		],
	},
};
