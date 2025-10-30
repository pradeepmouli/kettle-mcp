
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

		// T104: Verify all 20 Phase 5 output step types are discoverable
		it('should discover all Phase 5 output step types (23+ total)', async () => {
			const outputSteps = await listStepTypesTool('Output');

			// Should have at least 23 output types (3 existing + 20 from Phase 5)
			expect(outputSteps.length).toBeGreaterThanOrEqual(23);

			// Verify all Phase 5 step types are present
			const phase5StepTypes = [
				'InsertUpdate', 'Update', 'Delete', 'SynchronizeAfterMerge',
				'MySQLBulkLoader', 'PostgreSQLBulkLoader',
				'ExcelOutput', 'AccessOutput', 'PropertyOutput', 'ParquetOutput',
				'XMLOutput', 'YAMLOutput',
				'KafkaProducer', 'JMSOutput', 'MQOutput', 'MQTTPublisher',
				'S3CSVOutput', 'MongoDbOutput', 'CassandraOutput', 'ElasticsearchBulkInsert'
			];

			const foundStepTypes = outputSteps.map(s => s.typeId);
			phase5StepTypes.forEach(expectedType => {
				expect(foundStepTypes).toContain(expectedType);
			});
		});

		// T145: Verify all Phase 7 lookup step types are discoverable
		it('should discover all Phase 7 lookup step types (5 total)', async () => {
			const lookupSteps = await listStepTypesTool('Lookup');

			// Should have at least 5 lookup types from Phase 7
			expect(lookupSteps.length).toBeGreaterThanOrEqual(5);

			// Verify all Phase 7 lookup step types are present
			const phase7LookupTypes = [
				'StreamLookup', 'DatabaseLookup', 'FuzzyMatch', 
				'DimensionLookup', 'CombinationLookup'
			];

			const foundStepTypes = lookupSteps.map(s => s.typeId);
			phase7LookupTypes.forEach(expectedType => {
				expect(foundStepTypes).toContain(expectedType);
			});

			// Verify all lookup steps have proper metadata
			lookupSteps.forEach(step => {
				expect(step).toHaveProperty('typeId');
				expect(step).toHaveProperty('category', 'Lookup');
				expect(step).toHaveProperty('displayName');
				expect(step).toHaveProperty('description');
				expect(step.description.length).toBeGreaterThan(50);
				expect(step).toHaveProperty('tags');
				expect(step.tags.length).toBeGreaterThanOrEqual(3);
			});
		});

		// T145: Verify all Phase 7 join step types are discoverable
		it('should discover all Phase 7 join step types (2+ total)', async () => {
			const joinSteps = await listStepTypesTool('Join');

			// Should have at least 2 join types from Phase 7
			expect(joinSteps.length).toBeGreaterThanOrEqual(2);

			// Verify Phase 7 join step types are present
			const phase7JoinTypes = ['MergeRows', 'Append'];

			const foundStepTypes = joinSteps.map(s => s.typeId);
			phase7JoinTypes.forEach(expectedType => {
				expect(foundStepTypes).toContain(expectedType);
			});

			// Verify all join steps have proper metadata
			joinSteps.forEach(step => {
				expect(step).toHaveProperty('typeId');
				expect(step).toHaveProperty('category', 'Join');
				expect(step).toHaveProperty('displayName');
				expect(step).toHaveProperty('description');
				expect(step.description.length).toBeGreaterThan(50);
				expect(step).toHaveProperty('tags');
				expect(step.tags.length).toBeGreaterThanOrEqual(3);
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
