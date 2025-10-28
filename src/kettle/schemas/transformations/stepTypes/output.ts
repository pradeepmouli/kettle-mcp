import { z } from 'zod';
import { StepCategory, type StepType } from './types.js';

/**
 * Configuration schema for TextFileOutput step
 */
const textFileOutputConfigSchema = z.object({
	file: z.object({
		name: z.string().describe('Output file path'),
	}).optional(),
	separator: z.string().optional().describe('Field separator'),
	enclosure: z.string().optional().describe('Field enclosure character'),
	header: z.boolean().optional().describe('Include header row'),
	footer: z.boolean().optional().describe('Include footer'),
	format: z.string().optional().describe('File format'),
	encoding: z.string().optional().describe('File encoding'),
	append: z.boolean().optional().describe('Append to existing file'),
});

/**
 * Configuration schema for TableOutput step
 */
const tableOutputConfigSchema = z.object({
	connection: z.string().describe('Database connection name'),
	schema: z.string().optional().describe('Database schema'),
	table: z.string().describe('Target table name'),
	commitSize: z.number().default(1000).describe('Number of rows per commit'),
	truncateTable: z.boolean().default(false).describe('Truncate table before insert'),
	specifyFields: z.boolean().default(false).describe('Specify field mappings'),
	fields: z.array(z.object({
		streamName: z.string(),
		columnName: z.string(),
	})).optional().describe('Field to column mappings'),
});

/**
 * Configuration schema for JSONOutput step
 */
const jsonOutputConfigSchema = z.object({
	filename: z.string().describe('Output JSON file path'),
	jsonBloc: z.string().default('data').describe('Root element name'),
	encoding: z.string().default('UTF-8').describe('File encoding'),
	outputValue: z.string().optional().describe('Field containing JSON value'),
});

/**
 * Output step types registry
 */
export const OUTPUT_STEPS: Record<string, StepType> = {
	TextFileOutput: {
		typeId: 'TextFileOutput',
		category: StepCategory.OUTPUT,
		displayName: 'Text File Output',
		description: 'Write data to delimited text files in CSV, TSV, or custom formats. Supports header/footer generation, field enclosure, custom separators, encoding selection, and compression. Use for exporting data to flat files, generating reports, or creating data feeds for external systems. Handles file append and split modes.',
		tags: ['file', 'output', 'csv', 'text', 'write', 'batch'],
		configurationSchema: textFileOutputConfigSchema,
	},
	TableOutput: {
		typeId: 'TableOutput',
		category: StepCategory.OUTPUT,
		displayName: 'Table Output',
		description: 'Write data to database tables using INSERT or UPDATE statements. Supports batch commits, field mapping, and table truncation. Handles transaction management and rollback on errors. Use for loading data warehouses, updating operational databases, or persisting transformation results to relational databases.',
		tags: ['database', 'output', 'sql', 'write', 'etl'],
		configurationSchema: tableOutputConfigSchema,
	},
	JSONOutput: {
		typeId: 'JSONOutput',
		category: StepCategory.OUTPUT,
		displayName: 'JSON Output',
		description: 'Write data to JSON files with configurable structure and encoding. Generates well-formed JSON documents from row data. Supports nested structures and arrays. Use for creating API payloads, configuration files, or NoSQL database imports.',
		tags: ['json', 'output', 'file', 'write', 'nosql'],
		configurationSchema: jsonOutputConfigSchema,
	},
};
