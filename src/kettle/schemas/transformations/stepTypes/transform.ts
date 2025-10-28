import { z } from 'zod';
import { StepCategory, type StepType } from './types.js';

/**
 * Configuration schema for SelectValues step
 */
const selectValuesConfigSchema = z.object({
	fields: z.union([
		z.array(z.object({
			name: z.string(),
			rename: z.string().optional(),
		})),
		z.object({
			field: z.array(z.object({
				name: z.string(),
				rename: z.string().optional(),
			})),
			select_unspecified: z.string().optional(),
		}),
	]).describe('Fields to select and optionally rename'),
	removeUnspecified: z.boolean().optional().describe('Remove fields not in selection'),
});

/**
 * Configuration schema for FilterRows step
 */
const filterRowsConfigSchema = z.object({
	condition: z.object({
		leftvalue: z.string().describe('Left side field name'),
		function: z.enum(['=', '<>', '<', '<=', '>', '>=', 'LIKE', 'REGEXP', 'IS NULL', 'IS NOT NULL']),
		rightvalue: z.string().optional().describe('Right side value or field'),
	}).describe('Filter condition'),
	sendTrueStepname: z.string().optional().describe('Step for matching rows'),
	sendFalseStepname: z.string().optional().describe('Step for non-matching rows'),
});

/**
 * Configuration schema for SortRows step
 */
const sortRowsConfigSchema = z.object({
	fields: z.array(z.object({
		name: z.string(),
		ascending: z.boolean().default(true),
	})).describe('Fields to sort by'),
});

/**
 * Configuration schema for Calculator step
 */
const calculatorConfigSchema = z.object({
	calculation: z.array(z.object({
		fieldName: z.string().describe('New field name'),
		calculationType: z.enum([
			'ADD', 'SUBTRACT', 'MULTIPLY', 'DIVIDE',
			'PERCENT', 'SQRT', 'ABS', 'ROUND',
		]),
		fieldA: z.string().optional().describe('First field'),
		fieldB: z.string().optional().describe('Second field'),
		valueType: z.enum(['String', 'Integer', 'Number', 'Date', 'Boolean']).default('Number'),
	})).describe('Calculations to perform'),
});

/**
 * Transform step types registry
 */
export const TRANSFORM_STEPS: Record<string, StepType> = {
	SelectValues: {
		typeId: 'SelectValues',
		category: StepCategory.TRANSFORM,
		displayName: 'Select Values',
		description: 'Select, rename, reorder, or remove fields from the data stream. Core transformation step for data shaping and schema mapping. Supports field selection (whitelist/blacklist), renaming with metadata preservation, type conversion, and field reordering. Essential for aligning source data with target schemas.',
		tags: ['transform', 'fields', 'select', 'filter', 'mapping'],
		configurationSchema: selectValuesConfigSchema,
	},
	FilterRows: {
		typeId: 'FilterRows',
		category: StepCategory.TRANSFORM,
		displayName: 'Filter Rows',
		description: 'Route rows to different streams based on conditions. Supports comparison operators (=, <>, <, >, <=, >=), pattern matching (LIKE, REGEXP), and null checks. Essential for data quality filtering, conditional routing, and business rule enforcement. Splits data flow into true/false paths.',
		tags: ['transform', 'filter', 'condition', 'routing', 'validation'],
		configurationSchema: filterRowsConfigSchema,
	},
	SortRows: {
		typeId: 'SortRows',
		category: StepCategory.TRANSFORM,
		displayName: 'Sort Rows',
		description: 'Sort data rows by one or more fields in ascending or descending order. Required before certain operations like merge joins or group by. Handles multiple sort keys with configurable direction per field. Use for ordered output, ranking, or preparing data for downstream operations.',
		tags: ['transform', 'sort', 'order', 'ranking'],
		configurationSchema: sortRowsConfigSchema,
	},
	Calculator: {
		typeId: 'Calculator',
		category: StepCategory.TRANSFORM,
		displayName: 'Calculator',
		description: 'Perform mathematical calculations and create calculated fields. Supports arithmetic operations (add, subtract, multiply, divide), mathematical functions (sqrt, abs, round), and percentage calculations. Use for deriving metrics, financial calculations, or data enrichment with computed values.',
		tags: ['transform', 'calculate', 'math', 'formula', 'derived'],
		configurationSchema: calculatorConfigSchema,
	},
};
