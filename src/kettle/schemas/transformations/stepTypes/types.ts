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
