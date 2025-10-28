
import * as fs from 'fs/promises';
import { tmpdir } from 'os';
import * as path from 'path';
import { parseKettleXml } from '../../src/kettle/xml-utils';
import { addTransformationHop, addTransformationStep } from '../../src/tools/add_transformation_step';
import { removeTransformationHop, removeTransformationStep } from '../../src/tools/remove_transformation_step';
import { updateTransformationStep } from '../../src/tools/update_transformation_step';

describe('Update and Remove Transformation Tools Contract Tests', () => {
	const testDir = path.join(tmpdir(), 'kettle-mcp-tests', 'transformations-update-remove');
	const sampleFile = path.join(testDir, 'test_transformation.ktr');

	beforeEach(async () => {
		// Create test directory
		await fs.mkdir(testDir, { recursive: true });

		// Create a transformation with multiple steps and hops for testing
		const transformationWithSteps = `<?xml version="1.0" encoding="UTF-8"?>
<transformation>
  <info>
    <name>test_transformation</name>
    <description>Test transformation</description>
    <trans_version/>
    <trans_type>Normal</trans_type>
    <directory>/</directory>
  </info>
  <order>
    <hop>
      <from>Input</from>
      <to>Transform</to>
      <enabled>Y</enabled>
    </hop>
    <hop>
      <from>Transform</from>
      <to>Output</to>
      <enabled>Y</enabled>
    </hop>
  </order>
  <step>
    <name>Input</name>
    <type>TableInput</type>
    <description>Read from database</description>
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
  <step>
    <name>Transform</name>
    <type>SelectValues</type>
    <description/>
    <distribute>Y</distribute>
    <custom_distribution/>
    <copies>1</copies>
    <partitioning>
      <method>none</method>
      <schema_name/>
    </partitioning>
    <fields>
      <field>
        <name>id</name>
      </field>
      <field>
        <name>email</name>
      </field>
    </fields>
    <GUI>
      <xloc>200</xloc>
      <yloc>100</yloc>
      <draw>Y</draw>
    </GUI>
  </step>
  <step>
    <name>Output</name>
    <type>SelectValues</type>
    <description/>
    <distribute>Y</distribute>
    <custom_distribution/>
    <copies>1</copies>
    <partitioning>
      <method>none</method>
      <schema_name/>
    </partitioning>
    <fields>
      <field>
        <name>id</name>
      </field>
    </fields>
    <GUI>
      <xloc>300</xloc>
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

		await fs.writeFile(sampleFile, transformationWithSteps, 'utf-8');
	});

	afterEach(async () => {
		// Clean up test files
		try {
			await fs.rm(testDir, { recursive: true, force: true });
		} catch (error) {
			// Ignore cleanup errors
		}
	});

	describe('updateTransformationStep', () => {
		it('should update step configuration', async () => {
			const result = await updateTransformationStep(sampleFile, 'Input', {
				configuration: {
					connection: 'new_db',
					sql: 'SELECT * FROM products',
					limit: 100,
				},
			});

			expect(result.success).toBe(true);
			expect(result.error).toBeUndefined();

			// Verify the configuration was updated
			const transformation = await parseKettleXml(sampleFile);
			const steps = Array.isArray(transformation.transformation.step)
				? transformation.transformation.step
				: [transformation.transformation.step];

			const updatedStep = steps.find((s: any) => s.name === 'Input');
			expect(updatedStep.connection).toBe('new_db');
			expect(updatedStep.sql).toBe('SELECT * FROM products');
		});

		it('should update step coordinates', async () => {
			const result = await updateTransformationStep(sampleFile, 'Transform', {
				xloc: 250,
				yloc: 150,
			});

			expect(result.success).toBe(true);

			// Verify coordinates were updated
			const transformation = await parseKettleXml(sampleFile);
			const steps = Array.isArray(transformation.transformation.step)
				? transformation.transformation.step
				: [transformation.transformation.step];

			const updatedStep = steps.find((s: any) => s.name === 'Transform');
			expect(updatedStep.GUI.xloc).toBe(250);
			expect(updatedStep.GUI.yloc).toBe(150);
		});

		it('should update both configuration and coordinates', async () => {
			const result = await updateTransformationStep(sampleFile, 'Input', {
				configuration: {
					connection: 'new_db',
					sql: 'SELECT * FROM products',
					limit: 100,
				},
				xloc: 150,
				yloc: 200,
			});

			expect(result.success).toBe(true);

			// Verify both updates
			const transformation = await parseKettleXml(sampleFile);
			const steps = Array.isArray(transformation.transformation.step)
				? transformation.transformation.step
				: [transformation.transformation.step];

			const updatedStep = steps.find((s: any) => s.name === 'Input');
			expect(updatedStep.connection).toBe('new_db');
			expect(updatedStep.sql).toBe('SELECT * FROM products');
			expect(updatedStep.limit).toBe(100);
			expect(updatedStep.GUI.xloc).toBe(150);
			expect(updatedStep.GUI.yloc).toBe(200);
		});

		it('should reject update for non-existent step', async () => {
			const result = await updateTransformationStep(sampleFile, 'NonExistent', {
				xloc: 400,
			});

			expect(result.success).toBe(false);
			expect(result.error).toContain('not found');
		});

		it('should reject invalid configuration update', async () => {
			const result = await updateTransformationStep(sampleFile, 'Input', {
				configuration: {
					// Invalid: connection is required and we're trying to set it to undefined/null
					connection: '',  // Empty string should fail TableInput validation
					sql: '',  // Empty string should also fail
				},
			});

			expect(result.success).toBe(false);
			expect(result.error).toBeDefined();
		});

		it('should create backup file before update', async () => {
			await updateTransformationStep(sampleFile, 'Transform', {
				xloc: 220,
			});

			const backupFile = `${sampleFile}.backup`;
			const backupExists = await fs
				.access(backupFile)
				.then(() => true)
				.catch(() => false);

			expect(backupExists).toBe(true);
		});
	});

	describe('removeTransformationStep', () => {
		it('should remove a step', async () => {
			const result = await removeTransformationStep(sampleFile, 'Output');

			expect(result.success).toBe(true);
			expect(result.error).toBeUndefined();

			// Verify the step was removed
			const transformation = await parseKettleXml(sampleFile);
			const steps = Array.isArray(transformation.transformation.step)
				? transformation.transformation.step
				: [transformation.transformation.step];

			const removedStep = steps.find((s: any) => s.name === 'Output');
			expect(removedStep).toBeUndefined();
			// Verify other steps still exist
			const inputStep = steps.find((s: any) => s.name === 'Input');
			expect(inputStep).toBeDefined();
		});

		it('should reject removal of non-existent step', async () => {
			const result = await removeTransformationStep(sampleFile, 'NonExistent');

			expect(result.success).toBe(false);
			expect(result.error).toContain('not found');
		});

		it('should create backup file before removal', async () => {
			await removeTransformationStep(sampleFile, 'Output');

			const backupFile = `${sampleFile}.backup`;
			const backupExists = await fs
				.access(backupFile)
				.then(() => true)
				.catch(() => false);

			expect(backupExists).toBe(true);
		});
	});

	describe('removeTransformationHop', () => {
		it('should reject removal of non-existent hop', async () => {
			const result = await removeTransformationHop(sampleFile, 'Input', 'Output');

			expect(result.success).toBe(false);
			expect(result.error).toContain('not found');
		});
	});
});
