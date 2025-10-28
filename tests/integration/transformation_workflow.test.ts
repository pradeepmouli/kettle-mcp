
import * as fs from 'fs/promises';
import { tmpdir } from 'os';
import * as path from 'path';
import { parseKettleXml } from '../../src/kettle/xml-utils';
import { addTransformationHop, addTransformationStep } from '../../src/tools/add_transformation_step';
import { removeTransformationHop, removeTransformationStep } from '../../src/tools/remove_transformation_step';
import { updateTransformationStep } from '../../src/tools/update_transformation_step';

describe('Transformation Workflow Integration Tests', () => {
	const testDir = path.join(tmpdir(), 'kettle-mcp-integration', 'transformations');
	const testFile = path.join(testDir, 'etl_workflow.ktr');

	beforeEach(async () => {
		await fs.mkdir(testDir, { recursive: true });

		// Create a realistic transformation file
		const initialTransformation = `<?xml version="1.0" encoding="UTF-8"?>
<transformation>
  <info>
    <name>etl_workflow</name>
    <description>ETL workflow for data processing</description>
    <extended_description/>
    <trans_version/>
    <trans_type>Normal</trans_type>
    <directory>/</directory>
    <parameters>
    </parameters>
    <log>
      <trans-log-table>
        <connection/>
        <schema/>
        <table/>
        <size_limit_lines/>
        <interval/>
        <timeout_days/>
      </trans-log-table>
    </log>
    <maxdate>
      <connection/>
      <table/>
      <field/>
      <offset>0.0</offset>
      <maxdiff>0.0</maxdiff>
    </maxdate>
    <size_rowset>10000</size_rowset>
    <sleep_time_empty>50</sleep_time_empty>
    <sleep_time_full>50</sleep_time_full>
    <unique_connections>N</unique_connections>
    <feedback_shown>Y</feedback_shown>
    <feedback_size>50000</feedback_size>
    <using_thread_priorities>Y</using_thread_priorities>
    <shared_objects_file/>
    <capture_step_performance>N</capture_step_performance>
    <step_performance_capturing_delay>1000</step_performance_capturing_delay>
    <step_performance_capturing_size_limit>100</step_performance_capturing_size_limit>
    <dependencies>
    </dependencies>
    <partitionschemas>
    </partitionschemas>
    <slaveservers>
    </slaveservers>
    <clusterschemas>
    </clusterschemas>
    <created_user>-</created_user>
    <created_date>2025/01/01 00:00:00.000</created_date>
    <modified_user>-</modified_user>
    <modified_date>2025/01/01 00:00:00.000</modified_date>
    <key_for_session_key>H4sIAAAAAAAAAAMAAAAAAAAAAAA=</key_for_session_key>
    <is_key_private>N</is_key_private>
  </info>
  <notepads>
  </notepads>
  <order>
  </order>
  <step>
  </step>
  <step_error_handling>
  </step_error_handling>
  <slave-step-copy-partition-distribution>
  </slave-step-copy-partition-distribution>
  <slave_transformation>N</slave_transformation>
</transformation>`;

		await fs.writeFile(testFile, initialTransformation, 'utf-8');
	});

	afterEach(async () => {
		try {
			await fs.rm(testDir, { recursive: true, force: true });
		} catch (error) {
			// Ignore cleanup errors
		}
	});

	it('should build a complete ETL pipeline from scratch', async () => {
		// Step 1: Add a table input step
		const tableInputResult = await addTransformationStep(testFile, {
			name: 'Read Customer Data',
			type: 'TableInput',
			configuration: {
				connection: 'Production DB',
				sql: 'SELECT customer_id, name, email, created_at FROM customers WHERE active = true',
			},
			xloc: 100,
			yloc: 100,
		});
		expect(tableInputResult.success).toBe(true);

		// Step 2: Add a select values step to filter columns
		const selectResult = await addTransformationStep(testFile, {
			name: 'Select Columns',
			type: 'SelectValues',
			configuration: {
				fields: {
					field: [
						{ name: 'customer_id' },
						{ name: 'name', rename: 'customer_name' },
						{ name: 'email' },
					],
				},
			},
			xloc: 300,
			yloc: 100,
		});
		expect(selectResult.success).toBe(true);

		// Step 3: Add another table input for orders
		const ordersInputResult = await addTransformationStep(testFile, {
			name: 'Read Orders',
			type: 'TableInput',
			configuration: {
				connection: 'Production DB',
				sql: 'SELECT order_id, customer_id, order_date, total FROM orders',
			},
			xloc: 100,
			yloc: 300,
		});
		expect(ordersInputResult.success).toBe(true);

		// Step 4: Add text file output
		const outputResult = await addTransformationStep(testFile, {
			name: 'Write CSV',
			type: 'TextFileOutput',
			configuration: {
				file: {
					name: '/data/output/customers.csv',
				},
				separator: ',',
				enclosure: '"',
			},
			xloc: 500,
			yloc: 100,
		});
		expect(outputResult.success).toBe(true);

		// Step 5: Connect steps with hops
		const hop1 = await addTransformationHop(testFile, 'Read Customer Data', 'Select Columns');
		expect(hop1.success).toBe(true);

		const hop2 = await addTransformationHop(testFile, 'Select Columns', 'Write CSV');
		expect(hop2.success).toBe(true);

		// Step 6: Verify the complete structure
		const transformation = await parseKettleXml(testFile);
		const steps = Array.isArray(transformation.transformation.step)
			? transformation.transformation.step
			: [transformation.transformation.step];

		expect(steps).toHaveLength(4);
		expect(steps.map((s: any) => s.name)).toEqual([
			'Read Customer Data',
			'Select Columns',
			'Read Orders',
			'Write CSV',
		]);

		const hops = transformation.transformation.order?.hop
			? Array.isArray(transformation.transformation.order.hop)
				? transformation.transformation.order.hop
				: [transformation.transformation.order.hop]
			: [];

		expect(hops).toHaveLength(2);
		expect(hops[0].from).toBe('Read Customer Data');
		expect(hops[0].to).toBe('Select Columns');
		expect(hops[1].from).toBe('Select Columns');
		expect(hops[1].to).toBe('Write CSV');
	});

	it('should update multiple steps and maintain consistency', async () => {
		// Setup: Create initial pipeline
		await addTransformationStep(testFile, {
			name: 'Input',
			type: 'TableInput',
			configuration: { connection: 'Test DB', sql: 'SELECT * FROM test' },
			xloc: 100,
			yloc: 100,
		});
		await addTransformationStep(testFile, {
			name: 'Filter',
			type: 'SelectValues',
			configuration: { fields: { field: [{ name: 'id' }] } },
			xloc: 300,
			yloc: 100,
		});
		await addTransformationStep(testFile, {
			name: 'Output',
			type: 'TextFileOutput',
			configuration: { file: { name: '/tmp/output.csv' } },
			xloc: 500,
			yloc: 100,
		});
		await addTransformationHop(testFile, 'Input', 'Filter');
		await addTransformationHop(testFile, 'Filter', 'Output');

		// Update step 1: Change SQL query
		const update1 = await updateTransformationStep(testFile, 'Input', {
			configuration: {
				connection: 'Production DB',
				sql: 'SELECT id, name, email FROM users WHERE active = 1',
			},
		});
		expect(update1.success).toBe(true);

		// Update step 2: Move GUI position
		const update2 = await updateTransformationStep(testFile, 'Filter', {
			xloc: 350,
			yloc: 150,
		});
		expect(update2.success).toBe(true);

		// Update step 3: Change output configuration
		const update3 = await updateTransformationStep(testFile, 'Output', {
			configuration: {
				file: { name: '/data/production/users.csv' },
				separator: '|',
			},
		});
		expect(update3.success).toBe(true);

		// Verify all changes
		const transformation = await parseKettleXml(testFile);
		const steps = Array.isArray(transformation.transformation.step)
			? transformation.transformation.step
			: [transformation.transformation.step];

		const inputStep = steps.find((s: any) => s.name === 'Input');
		expect(inputStep.connection).toBe('Production DB');
		expect(inputStep.sql).toContain('active = 1');

		const filterStep = steps.find((s: any) => s.name === 'Filter');
		expect(filterStep.GUI.xloc).toBe(350);
		expect(filterStep.GUI.yloc).toBe(150);

		const outputStep = steps.find((s: any) => s.name === 'Output');
		expect(outputStep.file.name).toBe('/data/production/users.csv');
		expect(outputStep.separator).toBe('|');

		// Verify hops are still intact
		const hops = transformation.transformation.order?.hop
			? Array.isArray(transformation.transformation.order.hop)
				? transformation.transformation.order.hop
				: [transformation.transformation.order.hop]
			: [];
		expect(hops).toHaveLength(2);
	});

	it('should handle complex removal scenarios', async () => {
		// Setup: Create a branching pipeline
		await addTransformationStep(testFile, {
			name: 'Source',
			type: 'TableInput',
			configuration: { connection: 'DB', sql: 'SELECT * FROM data' },
			xloc: 100,
			yloc: 100,
		});
		await addTransformationStep(testFile, {
			name: 'Branch1',
			type: 'SelectValues',
			configuration: { fields: { field: [{ name: 'col1' }] } },
			xloc: 300,
			yloc: 50,
		});
		await addTransformationStep(testFile, {
			name: 'Branch2',
			type: 'SelectValues',
			configuration: { fields: { field: [{ name: 'col2' }] } },
			xloc: 300,
			yloc: 150,
		});
		await addTransformationStep(testFile, {
			name: 'Output1',
			type: 'TextFileOutput',
			configuration: { file: { name: '/tmp/out1.csv' } },
			xloc: 500,
			yloc: 50,
		});
		await addTransformationStep(testFile, {
			name: 'Output2',
			type: 'TextFileOutput',
			configuration: { file: { name: '/tmp/out2.csv' } },
			xloc: 500,
			yloc: 150,
		});

		// Create connections
		await addTransformationHop(testFile, 'Source', 'Branch1');
		await addTransformationHop(testFile, 'Source', 'Branch2');
		await addTransformationHop(testFile, 'Branch1', 'Output1');
		await addTransformationHop(testFile, 'Branch2', 'Output2');

		// Remove a middle step (Branch1) - should auto-remove connected hops
		const removeResult = await removeTransformationStep(testFile, 'Branch1');
		expect(removeResult.success).toBe(true);

		// Verify Branch1 is gone
		const transformation = await parseKettleXml(testFile);
		const steps = Array.isArray(transformation.transformation.step)
			? transformation.transformation.step
			: [transformation.transformation.step];

		expect(steps.find((s: any) => s.name === 'Branch1')).toBeUndefined();
		expect(steps.find((s: any) => s.name === 'Source')).toBeDefined();
		expect(steps.find((s: any) => s.name === 'Branch2')).toBeDefined();

		// Verify hops to/from Branch1 are removed
		const hops = transformation.transformation.order?.hop
			? Array.isArray(transformation.transformation.order.hop)
				? transformation.transformation.order.hop
				: [transformation.transformation.order.hop]
			: [];

		expect(hops.find((h: any) => h.from === 'Branch1' || h.to === 'Branch1')).toBeUndefined();
		expect(hops.find((h: any) => h.from === 'Source' && h.to === 'Branch2')).toBeDefined();
	});

	it('should maintain backup files throughout workflow', async () => {
		// Add step 1
		await addTransformationStep(testFile, {
			name: 'Step1',
			type: 'TableInput',
			configuration: { connection: 'DB', sql: 'SELECT * FROM t1' },
			xloc: 100,
			yloc: 100,
		});

		let backupExists = await fs
			.access(`${testFile}.backup`)
			.then(() => true)
			.catch(() => false);
		expect(backupExists).toBe(true);

		// Add step 2
		await addTransformationStep(testFile, {
			name: 'Step2',
			type: 'SelectValues',
			configuration: { fields: { field: [{ name: 'id' }] } },
			xloc: 300,
			yloc: 100,
		});

		backupExists = await fs
			.access(`${testFile}.backup`)
			.then(() => true)
			.catch(() => false);
		expect(backupExists).toBe(true);

		// Update step
		await updateTransformationStep(testFile, 'Step1', {
			xloc: 200,
		});

		backupExists = await fs
			.access(`${testFile}.backup`)
			.then(() => true)
			.catch(() => false);
		expect(backupExists).toBe(true);

		// Remove step
		await removeTransformationStep(testFile, 'Step2');

		backupExists = await fs
			.access(`${testFile}.backup`)
			.then(() => true)
			.catch(() => false);
		expect(backupExists).toBe(true);
	});

	it('should handle error recovery and rollback', async () => {
		// Add valid step
		const result1 = await addTransformationStep(testFile, {
			name: 'ValidStep',
			type: 'TableInput',
			configuration: { connection: 'DB', sql: 'SELECT * FROM valid' },
			xloc: 100,
			yloc: 100,
		});
		expect(result1.success).toBe(true);

		// Try to add duplicate step (should fail)
		const result2 = await addTransformationStep(testFile, {
			name: 'ValidStep',
			type: 'SelectValues',
			configuration: { fields: { field: [{ name: 'id' }] } },
			xloc: 300,
			yloc: 100,
		});
		expect(result2.success).toBe(false);
		expect(result2.error).toContain('already exists');

		// Verify original step is still there and unchanged
		const transformation = await parseKettleXml(testFile);
		const steps = Array.isArray(transformation.transformation.step)
			? transformation.transformation.step
			: [transformation.transformation.step];

		expect(steps).toHaveLength(1);
		expect(steps[0].name).toBe('ValidStep');
		expect(steps[0].type).toBe('TableInput');

		// Try to update non-existent step
		const result3 = await updateTransformationStep(testFile, 'NonExistent', {
			xloc: 500,
		});
		expect(result3.success).toBe(false);
		expect(result3.error).toContain('not found');

		// Verify file is still valid
		const transformation2 = await parseKettleXml(testFile);
		expect(transformation2.transformation).toBeDefined();
	});

	it('should handle large transformations with many steps', async () => {
		// Create 20 steps in a linear pipeline
		const stepCount = 20;
		for (let i = 1; i <= stepCount; i++) {
			const result = await addTransformationStep(testFile, {
				name: `Step${i}`,
				type: i % 2 === 0 ? 'SelectValues' : 'TableInput',
				configuration:
					i % 2 === 0
						? { fields: { field: [{ name: 'col1' }] } }
						: { connection: 'DB', sql: `SELECT * FROM table${i}` },
				xloc: i * 100,
				yloc: 100,
			});
			expect(result.success).toBe(true);
		}

		// Connect them in sequence
		for (let i = 1; i < stepCount; i++) {
			const result = await addTransformationHop(testFile, `Step${i}`, `Step${i + 1}`);
			expect(result.success).toBe(true);
		}

		// Verify all steps and hops exist
		const transformation = await parseKettleXml(testFile);
		const steps = Array.isArray(transformation.transformation.step)
			? transformation.transformation.step
			: [transformation.transformation.step];

		expect(steps).toHaveLength(stepCount);

		const hops = transformation.transformation.order?.hop
			? Array.isArray(transformation.transformation.order.hop)
				? transformation.transformation.order.hop
				: [transformation.transformation.order.hop]
			: [];

		expect(hops).toHaveLength(stepCount - 1);

		// Update a middle step
		const updateResult = await updateTransformationStep(testFile, 'Step10', {
			xloc: 1500,
			yloc: 200,
		});
		expect(updateResult.success).toBe(true);

		// Remove a middle step
		const removeResult = await removeTransformationStep(testFile, 'Step15');
		expect(removeResult.success).toBe(true);

		// Verify final state
		const finalTransformation = await parseKettleXml(testFile);
		const finalSteps = Array.isArray(finalTransformation.transformation.step)
			? finalTransformation.transformation.step
			: [finalTransformation.transformation.step];

		expect(finalSteps).toHaveLength(stepCount - 1);
		expect(finalSteps.find((s: any) => s.name === 'Step15')).toBeUndefined();
	});
});
