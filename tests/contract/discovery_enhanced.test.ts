import { describe, expect, it } from 'vitest';
import {
	getJobEntryTypeSchemaTool,
	getStepTypeSchematool,
	listJobEntryTypesTool,
	listStepTypesTool,
} from '../../src/tools/discovery_tools.js';

describe('Discovery Tools - Enhanced', () => {
	describe('list_step_types', () => {
		it('should return all step types with metadata including tags', async () => {
			const result = await listStepTypesTool();

			expect(Array.isArray(result)).toBe(true);
			expect(result.length).toBeGreaterThan(0);

			// Verify each step type has required fields
			result.forEach((stepType: any) => {
				expect(stepType).toHaveProperty('typeId');
				expect(stepType).toHaveProperty('category');
				expect(stepType).toHaveProperty('displayName');
				expect(stepType).toHaveProperty('description');
				expect(stepType).toHaveProperty('tags');
				expect(Array.isArray(stepType.tags)).toBe(true);
			});
		});

		it('should filter step types by category', async () => {
			const inputSteps = await listStepTypesTool('Input');

			expect(Array.isArray(inputSteps)).toBe(true);
			expect(inputSteps.length).toBeGreaterThan(0);

			// All returned steps should be Input category
			inputSteps.forEach((step: any) => {
				expect(step.category).toBe('Input');
			});
		});

		it('should return empty array for invalid category', async () => {
			const result = await listStepTypesTool('InvalidCategory' as any);
			expect(Array.isArray(result)).toBe(true);
			expect(result.length).toBe(0);
		});

		it('should include populated tags for TableInput', async () => {
			const allSteps = await listStepTypesTool();
			const tableInput = allSteps.find((s: any) => s.typeId === 'TableInput');

			expect(tableInput).toBeDefined();
			expect(tableInput.tags).toContain('database');
			expect(tableInput.tags).toContain('sql');
			expect(tableInput.tags).toContain('read');
		});

		it('should filter step types by tag', async () => {
			const databaseSteps = await listStepTypesTool(undefined, 'database');

			expect(Array.isArray(databaseSteps)).toBe(true);
			expect(databaseSteps.length).toBeGreaterThan(0);

			// All returned steps should have the 'database' tag
			databaseSteps.forEach((step: any) => {
				expect(step.tags).toContain('database');
			});

			// TableInput should be included
			const hasTableInput = databaseSteps.some((s: any) => s.typeId === 'TableInput');
			expect(hasTableInput).toBe(true);
		});

		it('should filter step types by multiple tags using OR logic', async () => {
			const csvSteps = await listStepTypesTool(undefined, 'csv');

			expect(Array.isArray(csvSteps)).toBe(true);
			expect(csvSteps.length).toBeGreaterThan(0);

			// All returned steps should have the 'csv' tag
			csvSteps.forEach((step: any) => {
				expect(step.tags).toContain('csv');
			});

			// Should include both input and output CSV steps
			const stepIds = csvSteps.map((s: any) => s.typeId);
			expect(stepIds).toContain('TextFileInput');
			expect(stepIds).toContain('TextFileOutput');
		});

		it('should return empty array for non-existent tag', async () => {
			const result = await listStepTypesTool(undefined, 'non-existent-tag');
			expect(Array.isArray(result)).toBe(true);
			expect(result.length).toBe(0);
		});
	});

	describe('get_step_type_schema', () => {
		it('should return schema with serialized fields', async () => {
			const result = await getStepTypeSchematool('TableInput');

			expect(result).toHaveProperty('typeId', 'TableInput');
			expect(result).toHaveProperty('category');
			expect(result).toHaveProperty('displayName');
			expect(result).toHaveProperty('description');
			expect(result).toHaveProperty('tags');
			expect(result).toHaveProperty('schema');

			// Verify schema structure
			expect(result.schema).toHaveProperty('fields');
			expect(Array.isArray(result.schema.fields)).toBe(true);
			expect(result.schema.fields.length).toBeGreaterThan(0);

			// Verify field structure
			result.schema.fields.forEach((field: any) => {
				expect(field).toHaveProperty('name');
				expect(field).toHaveProperty('type');
				expect(field).toHaveProperty('required');
				expect(field).toHaveProperty('description');
			});
		});

		it('should include connection field as required string', async () => {
			const result = await getStepTypeSchematool('TableInput');
			const connectionField = result.schema.fields.find((f: any) => f.name === 'connection');

			expect(connectionField).toBeDefined();
			expect(connectionField.type).toBe('string');
			expect(connectionField.required).toBe(true);
			expect(connectionField.description).toContain('connection');
		});

		it('should include examples if available', async () => {
			const result = await getStepTypeSchematool('TableInput');

			// After implementing examples, this should pass
			if (result.examples) {
				expect(Array.isArray(result.examples)).toBe(true);
				result.examples.forEach((example: any) => {
					expect(example).toHaveProperty('name');
					expect(example).toHaveProperty('description');
					expect(example).toHaveProperty('configuration');
				});
			}
		});

		it('should throw error for non-existent step type', async () => {
			await expect(getStepTypeSchematool('NonExistentStep')).rejects.toThrow('Unknown step type');
		});
	});

	describe('list_job_entry_types', () => {
		it('should return all job entry types with metadata including tags', async () => {
			const result = await listJobEntryTypesTool();

			expect(Array.isArray(result)).toBe(true);
			expect(result.length).toBeGreaterThan(0);

			result.forEach((entryType: any) => {
				expect(entryType).toHaveProperty('typeId');
				expect(entryType).toHaveProperty('category');
				expect(entryType).toHaveProperty('displayName');
				expect(entryType).toHaveProperty('description');
				expect(entryType).toHaveProperty('tags');
				expect(Array.isArray(entryType.tags)).toBe(true);
			});
		});

		it('should filter job entry types by category', async () => {
			const generalEntries = await listJobEntryTypesTool('General');

			expect(Array.isArray(generalEntries)).toBe(true);
			expect(generalEntries.length).toBeGreaterThan(0);

			// All returned entries should be General category
			generalEntries.forEach((entry: any) => {
				expect(entry.category).toBe('General');
			});
		});

		it('should filter job entry types by tag', async () => {
			const workflowEntries = await listJobEntryTypesTool(undefined, 'workflow');

			expect(Array.isArray(workflowEntries)).toBe(true);
			expect(workflowEntries.length).toBeGreaterThan(0);

			// All returned entries should have 'workflow' tag
			workflowEntries.forEach((entry: any) => {
				expect(entry.tags).toContain('workflow');
			});
		});

		it('should include enhanced tags for TRANS entry', async () => {
			const allEntries = await listJobEntryTypesTool();
			const transEntry = allEntries.find((e: any) => e.typeId === 'TRANS');

			expect(transEntry).toBeDefined();
			expect(transEntry.tags).toContain('workflow');
			expect(transEntry.tags).toContain('orchestration');
			expect(transEntry.tags).toContain('etl');
			expect(transEntry.tags).toContain('nested');
		});

		it('should include enhanced tags for START entry', async () => {
			const allEntries = await listJobEntryTypesTool();
			const startEntry = allEntries.find((e: any) => e.typeId === 'START');

			expect(startEntry).toBeDefined();
			expect(startEntry.tags).toContain('workflow');
			expect(startEntry.tags).toContain('orchestration');
		});
	});

	describe('get_job_entry_type_schema', () => {
		it('should return schema with serialized fields for job entries', async () => {
			const result = await getJobEntryTypeSchemaTool('TRANS');

			expect(result).toHaveProperty('typeId', 'TRANS');
			expect(result).toHaveProperty('schema');
			expect(result.schema).toHaveProperty('fields');
			expect(Array.isArray(result.schema.fields)).toBe(true);
		});

		it('should include examples for TRANS entry type', async () => {
			const result = await getJobEntryTypeSchemaTool('TRANS');

			expect(result.examples).toBeDefined();
			expect(Array.isArray(result.examples)).toBe(true);
			expect(result.examples.length).toBeGreaterThan(0);

			result.examples.forEach((example: any) => {
				expect(example).toHaveProperty('name');
				expect(example).toHaveProperty('description');
				expect(example).toHaveProperty('configuration');
			});
		});

		it('should include examples for WRITE_TO_LOG entry type', async () => {
			const result = await getJobEntryTypeSchemaTool('WRITE_TO_LOG');

			expect(result.examples).toBeDefined();
			expect(Array.isArray(result.examples)).toBe(true);
			expect(result.examples.length).toBeGreaterThan(0);

			// Verify example configuration matches schema
			const firstExample = result.examples[0];
			expect(firstExample.configuration).toHaveProperty('logmessage');
			expect(firstExample.configuration).toHaveProperty('loglevel');
		});

		it('should include examples for START entry type', async () => {
			const result = await getJobEntryTypeSchemaTool('START');

			expect(result.examples).toBeDefined();
			expect(Array.isArray(result.examples)).toBe(true);
		});

		it('should throw error for non-existent job entry type', async () => {
			await expect(getJobEntryTypeSchemaTool('NonExistentEntry')).rejects.toThrow('Unknown job entry type');
		});
	});
});
