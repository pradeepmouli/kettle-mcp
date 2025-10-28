
import * as fs from 'fs/promises';
import { tmpdir } from 'os';
import * as path from 'path';
import { parseKettleXml } from '../../src/kettle/xml-utils';
import { addTransformationHop, addTransformationStep } from '../../src/tools/add_transformation_step';

describe('Add Transformation Step Contract Tests', () => {
	const testDir = path.join(tmpdir(), 'kettle-mcp-tests', 'transformations');
	const sampleFile = path.join(testDir, 'test_transformation.ktr');

	beforeEach(async () => {
		// Create test directory
		await fs.mkdir(testDir, { recursive: true });

		// Create a minimal transformation file for testing
		const minimalTransformation = `<?xml version="1.0" encoding="UTF-8"?>
<transformation>
  <info>
    <name>test_transformation</name>
    <description>Test transformation</description>
    <trans_version/>
    <trans_type>Normal</trans_type>
    <directory>/</directory>
  </info>
  <order>
  </order>
  <step>
    <name>Input</name>
    <type>TableInput</type>
    <description/>
    <distribute>Y</distribute>
    <custom_distribution/>
    <copies>1</copies>
    <partitioning>
      <method>none</method>
      <schema_name/>
    </partitioning>
    <connection>test_db</connection>
    <sql>SELECT * FROM users</sql>
    <limit>0</limit>
    <lookup/>
    <execute_each_row>N</execute_each_row>
    <variables_active>N</variables_active>
    <lazy_conversion_active>N</lazy_conversion_active>
    <GUI>
      <xloc>100</xloc>
      <yloc>100</yloc>
      <draw>Y</draw>
    </GUI>
  </step>
  <step_error_handling>
  </step_error_handling>
  <slave-step-copy-partition-distribution>
  </slave-step-copy-partition-distribution>
  <slave_transformation>N</slave_transformation>
</transformation>`;

		await fs.writeFile(sampleFile, minimalTransformation, 'utf-8');
	});

	afterEach(async () => {
		// Clean up test files
		try {
			await fs.rm(testDir, { recursive: true, force: true });
		} catch (error) {
			// Ignore cleanup errors
		}
	});

	describe('addTransformationStep', () => {
		it('should add a new step with valid configuration', async () => {
			const result = await addTransformationStep(sampleFile, {
				name: 'SelectFields',
				type: 'SelectValues',
				configuration: {
					fields: [
						{ name: 'id', rename: 'user_id' },
						{ name: 'email' },
					],
				},
				xloc: 200,
				yloc: 100,
			});

			expect(result.success).toBe(true);
			expect(result.error).toBeUndefined();

			// Verify the step was actually added
			const transformation = await parseKettleXml(sampleFile);
			const steps = Array.isArray(transformation.transformation.step)
				? transformation.transformation.step
				: [transformation.transformation.step];

			const newStep = steps.find((s: any) => s.name === 'SelectFields');
			expect(newStep).toBeDefined();
			expect(newStep.type).toBe('SelectValues');
			expect(newStep.GUI.xloc).toBe(200);
			expect(newStep.GUI.yloc).toBe(100);
		});

		it('should reject step with duplicate name', async () => {
			const result = await addTransformationStep(sampleFile, {
				name: 'Input', // This already exists
				type: 'TableInput',
				configuration: {
					connection: 'another_db',
					sql: 'SELECT * FROM products',
					limit: 100,
				},
				xloc: 300,
				yloc: 100,
			});

			expect(result.success).toBe(false);
			expect(result.error).toContain('already exists');
		});

		it('should reject step with invalid configuration', async () => {
			const result = await addTransformationStep(sampleFile, {
				name: 'BadInput',
				type: 'TableInput',
				configuration: {
					// Missing required 'connection' field
					sql: 'SELECT * FROM products',
				},
				xloc: 300,
				yloc: 100,
			});

			expect(result.success).toBe(false);
			expect(result.error).toContain('configuration');
		});

		it('should reject step with unknown type', async () => {
			const result = await addTransformationStep(sampleFile, {
				name: 'UnknownStep',
				type: 'NonExistentStepType',
				configuration: {},
				xloc: 300,
				yloc: 100,
			});

			expect(result.success).toBe(false);
			expect(result.error).toContain('Unknown step type');
		});

		it('should use default coordinates if not provided', async () => {
			const result = await addTransformationStep(sampleFile, {
				name: 'DefaultCoords',
				type: 'SelectValues',
				configuration: {
					fields: [{ name: 'id' }],
				},
				xloc: 100,
				yloc: 100,
			});

			expect(result.success).toBe(true);

			// Verify coordinates
			const transformation = await parseKettleXml(sampleFile);
			const steps = Array.isArray(transformation.transformation.step)
				? transformation.transformation.step
				: [transformation.transformation.step];

			const newStep = steps.find((s: any) => s.name === 'DefaultCoords');
			expect(newStep.GUI.xloc).toBe(100);
			expect(newStep.GUI.yloc).toBe(100);
		});

		it('should create backup file before modification', async () => {
			await addTransformationStep(sampleFile, {
				name: 'NewStep',
				type: 'SelectValues',
				configuration: {
					fields: [{ name: 'test' }],
				},
				xloc: 150,
				yloc: 150,
			});

			// Check if backup file exists
			const backupFile = `${sampleFile}.backup`;
			const backupExists = await fs
				.access(backupFile)
				.then(() => true)
				.catch(() => false);

			expect(backupExists).toBe(true);
		});

		it('should handle TextFileInput step type correctly', async () => {
			const result = await addTransformationStep(sampleFile, {
				name: 'ReadCSV',
				type: 'TextFileInput',
				configuration: {
					filename: '/path/to/file.csv',
					separator: ',',
					enclosure: '"',
					fields: [
						{ name: 'id', type: 'Integer' },
						{ name: 'name', type: 'String' },
					],
				},
				xloc: 250,
				yloc: 200,
			});

			expect(result.success).toBe(true);

			const transformation = await parseKettleXml(sampleFile);
			const steps = Array.isArray(transformation.transformation.step)
				? transformation.transformation.step
				: [transformation.transformation.step];

			const csvStep = steps.find((s: any) => s.name === 'ReadCSV');
			expect(csvStep).toBeDefined();
			expect(csvStep.type).toBe('TextFileInput');
		});
	});

	describe('addTransformationHop', () => {
		it('should add a hop between existing steps', async () => {
			// First add a second step
			await addTransformationStep(sampleFile, {
				name: 'Output',
				type: 'SelectValues',
				configuration: {
					fields: [{ name: 'id' }],
				},
				xloc: 200,
				yloc: 100,
			});

			// Now add a hop
			const result = await addTransformationHop(sampleFile, 'Input', 'Output');

			expect(result.success).toBe(true);
			expect(result.error).toBeUndefined();

			// Verify the hop was added
			const transformation = await parseKettleXml(sampleFile);
			const hops = transformation.transformation.order?.hop
				? Array.isArray(transformation.transformation.order.hop)
					? transformation.transformation.order.hop
					: [transformation.transformation.order.hop]
				: [];

			const hop = hops.find((h: any) => h.from === 'Input' && h.to === 'Output');
			expect(hop).toBeDefined();
		});

		it('should reject hop with non-existent source step', async () => {
			const result = await addTransformationHop(sampleFile, 'NonExistent', 'Input');

			expect(result.success).toBe(false);
			expect(result.error).toContain('not found');
		});

		it('should reject hop with non-existent target step', async () => {
			const result = await addTransformationHop(sampleFile, 'Input', 'NonExistent');

			expect(result.success).toBe(false);
			expect(result.error).toContain('not found');
		});

		it('should reject duplicate hop', async () => {
			// Add a second step
			await addTransformationStep(sampleFile, {
				name: 'Output',
				type: 'SelectValues',
				configuration: {
					fields: [{ name: 'id' }],
				},
				xloc: 200,
				yloc: 100,
			});

			// Add the hop once
			await addTransformationHop(sampleFile, 'Input', 'Output');

			// Try to add it again
			const result = await addTransformationHop(sampleFile, 'Input', 'Output');

			expect(result.success).toBe(false);
			expect(result.error).toContain('already exists');
		});
	});
});
