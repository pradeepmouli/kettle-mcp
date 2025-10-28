import { z } from 'zod';

/**
 * Job entry type categories in Pentaho Kettle
 */
export enum JobEntryCategory {
	GENERAL = 'General',
	FILE_MANAGEMENT = 'File Management',
	MAIL = 'Mail',
	FILE_TRANSFER = 'File Transfer',
	CONDITIONS = 'Conditions',
	SCRIPTING = 'Scripting',
	BULK_LOADING = 'Bulk Loading',
	XML = 'XML',
}

/**
 * Configuration example for job entry types
 */
export interface ConfigurationExample {
	name: string;
	description: string;
	configuration: Record<string, any>;
}

/**
 * Job entry type metadata
 */
export interface JobEntryType {
	typeId: string;
	category: JobEntryCategory;
	displayName: string;
	description: string;
	tags: string[];
	configurationSchema: z.ZodObject<any>;
	examples?: ConfigurationExample[];
}
