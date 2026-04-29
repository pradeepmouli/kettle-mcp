import { z } from 'zod';

/**
 * Represents a serialized field from a Zod schema.
 *
 * This interface provides a JSON-friendly representation of Zod schema fields
 * that LLM agents can easily understand and use for configuration generation.
 */
export interface SerializedField {
	/** Field name as it appears in the configuration object */
	name: string;

	/** Normalized type (e.g., "string", "number", "boolean", "array", "object") */
	type: string;

	/** Whether this field is required (true) or optional (false) */
	required: boolean;

	/** Human-readable description explaining the field's purpose and usage */
	description: string;

	/** Default value if the field is not provided (only present if a default exists) */
	default?: any;
}

/**
 * Represents a serialized Zod schema.
 *
 * Contains an array of serialized fields that describe the complete configuration
 * structure for a step type or job entry type.
 */
export interface SerializedSchema {
	/** Array of field definitions for the configuration schema */
	fields: SerializedField[];
}

/**
 * Serialize a Zod object schema to a JSON-friendly format for LLM consumption.
 *
 * This function converts Zod schemas (which use TypeScript types and runtime validation)
 * into a simple JSON structure that LLM agents can easily parse and understand. The
 * serialized format includes field names, types, required flags, descriptions, and
 * default values.
 *
 * LLM agents use this serialized schema to:
 * 1. Understand what configuration fields are available
 * 2. Identify required vs. optional fields
 * 3. Determine appropriate field types and values
 * 4. Generate valid configurations from examples
 *
 * @param schema - Zod object schema to serialize (e.g., tableInputConfigSchema)
 * @returns Serialized schema with field metadata in JSON-friendly format
 *
 * @example
 * // Serialize a step configuration schema
 * const schema = z.object({
 *   connection: z.string().describe('Database connection name'),
 *   sql: z.string().describe('SQL query'),
 *   limit: z.number().optional().describe('Row limit'),
 * });
 *
 * const serialized = serializeZodSchema(schema);
 * // Returns:
 * // {
 * //   fields: [
 * //     { name: 'connection', type: 'string', required: true, description: 'Database connection name' },
 * //     { name: 'sql', type: 'string', required: true, description: 'SQL query' },
 * //     { name: 'limit', type: 'number', required: false, description: 'Row limit' },
 * //   ]
 * // }
 */
export function serializeZodSchema(schema: z.ZodObject<any>): SerializedSchema {
	const shape = schema.shape;
	const fields: SerializedField[] = [];

	for (const [name, fieldSchema] of Object.entries(shape)) {
		const field: any = fieldSchema;

		// Extract type name — Zod v4 uses `_zod.def.type` (lowercase, e.g. "string")
		// while Zod v3 used `_def.typeName` (e.g. "ZodString")
		const typeName: string = field._zod?.def?.type ?? field._def?.typeName ?? 'unknown';
		const normalizedType = normalizeZodType(typeName, field);

		// Check if field is optional
		const isOptional = field.isOptional?.() ?? false;

		// Extract description
		const description = field.description || '';

		// Extract default value if present
		let defaultValue: any = undefined;
		if (field._def?.defaultValue !== undefined) {
			defaultValue = typeof field._def.defaultValue === 'function'
				? field._def.defaultValue()
				: field._def.defaultValue;
		}

		const serializedField: SerializedField = {
			name,
			type: normalizedType,
			required: !isOptional,
			description,
		};

		if (defaultValue !== undefined) {
			serializedField.default = defaultValue;
		}

		fields.push(serializedField);
	}

	return { fields };
}

/**
 * Normalize Zod type names to common, LLM-friendly type names.
 *
 * Converts Zod's internal type names (e.g., "ZodString", "ZodNumber") to
 * standard type names that are easier for LLM agents to understand and work
 * with (e.g., "string", "number").
 *
 * Handles wrapper types (ZodOptional, ZodNullable, ZodDefault) by unwrapping
 * them to get the underlying type.
 *
 * @param zodTypeName - Zod internal type name (e.g., "ZodString", "ZodOptional")
 * @param fieldSchema - The Zod field schema for additional context (used to unwrap wrapper types)
 * @returns Normalized type name (e.g., "string", "number", "boolean", "array", "object")
 *
 * @example
 * // Direct type
 * normalizeZodType('ZodString', stringField) // Returns: "string"
 *
 * @example
 * // Optional wrapper
 * normalizeZodType('ZodOptional', optionalStringField) // Returns: "string"
 *
 * @example
 * // Default wrapper
 * normalizeZodType('ZodDefault', defaultNumberField) // Returns: "number"
 */
function normalizeZodType(zodTypeName: string, fieldSchema: any): string {
	// Map Zod type names to common names.
	// Zod v4 uses lowercase type names (e.g. "string", "number") stored in `_zod.def.type`.
	// Zod v3 used prefixed names (e.g. "ZodString", "ZodNumber") in `_def.typeName`.
	const typeMap: Record<string, string> = {
		// Zod v4 lowercase names
		string: 'string',
		number: 'number',
		boolean: 'boolean',
		array: 'array',
		object: 'object',
		enum: 'enum',
		union: 'union',
		optional: 'optional',
		nullable: 'nullable',
		default: 'default',
		// Zod v3 prefixed names (kept for backward compat)
		ZodString: 'string',
		ZodNumber: 'number',
		ZodBoolean: 'boolean',
		ZodArray: 'array',
		ZodObject: 'object',
		ZodEnum: 'enum',
		ZodUnion: 'union',
		ZodOptional: 'optional',
		ZodNullable: 'nullable',
		ZodDefault: 'default',
	};

	// Helper to get the inner type for wrapper schemas (optional, nullable, default)
	function getInnerTypeName(wrapper: any): string | undefined {
		// Zod v4: inner type is at `_zod.def.innerType`
		const v4Inner = wrapper._zod?.def?.innerType;
		if (v4Inner) {
			return v4Inner._zod?.def?.type ?? v4Inner.def?.type;
		}
		// Zod v3: inner type is at `_def.innerType`
		return wrapper._def?.innerType?._def?.typeName;
	}

	// Handle optional/nullable wrappers by returning the underlying type
	if (zodTypeName === 'optional' || zodTypeName === 'ZodOptional' ||
		zodTypeName === 'nullable' || zodTypeName === 'ZodNullable') {
		const innerType = getInnerTypeName(fieldSchema);
		if (innerType && typeMap[innerType]) {
			return typeMap[innerType];
		}
	}

	// Handle default wrapper by returning the underlying type
	if (zodTypeName === 'default' || zodTypeName === 'ZodDefault') {
		const innerType = getInnerTypeName(fieldSchema);
		if (innerType && typeMap[innerType]) {
			return typeMap[innerType];
		}
	}

	return typeMap[zodTypeName] || zodTypeName.replace('Zod', '').toLowerCase();
}
