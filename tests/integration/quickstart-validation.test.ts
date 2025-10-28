/**
 * Quickstart Validation Tests
 *
 * Validates that all examples from specs/002-step-type-discovery/quickstart.md work correctly
 */
import { describe, expect, it } from 'vitest';
import {
	getJobEntryTypeSchemaTool,
	getStepTypeSchematool,
	listJobEntryTypesTool,
	listStepTypesTool,
} from '../../src/tools/discovery_tools';

describe('Quickstart Validation', () => {
	describe('Example 1: List all step types', () => {
		it('should return all step types with required metadata', async () => {
			const allSteps = await listStepTypesTool();

			expect(allSteps).toBeDefined();
			expect(allSteps.length).toBeGreaterThan(0);

			// Validate structure matches quickstart example
			allSteps.forEach((step: any) => {
				expect(step).toHaveProperty('typeId');
				expect(step).toHaveProperty('category');
				expect(step).toHaveProperty('displayName');
				expect(step).toHaveProperty('description');
				expect(step).toHaveProperty('tags');
				expect(Array.isArray(step.tags)).toBe(true);
			});
		});
	});

	describe('Example 2: Filter by category', () => {
		it('should filter input steps correctly', async () => {
			const inputSteps = await listStepTypesTool('Input');

			expect(inputSteps.length).toBeGreaterThan(0);
			inputSteps.forEach((step: any) => {
				expect(step.category).toBe('Input');
			});
		});

		it('should filter output steps correctly', async () => {
			const outputSteps = await listStepTypesTool('Output');

			expect(outputSteps.length).toBeGreaterThan(0);
			outputSteps.forEach((step: any) => {
				expect(step.category).toBe('Output');
			});
		});
	});

	describe('Example 3: Get schema for TableInput', () => {
		it('should return detailed schema matching quickstart example', async () => {
			const schema = await getStepTypeSchematool('TableInput');

			expect(schema).toBeDefined();
			expect(schema.typeId).toBe('TableInput');
			expect(schema.category).toBe('Input');
			expect(schema.displayName).toBe('Table Input');
			expect(schema.description).toContain('database');
			expect(schema.tags).toContain('database');
			expect(schema.tags).toContain('sql');
			expect(schema.tags).toContain('read');
			expect(schema.tags).toContain('input');
			expect(schema.schema).toBeDefined();
			expect(schema.schema.fields).toBeDefined();
			expect(Array.isArray(schema.schema.fields)).toBe(true);

			// Verify schema has connection and sql fields
			const fields = schema.schema.fields;
			const connectionField = fields.find((f: any) => f.name === 'connection');
			const sqlField = fields.find((f: any) => f.name === 'sql');

			expect(connectionField).toBeDefined();
			expect(connectionField?.type).toBe('string');
			expect(connectionField?.required).toBe(true);

			expect(sqlField).toBeDefined();
			expect(sqlField?.type).toBe('string');
			expect(sqlField?.required).toBe(true);
		});
	});

	describe('Use Case: Map User Intent to Step Type', () => {
		it('should discover database input steps for "read from MySQL" intent', async () => {
			// Step 1: Get input steps
			const steps = await listStepTypesTool('Input');
			expect(steps.length).toBeGreaterThan(0);

			// Step 2: Filter by database tag
			const dbSteps = steps.filter((s: any) => s.tags.includes('database'));
			expect(dbSteps.length).toBeGreaterThan(0);

			// Step 3: Verify TableInput is found
			const tableInput = dbSteps.find((s: any) => s.typeId === 'TableInput');
			expect(tableInput).toBeDefined();
			expect(tableInput?.tags).toContain('database');
			expect(tableInput?.tags).toContain('sql');
			expect(tableInput?.tags).toContain('read');
		});

		it('should get schema to understand configuration requirements', async () => {
			// Get schema for TableInput
			const schema = await getStepTypeSchematool('TableInput');

			// Verify we can understand what configuration fields are needed
			const requiredFields = schema.schema.fields.filter((f: any) => f.required);
			expect(requiredFields.length).toBeGreaterThan(0);

			// Verify connection and sql are documented
			const fieldNames = schema.schema.fields.map((f: any) => f.name);
			expect(fieldNames).toContain('connection');
			expect(fieldNames).toContain('sql');
		});
	});

	describe('Pattern 1: Category-Based Discovery', () => {
		it('should enable LLM to discover input steps via category filter', async () => {
			const inputSteps = await listStepTypesTool('Input');

			expect(inputSteps.length).toBeGreaterThan(0);
			inputSteps.forEach((step: any) => {
				expect(step.category).toBe('Input');
				expect(step.tags).toBeDefined();
				expect(step.tags.length).toBeGreaterThanOrEqual(3); // Per code review tests
			});
		});
	});

	describe('Pattern 2: Tag-Based Discovery', () => {
		it('should enable LLM to discover database operations via tags', async () => {
			const allSteps = await listStepTypesTool();
			const databaseSteps = allSteps.filter((s: any) => s.tags.includes('database'));

			expect(databaseSteps.length).toBeGreaterThan(0);
			databaseSteps.forEach((step: any) => {
				expect(step.tags).toContain('database');
			});
		});

		it('should enable LLM to discover JSON operations via tags', async () => {
			const allSteps = await listStepTypesTool();
			const jsonSteps = allSteps.filter((s: any) => s.tags.includes('json'));

			expect(jsonSteps.length).toBeGreaterThan(0);
			jsonSteps.forEach((step: any) => {
				expect(step.tags).toContain('json');
			});
		});
	});

	describe('Pattern 3: Schema-Driven Configuration', () => {
		it('should enable LLM to build config from schema', async () => {
			const schema = await getStepTypeSchematool('TableInput');

			// Extract required fields
			const requiredFields = schema.schema.fields.filter((f: any) => f.required);
			expect(requiredFields.length).toBeGreaterThan(0);

			// Build a configuration object based on schema
			const config: Record<string, any> = {};
			requiredFields.forEach((field: any) => {
				// Simulate LLM populating required fields
				if (field.name === 'connection') {
					config[field.name] = 'mysql-prod';
				} else if (field.name === 'sql') {
					config[field.name] = 'SELECT * FROM users WHERE active = true';
				}
			});

			// Verify config has required fields
			expect(config).toHaveProperty('connection');
			expect(config).toHaveProperty('sql');
		});
	});

	describe('Job Entry Discovery', () => {
		it('should list all job entry types', async () => {
			const allEntries = await listJobEntryTypesTool();

			expect(allEntries).toBeDefined();
			expect(allEntries.length).toBeGreaterThan(0);

			allEntries.forEach((entry: any) => {
				expect(entry).toHaveProperty('typeId');
				expect(entry).toHaveProperty('category');
				expect(entry).toHaveProperty('displayName');
				expect(entry).toHaveProperty('description');
				expect(entry).toHaveProperty('tags');
			});
		});

		it('should get schema for START entry', async () => {
			const schema = await getJobEntryTypeSchemaTool('START');

			expect(schema).toBeDefined();
			expect(schema.typeId).toBe('START');
			expect(schema.category).toBe('General');
			expect(schema.schema).toBeDefined();
		});
	});

	describe('Combined Filters', () => {
		it('should support category + tag filtering pattern', async () => {
			// Get input steps
			const inputSteps = await listStepTypesTool('Input');

			// Filter by file tag
			const fileInputSteps = inputSteps.filter((s: any) => s.tags.includes('file'));

			expect(fileInputSteps.length).toBeGreaterThan(0);
			fileInputSteps.forEach((step: any) => {
				expect(step.category).toBe('Input');
				expect(step.tags).toContain('file');
			});
		});
	});
});
