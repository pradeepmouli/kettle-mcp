import {
	getJobEntryTypeSchema,
	JobEntryCategory,
	listJobEntryTypes,
} from '../kettle/schemas/jobs/entryTypes/index.js';
import { getStepTypeSchema, listStepTypes, StepCategory } from '../kettle/schemas/transformations/stepTypes/index.js';
import { serializeZodSchema } from '../utils/schema-serializer.js';

/**
 * List all available step types with optional category and tag filters.
 * 
 * This tool enables LLM agents to discover appropriate transformation step types
 * based on natural language intents. Use category filtering to narrow by broad
 * classification (Input, Output, Transform) and tag filtering to find steps
 * matching specific use cases (e.g., "database", "csv", "filter").
 * 
 * @param categoryFilter - Optional category to filter by (e.g., "Input", "Output", "Transform")
 * @param tagFilter - Optional tag to filter by (e.g., "database", "csv", "rest-api")
 * @returns Array of step type metadata including typeId, category, displayName, description, and tags
 * 
 * @example
 * // Get all step types
 * const allSteps = await listStepTypesTool();
 * 
 * @example
 * // Get only input step types
 * const inputSteps = await listStepTypesTool('Input');
 * 
 * @example
 * // Find all steps that work with databases
 * const dbSteps = await listStepTypesTool(undefined, 'database');
 */
export async function listStepTypesTool(categoryFilter?: string, tagFilter?: string): Promise<any[]> {
	const category = categoryFilter ? (categoryFilter as StepCategory) : undefined;
	let stepTypes = listStepTypes(category);

	// Apply tag filter if provided
	if (tagFilter) {
		stepTypes = stepTypes.filter((type) => type.tags.includes(tagFilter));
	}

	return stepTypes.map((type) => ({
		typeId: type.typeId,
		category: type.category,
		displayName: type.displayName,
		description: type.description,
		tags: type.tags,
	}));
}

/**
 * Get detailed configuration schema for a specific step type.
 * 
 * This tool provides LLM agents with the information needed to generate valid
 * configurations for a step type. Returns the serialized Zod schema with field
 * definitions, types, required flags, descriptions, and example configurations.
 * 
 * Use this after discovering a step type with listStepTypesTool to understand
 * what configuration fields are needed and see example usage patterns.
 * 
 * @param typeId - The step type identifier (e.g., "TableInput", "TextFileOutput")
 * @returns Object containing typeId, category, displayName, description, tags,
 *          serialized schema with field metadata, and example configurations
 * @throws Error if the step type does not exist
 * 
 * @example
 * // Get schema for TableInput step
 * const schema = await getStepTypeSchematool('TableInput');
 * // Returns: { typeId, category, displayName, description, tags, schema: { fields: [...] }, examples: [...] }
 * 
 * @example
 * // Use schema to generate configuration
 * const schema = await getStepTypeSchematool('TableInput');
 * const requiredFields = schema.schema.fields.filter(f => f.required);
 * // Use requiredFields and examples to build configuration
 */
export async function getStepTypeSchematool(typeId: string): Promise<any> {
	const stepType = getStepTypeSchema(typeId);
	if (!stepType) {
		throw new Error(`Unknown step type: ${typeId}`);
	}

	return {
		typeId: stepType.typeId,
		category: stepType.category,
		displayName: stepType.displayName,
		description: stepType.description,
		tags: stepType.tags,
		schema: serializeZodSchema(stepType.configurationSchema),
		examples: stepType.examples,
	};
}

/**
 * List all available job entry types with optional category and tag filters.
 * 
 * This tool enables LLM agents to discover appropriate job entry types for
 * orchestrating workflows. Use category filtering to narrow by classification
 * and tag filtering to find entries matching specific workflow patterns
 * (e.g., "workflow", "orchestration", "etl").
 * 
 * @param categoryFilter - Optional category to filter by (e.g., "General")
 * @param tagFilter - Optional tag to filter by (e.g., "workflow", "orchestration", "nested")
 * @returns Array of job entry type metadata including typeId, category, displayName, description, and tags
 * 
 * @example
 * // Get all job entry types
 * const allEntries = await listJobEntryTypesTool();
 * 
 * @example
 * // Get only general job entries
 * const generalEntries = await listJobEntryTypesTool('General');
 * 
 * @example
 * // Find all entries related to workflow orchestration
 * const workflowEntries = await listJobEntryTypesTool(undefined, 'orchestration');
 */
export async function listJobEntryTypesTool(categoryFilter?: string, tagFilter?: string): Promise<any[]> {
	const category = categoryFilter ? (categoryFilter as JobEntryCategory) : undefined;
	let entryTypes = listJobEntryTypes(category);

	// Apply tag filter if provided
	if (tagFilter) {
		entryTypes = entryTypes.filter((type) => type.tags.includes(tagFilter));
	}

	return entryTypes.map((type) => ({
		typeId: type.typeId,
		category: type.category,
		displayName: type.displayName,
		description: type.description,
		tags: type.tags,
	}));
}

/**
 * Get detailed configuration schema for a specific job entry type.
 * 
 * This tool provides LLM agents with the information needed to generate valid
 * configurations for a job entry type. Returns the serialized Zod schema with
 * field definitions, types, required flags, descriptions, and example configurations.
 * 
 * Use this after discovering a job entry type with listJobEntryTypesTool to
 * understand what configuration fields are needed and see example usage patterns.
 * 
 * @param typeId - The job entry type identifier (e.g., "START", "TRANS", "WRITE_TO_LOG")
 * @returns Object containing typeId, category, displayName, description, tags,
 *          serialized schema with field metadata, and example configurations
 * @throws Error if the job entry type does not exist
 * 
 * @example
 * // Get schema for TRANS job entry
 * const schema = await getJobEntryTypeSchemaTool('TRANS');
 * // Returns: { typeId, category, displayName, description, tags, schema: { fields: [...] }, examples: [...] }
 * 
 * @example
 * // Use schema to generate configuration
 * const schema = await getJobEntryTypeSchemaTool('WRITE_TO_LOG');
 * const requiredFields = schema.schema.fields.filter(f => f.required);
 * // Use requiredFields and examples to build configuration
 */
export async function getJobEntryTypeSchemaTool(typeId: string): Promise<any> {
	const entryType = getJobEntryTypeSchema(typeId);
	if (!entryType) {
		throw new Error(`Unknown job entry type: ${typeId}`);
	}

	return {
		typeId: entryType.typeId,
		category: entryType.category,
		displayName: entryType.displayName,
		description: entryType.description,
		tags: entryType.tags,
		schema: serializeZodSchema(entryType.configurationSchema),
		examples: entryType.examples,
	};
}
