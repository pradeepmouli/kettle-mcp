import { describe, expect, it } from 'vitest';
import {
	getStepTypeSchematool,
	listStepTypesTool,
} from '../../src/tools/discovery_tools.js';

/**
 * Integration test for step type discovery workflow
 * Simulates how an LLM would discover and use step types
 */
describe('Step Type Discovery Workflow', () => {
	it('should enable LLM to discover appropriate steps for a scenario', async () => {
		// Scenario: LLM wants to build an ETL pipeline to read from database and write to CSV

		// Step 1: Discover all input steps
		const inputSteps = await listStepTypesTool('Input');
		expect(inputSteps.length).toBeGreaterThan(0);

		// Step 2: Find database input step by tags
		const dbInputStep = inputSteps.find((s) =>
			s.tags.includes('database') && s.tags.includes('sql')
		);
		expect(dbInputStep).toBeDefined();
		expect(dbInputStep?.typeId).toBe('TableInput');

		// Step 3: Get schema details for database input
		const dbSchema = await getStepTypeSchematool(dbInputStep!.typeId);
		expect(dbSchema.schema.fields).toBeInstanceOf(Array);

		// Verify required fields are present
		const connectionField = dbSchema.schema.fields.find((f: any) => f.name === 'connection');
		expect(connectionField?.required).toBe(true);
		expect(connectionField?.type).toBe('string');

		const sqlField = dbSchema.schema.fields.find((f: any) => f.name === 'sql');
		expect(sqlField?.required).toBe(true);
		expect(sqlField?.type).toBe('string');

		// Step 4: Discover output steps
		const outputSteps = await listStepTypesTool('Output');
		expect(outputSteps.length).toBeGreaterThanOrEqual(23); // T105: Should have 23+ output types after Phase 5

		// Step 5: Find CSV output step by tags
		const csvOutputStep = outputSteps.find((s) =>
			s.tags.includes('csv') && s.tags.includes('file')
		);
		expect(csvOutputStep).toBeDefined();
		expect(csvOutputStep?.typeId).toBe('TextFileOutput');

		// Step 6: Get schema for CSV output
		const csvSchema = await getStepTypeSchematool(csvOutputStep!.typeId);
		expect(csvSchema.schema.fields).toBeInstanceOf(Array);
		expect(csvSchema.schema.fields.length).toBeGreaterThan(0);
	});

	it('should discover transform steps by capability tags', async () => {
		// Scenario: LLM needs to filter/select specific fields

		const transformSteps = await listStepTypesTool('Transform');
		expect(transformSteps.length).toBeGreaterThan(0);

		// Find field selection step
		const selectStep = transformSteps.find((s) =>
			s.tags.includes('select') && s.tags.includes('fields')
		);
		expect(selectStep).toBeDefined();
		expect(selectStep?.typeId).toBe('SelectValues');

		// Verify description is LLM-friendly
		expect(selectStep?.description).toContain('Select');
		expect(selectStep?.description.length).toBeGreaterThan(50);

		// Get detailed schema
		const schema = await getStepTypeSchematool(selectStep!.typeId);
		expect(schema.schema.fields).toBeInstanceOf(Array);

		// Verify fields have descriptions
		schema.schema.fields.forEach((field: any) => {
			expect(field.description).toBeTruthy();
		});
	});

	it('should provide enough metadata for autonomous step selection', async () => {
		// Verify all steps have complete metadata
		const allSteps = await listStepTypesTool();

		allSteps.forEach((step) => {
			// Each step must have core metadata
			expect(step.typeId).toBeTruthy();
			expect(step.category).toBeTruthy();
			expect(step.displayName).toBeTruthy();
			expect(step.description.length).toBeGreaterThan(20);

			// Each step must have at least 3 tags
			expect(step.tags.length).toBeGreaterThanOrEqual(3);

			// Tags should be lowercase for consistency
			step.tags.forEach((tag: string) => {
				expect(tag).toBe(tag.toLowerCase());
			});
		});
	});

	it('should handle category filtering correctly', async () => {
		const inputSteps = await listStepTypesTool('Input');
		const outputSteps = await listStepTypesTool('Output');
		const transformSteps = await listStepTypesTool('Transform');

		// Verify no overlap between categories
		const inputIds = new Set(inputSteps.map((s) => s.typeId));
		const outputIds = new Set(outputSteps.map((s) => s.typeId));
		const transformIds = new Set(transformSteps.map((s) => s.typeId));

		// No input step should be in output
		inputIds.forEach((id) => expect(outputIds.has(id)).toBe(false));

		// No output step should be in transform
		outputIds.forEach((id) => expect(transformIds.has(id)).toBe(false));

		// No transform step should be in input
		transformIds.forEach((id) => expect(inputIds.has(id)).toBe(false));
	});

	it('should provide configuration examples for complex step types', async () => {
		// Test US2: Schema retrieval with examples
		const tableInputSchema = await getStepTypeSchematool('TableInput');

		// Verify examples are present and well-formed
		expect(tableInputSchema.examples).toBeDefined();
		expect(Array.isArray(tableInputSchema.examples)).toBe(true);
		expect(tableInputSchema.examples!.length).toBeGreaterThan(0);

		// Verify each example has required fields
		tableInputSchema.examples!.forEach((example: any) => {
			expect(example.name).toBeTruthy();
			expect(example.description).toBeTruthy();
			expect(example.configuration).toBeDefined();
			expect(typeof example.configuration).toBe('object');
		});

		// Verify first example has expected structure
		const firstExample = tableInputSchema.examples![0];
		expect(firstExample.configuration).toHaveProperty('connection');
		expect(firstExample.configuration).toHaveProperty('sql');
	});

	it('should support end-to-end configuration generation workflow', async () => {
		// Simulate LLM workflow: Discover → Get Schema → Generate Config

		// Step 1: Discover text file input step
		const inputSteps = await listStepTypesTool('Input');
		const fileInputStep = inputSteps.find((s) => s.tags.includes('file') && s.tags.includes('csv'));
		expect(fileInputStep).toBeDefined();

		// Step 2: Get detailed schema
		const schema = await getStepTypeSchematool(fileInputStep!.typeId);
		expect(schema.schema.fields).toBeInstanceOf(Array);
		expect(schema.examples).toBeDefined();

		// Step 3: Use schema metadata to understand requirements
		const requiredFields = schema.schema.fields.filter((f: any) => f.required);
		expect(requiredFields.length).toBeGreaterThan(0);

		// Verify field descriptions provide guidance
		requiredFields.forEach((field: any) => {
			expect(field.description).toBeTruthy();
			expect(field.description.length).toBeGreaterThan(10);
		});

		// Step 4: Use example as template
		expect(schema.examples!.length).toBeGreaterThan(0);
		const template = schema.examples![0].configuration;
		expect(template).toHaveProperty('filename');
		expect(template).toHaveProperty('fields');
	});

	it('should enable use case mapping via tag filtering', async () => {
		// Scenario: User says "I need to read from a database"
		const databaseSteps = await listStepTypesTool(undefined, 'database');

		expect(databaseSteps.length).toBeGreaterThan(0);
		expect(databaseSteps.every((s: any) => s.tags.includes('database'))).toBe(true);

		// Should find TableInput
		const tableInput = databaseSteps.find((s: any) => s.typeId === 'TableInput');
		expect(tableInput).toBeDefined();

		// Scenario: User says "I need to work with CSV files"
		const csvSteps = await listStepTypesTool(undefined, 'csv');

		expect(csvSteps.length).toBeGreaterThan(0);
		expect(csvSteps.every((s: any) => s.tags.includes('csv'))).toBe(true);

		// Should find both input and output CSV steps
		const csvStepIds = csvSteps.map((s: any) => s.typeId);
		expect(csvStepIds).toContain('TextFileInput');
		expect(csvStepIds).toContain('TextFileOutput');
	});

	it('should support common data engineering use cases via tags', async () => {
		// Use case: ETL pipeline
		const etlSteps = await listStepTypesTool(undefined, 'etl');
		expect(etlSteps.length).toBeGreaterThan(0);

		// Use case: Batch processing
		const batchSteps = await listStepTypesTool(undefined, 'batch');
		expect(batchSteps.length).toBeGreaterThan(0);

		// Use case: SQL operations
		const sqlSteps = await listStepTypesTool(undefined, 'sql');
		expect(sqlSteps.length).toBeGreaterThan(0);
		expect(sqlSteps.some((s: any) => s.typeId === 'TableInput')).toBe(true);
	});

	it('should enable configuration generation using schema and examples', async () => {
		// T043: Test that schemas provide enough info to generate valid configurations

		// Scenario: LLM needs to create a TableInput step
		const schema = await getStepTypeSchematool('TableInput');

		// Step 1: Understand requirements from schema
		const requiredFields = schema.schema.fields.filter((f: any) => f.required);
		const requiredFieldNames = requiredFields.map((f: any) => f.name);

		expect(requiredFieldNames).toContain('connection');
		expect(requiredFieldNames).toContain('sql');

		// Step 2: Use example as template
		expect(schema.examples).toBeDefined();
		expect(schema.examples!.length).toBeGreaterThan(0);

		const exampleConfig = schema.examples![0].configuration;

		// Step 3: Verify example contains all required fields
		requiredFieldNames.forEach((fieldName: string) => {
			expect(exampleConfig).toHaveProperty(fieldName);
			expect(exampleConfig[fieldName]).toBeTruthy();
		});

		// Step 4: Generate new configuration based on example
		const generatedConfig = {
			...exampleConfig,
			connection: 'my_database',
			sql: 'SELECT * FROM my_table WHERE status = \'active\'',
		};

		// Step 5: Validate generated config has all required fields
		requiredFieldNames.forEach((fieldName: string) => {
			expect(generatedConfig).toHaveProperty(fieldName);
			expect(generatedConfig[fieldName]).toBeTruthy();
		});

		// Verify schema provides type information for validation
		schema.schema.fields.forEach((field: any) => {
			expect(field.type).toBeTruthy();
			expect(['string', 'number', 'boolean', 'array', 'object']).toContain(field.type);
		});
	});

	it('should detect incomplete requirements in configuration generation', async () => {
		// T044: Test that system identifies missing required fields

		// Scenario: LLM attempts to generate config but schema is unclear
		const schema = await getStepTypeSchematool('TextFileInput');

		// Step 1: Identify required fields
		const requiredFields = schema.schema.fields.filter((f: any) => f.required);
		expect(requiredFields.length).toBeGreaterThan(0);

		// Step 2: Attempt to create config with missing required field
		const incompleteConfig: any = {};

		// Only populate some required fields
		const firstRequiredField = requiredFields[0];
		incompleteConfig[firstRequiredField.name] = 'test_value';

		// Step 3: Detect missing fields
		const missingFields = requiredFields
			.filter((f: any) => !incompleteConfig.hasOwnProperty(f.name))
			.map((f: any) => f.name);

		expect(missingFields.length).toBeGreaterThan(0);

		// Step 4: Verify each missing field has clear description for guidance
		missingFields.forEach((fieldName: string) => {
			const fieldDef = schema.schema.fields.find((f: any) => f.name === fieldName);
			expect(fieldDef).toBeDefined();
			expect(fieldDef!.description).toBeTruthy();
			expect(fieldDef!.description.length).toBeGreaterThan(15);
			expect(fieldDef!.required).toBe(true);
		});

		// Step 5: Verify error guidance is actionable
		const errorMessage = `Missing required fields: ${missingFields.join(', ')}`;
		expect(errorMessage).toContain('Missing required fields');
		expect(missingFields.length).toBeGreaterThan(0);

		// Verify schema provides default values where applicable
		const fieldsWithDefaults = schema.schema.fields.filter((f: any) => f.default !== undefined);
		fieldsWithDefaults.forEach((field: any) => {
			expect(field.default).toBeDefined();
		});
	});

	it('should validate that examples conform to their schemas', async () => {
		// T048: Verify schema examples validate against their schemas

		// Test multiple step types
		const stepTypes = ['TableInput', 'TextFileInput', 'SelectValues', 'TextFileOutput'];

		for (const typeId of stepTypes) {
			const schema = await getStepTypeSchematool(typeId);

			// Skip if no examples
			if (!schema.examples || schema.examples.length === 0) {
				continue;
			}

			// Verify each example
			schema.examples.forEach((example: any, index: number) => {
				const config = example.configuration;

				// Check all required fields are present
				const requiredFields = schema.schema.fields.filter((f: any) => f.required);
				requiredFields.forEach((field: any) => {
					expect(config).toHaveProperty(field.name);

					// Verify non-null/non-empty for required fields
					const value = config[field.name];
					expect(value).toBeDefined();

					if (field.type === 'string') {
						expect(typeof value).toBe('string');
					} else if (field.type === 'number') {
						expect(typeof value).toBe('number');
					} else if (field.type === 'boolean') {
						expect(typeof value).toBe('boolean');
					} else if (field.type === 'array') {
						expect(Array.isArray(value)).toBe(true);
					} else if (field.type === 'object') {
						expect(typeof value).toBe('object');
					}
				});
			});
		}
	});

	it('should provide complete workflow for Excel data import use case', async () => {
		// Real-world scenario: Import data from Excel file

		// Step 1: Discover Excel input steps via tag
		const excelSteps = await listStepTypesTool(undefined, 'excel');
		expect(excelSteps.length).toBeGreaterThan(0);

		const excelInput = excelSteps.find((s: any) => s.category === 'Input');
		expect(excelInput).toBeDefined();
		expect(excelInput?.typeId).toBe('ExcelInput');

		// Step 2: Get schema for configuration
		const schema = await getStepTypeSchematool('ExcelInput');

		// Step 3: Verify schema has required information
		expect(schema.schema.fields).toBeInstanceOf(Array);
		const filenameField = schema.schema.fields.find((f: any) => f.name === 'filename');
		expect(filenameField).toBeDefined();
		expect(filenameField?.required).toBe(true);

		// Step 4: Use example to understand configuration pattern
		expect(schema.examples).toBeDefined();
		expect(schema.examples!.length).toBeGreaterThan(0);

		const exampleConfig = schema.examples![0].configuration;
		expect(exampleConfig).toHaveProperty('filename');
		expect(exampleConfig).toHaveProperty('sheetName');

		// Step 5: Generate configuration for new use case
		const newConfig = {
			...exampleConfig,
			filename: '/data/sales_report.xlsx',
			sheetName: 'Q4_Sales',
		};

		// Verify all required fields are present
		const requiredFields = schema.schema.fields
			.filter((f: any) => f.required)
			.map((f: any) => f.name);

		requiredFields.forEach((fieldName: string) => {
			expect(newConfig).toHaveProperty(fieldName);
		});
	});

	it('should provide complete workflow for REST API data retrieval', async () => {
		// Real-world scenario: Fetch data from REST API

		// Step 1: Discover REST API steps
		const restSteps = await listStepTypesTool(undefined, 'rest-api');
		expect(restSteps.length).toBeGreaterThan(0);

		const restClient = restSteps.find((s: any) => s.typeId === 'RestClient');
		expect(restClient).toBeDefined();

		// Step 2: Get schema
		const schema = await getStepTypeSchematool('RestClient');

		// Step 3: Verify schema supports common REST patterns
		const urlField = schema.schema.fields.find((f: any) => f.name === 'url');
		expect(urlField).toBeDefined();
		expect(urlField?.required).toBe(true);

		const methodField = schema.schema.fields.find((f: any) => f.name === 'method');
		expect(methodField).toBeDefined();

		// Step 4: Use example
		expect(schema.examples).toBeDefined();
		const exampleConfig = schema.examples![0].configuration;
		expect(exampleConfig).toHaveProperty('url');
		expect(exampleConfig).toHaveProperty('method');

		// Step 5: Generate configuration
		const apiConfig = {
			url: 'https://api.example.com/data',
			method: 'GET',
			headers: exampleConfig.headers || {},
		};

		// Verify required fields
		expect(apiConfig.url).toBeTruthy();
		expect(apiConfig.method).toBeTruthy();
	});
});