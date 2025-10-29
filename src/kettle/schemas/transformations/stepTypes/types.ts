import { z } from 'zod';

/**
 * Step type categories in Pentaho Kettle
 */
export enum StepCategory {
	INPUT = 'Input',
	OUTPUT = 'Output',
	TRANSFORM = 'Transform',
	UTILITY = 'Utility',
	FLOW = 'Flow',
	SCRIPTING = 'Scripting',
	LOOKUP = 'Lookup',
	JOIN = 'Join',
	VALIDATION = 'Validation',
	BIGDATA = 'BigData',
	STATISTICS = 'Statistics',
}

/**
 * Configuration example for step types
 */
export interface ConfigurationExample {
	name: string;
	description: string;
	configuration: Record<string, any>;
}

/**
 * Step type metadata
 */
export interface StepType {
	typeId: string;
	category: StepCategory;
	displayName: string;
	description: string;
	tags: string[];
	configurationSchema: z.ZodObject<any>;
	examples?: ConfigurationExample[];
}

/**
 * Reusable schema patterns
 * These helpers provide consistent validation across step type definitions
 */

/**
 * Database connection reference schema
 * Use for any step that requires a reference to a configured DB connection
 */
export const dbConnectionRefSchema = z
	.string()
	.min(1)
	.describe('Database connection name');

/**
 * File path schema (can be a filesystem path or URL)
 * Supports variable substitution patterns used in Kettle (${VAR_NAME})
 */
export const filePathSchema = z
	.string()
	.min(1)
	.describe('Path to file or URL (supports variables like ${VAR})');

/**
 * Field mapping schema
 * Commonly used to map source field names to target field names
 */
export const fieldMappingSchema = z
	.array(
		z.object({
			from: z.string().min(1).describe('Source field name'),
			to: z.string().min(1).describe('Target field name'),
			type: z
				.enum(['String', 'Integer', 'Number', 'Date', 'Boolean'])
				.optional()
				.describe('Optional explicit target type'),
		})
	)
	.min(1)
	.describe('Field mappings from source to target');
