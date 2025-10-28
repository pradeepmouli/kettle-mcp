import { describe, expect, it } from 'vitest';
import { getStepTypeSchematool, listStepTypesTool } from '../../src/tools/discovery_tools.js';

/**
 * Performance tests for discovery APIs
 * 
 * Requirements:
 * - list_step_types should complete in <50ms
 * - get_step_type_schema should complete in <100ms
 */
describe('Discovery API Performance', () => {
	it('should list all step types in <50ms', async () => {
		const startTime = performance.now();
		const result = await listStepTypesTool();
		const endTime = performance.now();
		const duration = endTime - startTime;

		expect(result.length).toBeGreaterThan(0);
		expect(duration).toBeLessThan(50);
	});

	it('should list step types by category in <50ms', async () => {
		const startTime = performance.now();
		const result = await listStepTypesTool('Input');
		const endTime = performance.now();
		const duration = endTime - startTime;

		expect(result.length).toBeGreaterThan(0);
		expect(duration).toBeLessThan(50);
	});

	it('should list step types by tag in <50ms', async () => {
		const startTime = performance.now();
		const result = await listStepTypesTool(undefined, 'database');
		const endTime = performance.now();
		const duration = endTime - startTime;

		expect(result.length).toBeGreaterThan(0);
		expect(duration).toBeLessThan(50);
	});

	it('should get step type schema in <100ms', async () => {
		const startTime = performance.now();
		const result = await getStepTypeSchematool('TableInput');
		const endTime = performance.now();
		const duration = endTime - startTime;

		expect(result).toBeDefined();
		expect(result.schema).toBeDefined();
		expect(duration).toBeLessThan(100);
	});

	it('should get complex step type schema in <100ms', async () => {
		const startTime = performance.now();
		const result = await getStepTypeSchematool('TextFileInput');
		const endTime = performance.now();
		const duration = endTime - startTime;

		expect(result).toBeDefined();
		expect(result.schema).toBeDefined();
		expect(duration).toBeLessThan(100);
	});

	it('should perform multiple schema retrievals efficiently', async () => {
		const stepTypes = ['TableInput', 'TextFileInput', 'SelectValues', 'TextFileOutput'];
		
		const startTime = performance.now();
		for (const typeId of stepTypes) {
			await getStepTypeSchematool(typeId);
		}
		const endTime = performance.now();
		const duration = endTime - startTime;

		// All 4 should complete in less than 400ms total (100ms each)
		expect(duration).toBeLessThan(400);
	});
});
