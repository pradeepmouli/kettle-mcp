
import {
	getJobEntryTypeSchemaTool,
	getStepTypeSchematool,
	listJobEntryTypesTool,
	listStepTypesTool,
} from '../../src/tools/discovery_tools';

describe('Discovery Tools Contract Tests', () => {
	describe('listStepTypesTool', () => {
		it('should list all step types without filter', async () => {
			const result = await listStepTypesTool();

			expect(Array.isArray(result)).toBe(true);
			expect(result.length).toBeGreaterThan(0);

			const firstStep = result[0];
			expect(firstStep).toHaveProperty('typeId');
			expect(firstStep).toHaveProperty('category');
			expect(firstStep).toHaveProperty('displayName');
			expect(firstStep).toHaveProperty('description');
			expect(firstStep).toHaveProperty('tags');
		});

		it('should filter step types by category', async () => {
			const result = await listStepTypesTool('Input');

			expect(Array.isArray(result)).toBe(true);
			result.forEach((step) => {
				expect(step.category).toBe('Input');
			});
		});

		// T038: Verify all 30 Phase 3 input step types are discoverable
		it('should discover all Phase 3 input step types (35+ total)', async () => {
			const inputSteps = await listStepTypesTool('Input');

			// Should have at least 35 input types (5 existing + 30 from Phase 3)
			expect(inputSteps.length).toBeGreaterThanOrEqual(35);

			// Verify all Phase 3 step types are present
			const phase3StepTypes = [
				'MySQLBulkLoader', 'PostgreSQLBulkLoader', 'OracleBulkLoader', 'SQLServerBulkLoader',
				'MonetDBBulkLoader', 'VerticaBulkLoader', 'DatabaseJoin', 'GetTableNames',
				'CSVInput', 'FixedFileInput', 'AccessInput', 'PropertyInput', 'LDIFInput', 
				'YAMLInput', 'ParquetInput', 'KafkaConsumer', 'JMSInput', 'MQInput', 
				'MQTTSubscriber', 'SOAPInput', 'HTTPClient', 'WebServiceLookup',
				'S3CSVInput', 'MongoDbInput', 'CassandraInput', 'ElasticsearchInput', 
				'SalesforceInput', 'GetXMLData', 'RSSInput', 'LDAPInput'
			];

			const foundStepTypes = inputSteps.map(s => s.typeId);
			phase3StepTypes.forEach(expectedType => {
				expect(foundStepTypes).toContain(expectedType);
			});
		});
	});

	describe('getStepTypeSchematool', () => {
		it('should return schema for TableInput step type', async () => {
			const result = await getStepTypeSchematool('TableInput');

			expect(result).toHaveProperty('typeId', 'TableInput');
			expect(result).toHaveProperty('category');
			expect(result).toHaveProperty('displayName');
			expect(result).toHaveProperty('description');
			expect(result).toHaveProperty('schema');
			expect(typeof result.schema).toBe('object');
		});

		it('should throw error for unknown step type', async () => {
			await expect(getStepTypeSchematool('UnknownStepType')).rejects.toThrow(
				'Unknown step type: UnknownStepType'
			);
		});
	});

	describe('listJobEntryTypesTool', () => {
		it('should list all job entry types without filter', async () => {
			const result = await listJobEntryTypesTool();

			expect(Array.isArray(result)).toBe(true);
			expect(result.length).toBeGreaterThan(0);

			const firstEntry = result[0];
			expect(firstEntry).toHaveProperty('typeId');
			expect(firstEntry).toHaveProperty('category');
			expect(firstEntry).toHaveProperty('displayName');
			expect(firstEntry).toHaveProperty('description');
			expect(firstEntry).toHaveProperty('tags');
		});

		it('should filter job entry types by category', async () => {
			const result = await listJobEntryTypesTool('General');

			expect(Array.isArray(result)).toBe(true);
			result.forEach((entry) => {
				expect(entry.category).toBe('General');
			});
		});
	});

	describe('getJobEntryTypeSchemaTool', () => {
		it('should return schema for START job entry type', async () => {
			const result = await getJobEntryTypeSchemaTool('START');

			expect(result).toHaveProperty('typeId', 'START');
			expect(result).toHaveProperty('category');
			expect(result).toHaveProperty('displayName');
			expect(result).toHaveProperty('description');
			expect(result).toHaveProperty('schema');
			expect(typeof result.schema).toBe('object');
		});

		it('should throw error for unknown job entry type', async () => {
			await expect(getJobEntryTypeSchemaTool('UnknownEntryType')).rejects.toThrow(
				'Unknown job entry type: UnknownEntryType'
			);
		});
	});
});
