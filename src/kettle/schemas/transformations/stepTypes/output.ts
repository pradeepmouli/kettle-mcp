import { z } from 'zod';
import { StepCategory, type StepType } from './types.js';

/**
 * Configuration schema for TextFileOutput step
 */
const textFileOutputConfigSchema = z.object({
	file: z.object({
		name: z.string().describe('Output file path'),
	}).optional(),
	separator: z.string().optional().describe('Field separator'),
	enclosure: z.string().optional().describe('Field enclosure character'),
	header: z.boolean().optional().describe('Include header row'),
	footer: z.boolean().optional().describe('Include footer'),
	format: z.string().optional().describe('File format'),
	encoding: z.string().optional().describe('File encoding'),
	append: z.boolean().optional().describe('Append to existing file'),
});

/**
 * Configuration schema for TableOutput step
 */
const tableOutputConfigSchema = z.object({
	connection: z.string().describe('Database connection name'),
	schema: z.string().optional().describe('Database schema'),
	table: z.string().describe('Target table name'),
	commitSize: z.number().default(1000).describe('Number of rows per commit'),
	truncateTable: z.boolean().default(false).describe('Truncate table before insert'),
	specifyFields: z.boolean().default(false).describe('Specify field mappings'),
	fields: z.array(z.object({
		streamName: z.string(),
		columnName: z.string(),
	})).optional().describe('Field to column mappings'),
});

/**
 * Configuration schema for JSONOutput step
 */
const jsonOutputConfigSchema = z.object({
	filename: z.string().describe('Output JSON file path'),
	jsonBloc: z.string().default('data').describe('Root element name'),
	encoding: z.string().default('UTF-8').describe('File encoding'),
	outputValue: z.string().optional().describe('Field containing JSON value'),
});

/**
 * Configuration schema for InsertUpdate step
 */
const insertUpdateConfigSchema = z.object({
	connection: z.string().describe('Database connection name'),
	schema: z.string().optional().describe('Database schema'),
	table: z.string().describe('Target table name'),
	commitSize: z.number().default(1000).describe('Number of rows per commit'),
	updateLookup: z.array(z.object({
		schemaField: z.string(),
		streamField: z.string(),
	})).describe('Key fields for update lookup'),
	updateFields: z.array(z.object({
		tableName: z.string(),
		streamName: z.string(),
	})).optional().describe('Fields to update'),
});

/**
 * Configuration schema for Update step
 */
const updateConfigSchema = z.object({
	connection: z.string().describe('Database connection name'),
	schema: z.string().optional().describe('Database schema'),
	table: z.string().describe('Target table name'),
	commitSize: z.number().default(100).describe('Number of rows per commit'),
	keyLookup: z.array(z.object({
		keyStream: z.string(),
		keyCondition: z.enum(['=', '<>', '<', '<=', '>', '>=', 'LIKE', 'BETWEEN', 'IS NULL', 'IS NOT NULL']),
	})).describe('Key fields for update condition'),
	updateFields: z.array(z.object({
		tableName: z.string(),
		streamName: z.string(),
	})).describe('Fields to update'),
});

/**
 * Configuration schema for Delete step
 */
const deleteConfigSchema = z.object({
	connection: z.string().describe('Database connection name'),
	schema: z.string().optional().describe('Database schema'),
	table: z.string().describe('Target table name'),
	commitSize: z.number().default(100).describe('Number of rows per commit'),
	keyLookup: z.array(z.object({
		keyStream: z.string(),
		keyCondition: z.enum(['=', '<>', '<', '<=', '>', '>=', 'LIKE', 'BETWEEN', 'IS NULL', 'IS NOT NULL']),
	})).describe('Key fields for delete condition'),
});

/**
 * Configuration schema for SynchronizeAfterMerge step
 */
const synchronizeAfterMergeConfigSchema = z.object({
	connection: z.string().describe('Database connection name'),
	schema: z.string().optional().describe('Database schema'),
	table: z.string().describe('Target table name'),
	commitSize: z.number().default(100).describe('Number of rows per commit'),
	operationFieldName: z.string().describe('Field name containing operation type'),
	keyFields: z.array(z.string()).describe('Key fields for matching records'),
	updateFields: z.array(z.string()).describe('Fields to update'),
});

/**
 * Configuration schema for MySQL bulk loader (output variant)
 */
const mysqlBulkLoaderOutputConfigSchema = z.object({
	connection: z.string().describe('MySQL database connection name'),
	schema: z.string().optional().describe('Database schema'),
	table: z.string().describe('Target table name'),
	encoding: z.string().default('UTF-8').describe('Character encoding'),
	delimiter: z.string().default(',').describe('Field delimiter'),
	enclosure: z.string().default('"').describe('Field enclosure character'),
	bulkSize: z.number().default(10000).describe('Number of rows per bulk load'),
	replaceData: z.boolean().default(false).describe('Use REPLACE instead of INSERT'),
});

/**
 * Configuration schema for PostgreSQL bulk loader (output variant)
 */
const postgreSQLBulkLoaderOutputConfigSchema = z.object({
	connection: z.string().describe('PostgreSQL database connection name'),
	schema: z.string().optional().describe('Database schema'),
	table: z.string().describe('Target table name'),
	truncateTable: z.boolean().default(false).describe('Truncate table before loading'),
	delimiter: z.string().default(',').describe('Field delimiter'),
	enclosure: z.string().default('"').describe('Field enclosure character'),
	fields: z.array(z.object({
		streamField: z.string(),
		tableField: z.string(),
	})).optional().describe('Field mappings'),
});

/**
 * Configuration schema for ExcelOutput step
 */
const excelOutputConfigSchema = z.object({
	filename: z.string().describe('Output Excel file path'),
	sheetName: z.string().default('Sheet1').describe('Worksheet name'),
	appendToExisting: z.boolean().default(false).describe('Append to existing file'),
	createParentFolder: z.boolean().default(false).describe('Create parent folders if needed'),
	header: z.boolean().default(true).describe('Include header row'),
	footer: z.boolean().default(false).describe('Include footer row'),
	startingCell: z.string().default('A1').describe('Starting cell for data output'),
});

/**
 * Configuration schema for AccessOutput step
 */
const accessOutputConfigSchema = z.object({
	filename: z.string().describe('MS Access database file path'),
	table: z.string().describe('Target table name'),
	createTable: z.boolean().default(false).describe('Create table if not exists'),
	truncateTable: z.boolean().default(false).describe('Truncate table before insert'),
	commitSize: z.number().default(1000).describe('Number of rows per commit'),
});

/**
 * Configuration schema for PropertyOutput step
 */
const propertyOutputConfigSchema = z.object({
	filename: z.string().describe('Output properties file path'),
	keyField: z.string().describe('Field containing property keys'),
	valueField: z.string().describe('Field containing property values'),
	encoding: z.string().default('UTF-8').describe('File encoding'),
	comment: z.string().optional().describe('Comment line in properties file'),
	appendToFile: z.boolean().default(false).describe('Append to existing file'),
});

/**
 * Configuration schema for ParquetOutput step
 */
const parquetOutputConfigSchema = z.object({
	filename: z.string().describe('Output Parquet file path'),
	compressionType: z.enum(['UNCOMPRESSED', 'SNAPPY', 'GZIP', 'LZO', 'BROTLI', 'LZ4', 'ZSTD']).default('SNAPPY').describe('Compression codec'),
	version: z.enum(['1.0', '2.0']).default('1.0').describe('Parquet format version'),
	rowGroupSize: z.number().default(134217728).describe('Row group size in bytes'),
	pageSize: z.number().default(1048576).describe('Page size in bytes'),
	fields: z.array(z.object({
		name: z.string(),
		type: z.enum(['String', 'Integer', 'Long', 'Double', 'Boolean', 'Date', 'Timestamp']),
	})).describe('Field definitions and types'),
});

/**
 * Configuration schema for XMLOutput step
 */
const xmlOutputConfigSchema = z.object({
	filename: z.string().describe('Output XML file path'),
	encoding: z.string().default('UTF-8').describe('XML encoding'),
	mainElement: z.string().default('Rows').describe('Root element name'),
	rowElement: z.string().default('Row').describe('Row element name'),
	zipped: z.boolean().default(false).describe('Compress output with gzip'),
	splitEvery: z.number().optional().describe('Split into multiple files after N rows'),
	omitNullValues: z.boolean().default(false).describe('Omit null values from output'),
});

/**
 * Configuration schema for YAMLOutput step
 */
const yamlOutputConfigSchema = z.object({
	filename: z.string().describe('Output YAML file path'),
	encoding: z.string().default('UTF-8').describe('File encoding'),
	appendToFile: z.boolean().default(false).describe('Append to existing file'),
	createParentFolder: z.boolean().default(false).describe('Create parent folders if needed'),
});

/**
 * Configuration schema for KafkaProducer step
 */
const kafkaProducerConfigSchema = z.object({
	bootstrapServers: z.string().describe('Kafka bootstrap servers (host:port,host:port)'),
	topic: z.string().describe('Kafka topic name'),
	keyField: z.string().optional().describe('Field to use as message key'),
	messageField: z.string().describe('Field containing message payload'),
	compressionType: z.enum(['none', 'gzip', 'snappy', 'lz4', 'zstd']).default('none').describe('Message compression type'),
	batchSize: z.number().default(16384).describe('Batch size in bytes'),
});

/**
 * Configuration schema for JMSOutput step
 */
const jmsOutputConfigSchema = z.object({
	connectionFactory: z.string().describe('JMS connection factory JNDI name'),
	destination: z.string().describe('JMS destination (queue or topic) name'),
	destinationType: z.enum(['queue', 'topic']).default('queue').describe('Destination type'),
	messageField: z.string().describe('Field containing message payload'),
	jndiUrl: z.string().optional().describe('JNDI provider URL'),
	username: z.string().optional().describe('JMS username'),
	password: z.string().optional().describe('JMS password'),
});

/**
 * Configuration schema for MQOutput step
 */
const mqOutputConfigSchema = z.object({
	queueManager: z.string().describe('MQ queue manager name'),
	queueName: z.string().describe('MQ queue name'),
	hostname: z.string().describe('MQ server hostname'),
	port: z.number().default(1414).describe('MQ server port'),
	channel: z.string().describe('MQ channel name'),
	messageField: z.string().describe('Field containing message payload'),
	messageFormat: z.string().default('MQSTR').describe('Message format'),
});

/**
 * Configuration schema for MQTTPublisher step
 */
const mqttPublisherConfigSchema = z.object({
	broker: z.string().describe('MQTT broker URL (tcp://host:port)'),
	topic: z.string().describe('MQTT topic to publish to'),
	qos: z.enum(['0', '1', '2']).default('1').describe('Quality of Service level'),
	clientId: z.string().describe('MQTT client ID'),
	messageField: z.string().describe('Field containing message payload'),
	retain: z.boolean().default(false).describe('Set retain flag on messages'),
});

/**
 * Configuration schema for S3CSVOutput step
 */
const s3CSVOutputConfigSchema = z.object({
	awsAccessKey: z.string().describe('AWS access key ID'),
	awsSecretKey: z.string().describe('AWS secret access key'),
	bucket: z.string().describe('S3 bucket name'),
	key: z.string().describe('S3 object key (file path)'),
	region: z.string().default('us-east-1').describe('AWS region'),
	delimiter: z.string().default(',').describe('CSV delimiter'),
	enclosure: z.string().default('"').describe('Field enclosure character'),
	includeHeader: z.boolean().default(true).describe('Include header row'),
	encoding: z.string().default('UTF-8').describe('Character encoding'),
});

/**
 * Configuration schema for MongoDbOutput step
 */
const mongoDbOutputConfigSchema = z.object({
	hostname: z.string().describe('MongoDB hostname'),
	port: z.number().default(27017).describe('MongoDB port'),
	database: z.string().describe('Database name'),
	collection: z.string().describe('Collection name'),
	operation: z.enum(['insert', 'update', 'upsert', 'delete']).default('insert').describe('Database operation'),
	upsert: z.boolean().default(false).describe('Use upsert for inserts'),
	batchSize: z.number().default(100).describe('Number of documents per batch'),
});

/**
 * Configuration schema for CassandraOutput step
 */
const cassandraOutputConfigSchema = z.object({
	hostname: z.string().describe('Cassandra hostname'),
	port: z.number().default(9042).describe('Cassandra port'),
	keyspace: z.string().describe('Keyspace name'),
	table: z.string().describe('Table name'),
	consistencyLevel: z.enum(['ONE', 'QUORUM', 'ALL', 'LOCAL_QUORUM']).default('ONE').describe('Write consistency level'),
	batchSize: z.number().default(100).describe('Number of rows per batch'),
	ttl: z.number().optional().describe('Time to live in seconds'),
});

/**
 * Configuration schema for ElasticsearchBulkInsert step
 */
const elasticsearchBulkInsertConfigSchema = z.object({
	hostname: z.string().describe('Elasticsearch hostname'),
	port: z.number().default(9200).describe('Elasticsearch port'),
	index: z.string().describe('Index name'),
	type: z.string().optional().describe('Document type (deprecated in ES 7+)'),
	idField: z.string().optional().describe('Field to use as document ID'),
	batchSize: z.number().default(1000).describe('Number of documents per bulk request'),
	stopOnError: z.boolean().default(true).describe('Stop processing on error'),
});

/**
 * Output step types registry
 */
export const OUTPUT_STEPS: Record<string, StepType> = {
	TextFileOutput: {
		typeId: 'TextFileOutput',
		category: StepCategory.OUTPUT,
		displayName: 'Text File Output',
		description: 'Write data to delimited text files in CSV, TSV, or custom formats. Supports header/footer generation, field enclosure, custom separators, encoding selection, and compression. Use for exporting data to flat files, generating reports, or creating data feeds for external systems. Handles file append and split modes.',
		tags: ['file', 'output', 'csv', 'text', 'write'],
		configurationSchema: textFileOutputConfigSchema,
		examples: [
			{
				name: 'Export Customer Data to CSV',
				description: 'Write customer records to a CSV file with headers',
				configuration: {
					file: { name: '/exports/customers.csv' },
					separator: ',',
					enclosure: '"',
					header: true,
					footer: false,
					encoding: 'UTF-8',
					append: false,
				},
			},
			{
				name: 'Append Log Entries to TSV',
				description: 'Append log data to tab-separated file',
				configuration: {
					file: { name: '/logs/application.tsv' },
					separator: '\t',
					header: false,
					encoding: 'UTF-8',
					append: true,
				},
			},
		],
	},
	TableOutput: {
		typeId: 'TableOutput',
		category: StepCategory.OUTPUT,
		displayName: 'Table Output',
		description: 'Write data to database tables using INSERT or UPDATE statements. Supports batch commits, field mapping, and table truncation. Handles transaction management and rollback on errors. Use for loading data warehouses, updating operational databases, or persisting transformation results to relational databases.',
		tags: ['database', 'output', 'sql', 'write'],
		configurationSchema: tableOutputConfigSchema,
		examples: [
			{
				name: 'Load Sales Data',
				description: 'Insert sales records into PostgreSQL database',
				configuration: {
					connection: 'PostgreSQL_DataWarehouse',
					schema: 'public',
					table: 'sales_fact',
					commitSize: 1000,
					truncateTable: false,
					specifyFields: true,
					fields: [
						{ streamName: 'sale_id', columnName: 'id' },
						{ streamName: 'product', columnName: 'product_name' },
						{ streamName: 'amount', columnName: 'sale_amount' },
					],
				},
			},
			{
				name: 'Truncate and Load Staging Table',
				description: 'Truncate staging table and load fresh data',
				configuration: {
					connection: 'MySQL_Staging',
					table: 'staging_customers',
					commitSize: 5000,
					truncateTable: true,
					specifyFields: false,
				},
			},
		],
	},
	JSONOutput: {
		typeId: 'JSONOutput',
		category: StepCategory.OUTPUT,
		displayName: 'JSON Output',
		description: 'Write data to JSON files with configurable structure and encoding. Generates well-formed JSON documents from row data. Supports nested structures and arrays. Use for creating API payloads, configuration files, or NoSQL database imports.',
		tags: ['json', 'output', 'file', 'write'],
		configurationSchema: jsonOutputConfigSchema,
		examples: [
			{
				name: 'Generate API Payload',
				description: 'Create JSON file for API consumption',
				configuration: {
					filename: '/api/payloads/orders.json',
					jsonBloc: 'orders',
					encoding: 'UTF-8',
				},
			},
			{
				name: 'Export Configuration Data',
				description: 'Write configuration data as JSON',
				configuration: {
					filename: '/config/app_settings.json',
					jsonBloc: 'settings',
					encoding: 'UTF-8',
				},
			},
		],
	},

	// Database Output Steps
	InsertUpdate: {
		typeId: 'InsertUpdate',
		category: StepCategory.OUTPUT,
		displayName: 'Insert / Update',
		description: 'Insert or update database records based on key fields. Performs UPDATE if key exists, INSERT if not. Supports batch commits and field mappings. Use for maintaining slowly changing dimensions, synchronizing data, or implementing upsert logic in databases without native MERGE support.',
		tags: ['database', 'output', 'sql', 'write'],
		configurationSchema: insertUpdateConfigSchema,
		examples: [
			{
				name: 'Upsert Customer Records',
				description: 'Insert new customers or update existing ones based on customer_id',
				configuration: {
					connection: 'PostgreSQL_CRM',
					schema: 'public',
					table: 'customers',
					commitSize: 500,
					updateLookup: [
						{ schemaField: 'customer_id', streamField: 'id' },
					],
					updateFields: [
						{ tableName: 'name', streamName: 'customer_name' },
						{ tableName: 'email', streamName: 'email_address' },
						{ tableName: 'updated_at', streamName: 'timestamp' },
					],
				},
			},
			{
				name: 'Synchronize Product Catalog',
				description: 'Keep product catalog in sync with source system',
				configuration: {
					connection: 'MySQL_Catalog',
					table: 'products',
					commitSize: 1000,
					updateLookup: [
						{ schemaField: 'sku', streamField: 'product_sku' },
					],
					updateFields: [
						{ tableName: 'name', streamName: 'product_name' },
						{ tableName: 'price', streamName: 'current_price' },
					],
				},
			},
		],
	},
	Update: {
		typeId: 'Update',
		category: StepCategory.OUTPUT,
		displayName: 'Update',
		description: 'Update existing database records based on key fields and conditions. Executes UPDATE statements with WHERE clauses. Supports multiple comparison operators and batch commits. Use for modifying existing records, applying corrections, or updating specific subsets of data in database tables.',
		tags: ['database', 'output', 'sql', 'write'],
		configurationSchema: updateConfigSchema,
		examples: [
			{
				name: 'Update Order Status',
				description: 'Update order status for processed orders',
				configuration: {
					connection: 'PostgreSQL_Orders',
					schema: 'public',
					table: 'orders',
					commitSize: 100,
					keyLookup: [
						{ keyStream: 'order_id', keyCondition: '=' },
					],
					updateFields: [
						{ tableName: 'status', streamName: 'new_status' },
						{ tableName: 'updated_at', streamName: 'timestamp' },
					],
				},
			},
			{
				name: 'Apply Price Adjustments',
				description: 'Update product prices based on pricing rules',
				configuration: {
					connection: 'MySQL_Products',
					table: 'products',
					commitSize: 200,
					keyLookup: [
						{ keyStream: 'product_id', keyCondition: '=' },
					],
					updateFields: [
						{ tableName: 'price', streamName: 'adjusted_price' },
					],
				},
			},
		],
	},
	Delete: {
		typeId: 'Delete',
		category: StepCategory.OUTPUT,
		displayName: 'Delete',
		description: 'Delete records from database tables based on key fields and conditions. Executes DELETE statements with WHERE clauses. Supports multiple comparison operators and batch commits. Use for removing obsolete data, implementing data retention policies, or cleaning up test data from database tables.',
		tags: ['database', 'output', 'sql', 'write'],
		configurationSchema: deleteConfigSchema,
		examples: [
			{
				name: 'Remove Expired Sessions',
				description: 'Delete expired user sessions from database',
				configuration: {
					connection: 'PostgreSQL_Sessions',
					schema: 'public',
					table: 'user_sessions',
					commitSize: 500,
					keyLookup: [
						{ keyStream: 'session_id', keyCondition: '=' },
					],
				},
			},
			{
				name: 'Archive Old Orders',
				description: 'Delete orders older than retention period',
				configuration: {
					connection: 'MySQL_Orders',
					table: 'orders',
					commitSize: 1000,
					keyLookup: [
						{ keyStream: 'order_id', keyCondition: '=' },
					],
				},
			},
		],
	},
	SynchronizeAfterMerge: {
		typeId: 'SynchronizeAfterMerge',
		category: StepCategory.OUTPUT,
		displayName: 'Synchronize After Merge',
		description: 'Synchronize database tables based on merge operation flags. Processes INSERT, UPDATE, and DELETE operations from a stream containing operation indicators. Use after Merge Rows step to apply detected changes to target database tables. Essential for change data capture and data synchronization workflows.',
		tags: ['database', 'output', 'sql', 'write'],
		configurationSchema: synchronizeAfterMergeConfigSchema,
		examples: [
			{
				name: 'Apply CDC Changes',
				description: 'Synchronize customer data based on change data capture stream',
				configuration: {
					connection: 'PostgreSQL_Target',
					schema: 'public',
					table: 'customers',
					commitSize: 100,
					operationFieldName: 'operation_type',
					keyFields: ['customer_id'],
					updateFields: ['name', 'email', 'phone', 'updated_at'],
				},
			},
			{
				name: 'Sync Dimension Table',
				description: 'Apply changes to dimension table after merge detection',
				configuration: {
					connection: 'Oracle_DW',
					schema: 'DIM',
					table: 'DIM_PRODUCT',
					commitSize: 200,
					operationFieldName: 'merge_action',
					keyFields: ['product_key'],
					updateFields: ['product_name', 'category', 'price', 'effective_date'],
				},
			},
		],
	},
	MySQLBulkLoader: {
		typeId: 'MySQLBulkLoader',
		category: StepCategory.OUTPUT,
		displayName: 'MySQL Bulk Loader',
		description: 'Load large volumes of data into MySQL tables using LOAD DATA INFILE for maximum performance. Bypasses standard INSERT statements to achieve high-speed bulk loading. Supports character encoding, delimiters, and REPLACE operations. Use for high-volume data warehouse loads or initial data migrations into MySQL databases.',
		tags: ['database', 'output', 'mysql', 'write'],
		configurationSchema: mysqlBulkLoaderOutputConfigSchema,
		examples: [
			{
				name: 'Bulk Load Sales Data',
				description: 'High-speed load of daily sales data into MySQL',
				configuration: {
					connection: 'MySQL_DataWarehouse',
					schema: 'sales',
					table: 'daily_sales',
					encoding: 'UTF-8',
					delimiter: ',',
					enclosure: '"',
					bulkSize: 50000,
					replaceData: false,
				},
			},
			{
				name: 'Replace Product Catalog',
				description: 'Bulk load product catalog using REPLACE mode',
				configuration: {
					connection: 'MySQL_Catalog',
					table: 'products',
					encoding: 'UTF-8',
					delimiter: '\t',
					enclosure: '',
					bulkSize: 10000,
					replaceData: true,
				},
			},
		],
	},
	PostgreSQLBulkLoader: {
		typeId: 'PostgreSQLBulkLoader',
		category: StepCategory.OUTPUT,
		displayName: 'PostgreSQL Bulk Loader',
		description: 'Load large volumes of data into PostgreSQL tables using COPY command for optimal performance. Provides high-speed bulk loading by bypassing standard INSERT statements. Supports field mappings, delimiters, and table truncation. Use for data warehouse loads, migrations, or any high-volume data ingestion into PostgreSQL.',
		tags: ['database', 'output', 'postgresql', 'write'],
		configurationSchema: postgreSQLBulkLoaderOutputConfigSchema,
		examples: [
			{
				name: 'Load Transaction History',
				description: 'Bulk load transaction data into PostgreSQL warehouse',
				configuration: {
					connection: 'PostgreSQL_Analytics',
					schema: 'staging',
					table: 'transactions',
					truncateTable: true,
					delimiter: ',',
					enclosure: '"',
					fields: [
						{ streamField: 'txn_id', tableField: 'transaction_id' },
						{ streamField: 'amount', tableField: 'transaction_amount' },
						{ streamField: 'date', tableField: 'transaction_date' },
					],
				},
			},
			{
				name: 'Append Customer Events',
				description: 'Bulk append customer event data',
				configuration: {
					connection: 'PostgreSQL_Events',
					schema: 'public',
					table: 'customer_events',
					truncateTable: false,
					delimiter: '\t',
					enclosure: '',
				},
			},
		],
	},

	// File Output Steps
	ExcelOutput: {
		typeId: 'ExcelOutput',
		category: StepCategory.OUTPUT,
		displayName: 'Excel Output',
		description: 'Write data to Microsoft Excel files (.xls, .xlsx) with configurable formatting and layout. Supports multiple worksheets, header/footer rows, and cell positioning. Use for generating Excel reports, creating data exports for business users, or producing formatted spreadsheets for analysis and distribution.',
		tags: ['excel', 'output', 'file', 'write'],
		configurationSchema: excelOutputConfigSchema,
		examples: [
			{
				name: 'Generate Sales Report',
				description: 'Create Excel sales report with headers',
				configuration: {
					filename: '/reports/monthly_sales_2024.xlsx',
					sheetName: 'Sales_Summary',
					appendToExisting: false,
					createParentFolder: true,
					header: true,
					footer: false,
					startingCell: 'A1',
				},
			},
			{
				name: 'Append to Existing Workbook',
				description: 'Add data to existing Excel workbook on new sheet',
				configuration: {
					filename: '/reports/annual_report.xlsx',
					sheetName: 'Q4_Data',
					appendToExisting: true,
					header: true,
					startingCell: 'A1',
				},
			},
		],
	},
	AccessOutput: {
		typeId: 'AccessOutput',
		category: StepCategory.OUTPUT,
		displayName: 'Access Output',
		description: 'Write data to Microsoft Access database files (.mdb, .accdb). Supports table creation, truncation, and batch commits. Use for generating Access databases for distribution, creating data exports compatible with Access applications, or loading data into existing Access database files.',
		tags: ['database', 'output', 'access', 'write'],
		configurationSchema: accessOutputConfigSchema,
		examples: [
			{
				name: 'Create Customer Database',
				description: 'Write customer data to new Access database file',
				configuration: {
					filename: '/exports/customers.accdb',
					table: 'Customers',
					createTable: true,
					truncateTable: false,
					commitSize: 1000,
				},
			},
			{
				name: 'Load Existing Access DB',
				description: 'Truncate and reload data in existing Access table',
				configuration: {
					filename: '/data/inventory.mdb',
					table: 'Products',
					createTable: false,
					truncateTable: true,
					commitSize: 500,
				},
			},
		],
	},
	PropertyOutput: {
		typeId: 'PropertyOutput',
		category: StepCategory.OUTPUT,
		displayName: 'Property Output',
		description: 'Write data to Java properties files (.properties) in key=value format. Supports comments, encoding, and append mode. Use for generating configuration files, creating application properties, or exporting settings and parameters to property files for Java applications or configuration management.',
		tags: ['file', 'output', 'properties', 'write'],
		configurationSchema: propertyOutputConfigSchema,
		examples: [
			{
				name: 'Generate Application Config',
				description: 'Create properties file with application settings',
				configuration: {
					filename: '/config/application.properties',
					keyField: 'setting_name',
					valueField: 'setting_value',
					encoding: 'UTF-8',
					comment: 'Application Configuration - Auto-generated',
					appendToFile: false,
				},
			},
			{
				name: 'Append Environment Variables',
				description: 'Add environment-specific properties to existing file',
				configuration: {
					filename: '/config/env.properties',
					keyField: 'var_name',
					valueField: 'var_value',
					encoding: 'UTF-8',
					appendToFile: true,
				},
			},
		],
	},
	ParquetOutput: {
		typeId: 'ParquetOutput',
		category: StepCategory.OUTPUT,
		displayName: 'Parquet Output',
		description: 'Write data to Apache Parquet columnar storage format with configurable compression and encoding. Supports multiple compression codecs and Parquet versions. Use for big data analytics, data lake storage, creating efficient analytical datasets, or preparing data for Spark, Hive, and other big data processing frameworks.',
		tags: ['file', 'output', 'parquet', 'write'],
		configurationSchema: parquetOutputConfigSchema,
		examples: [
			{
				name: 'Write to Data Lake',
				description: 'Export data to Parquet for S3 data lake with Snappy compression',
				configuration: {
					filename: '/datalake/sales/2024/sales_data.parquet',
					compressionType: 'SNAPPY',
					version: '2.0',
					rowGroupSize: 134217728,
					pageSize: 1048576,
					fields: [
						{ name: 'sale_id', type: 'Long' },
						{ name: 'product_name', type: 'String' },
						{ name: 'amount', type: 'Double' },
						{ name: 'sale_date', type: 'Timestamp' },
					],
				},
			},
			{
				name: 'Create Analytics Dataset',
				description: 'Generate compressed Parquet file for analytical queries',
				configuration: {
					filename: '/analytics/customer_events.parquet',
					compressionType: 'ZSTD',
					version: '2.0',
					fields: [
						{ name: 'customer_id', type: 'Integer' },
						{ name: 'event_type', type: 'String' },
						{ name: 'timestamp', type: 'Timestamp' },
					],
				},
			},
		],
	},

	// Structured Data Output Steps
	XMLOutput: {
		typeId: 'XMLOutput',
		category: StepCategory.OUTPUT,
		displayName: 'XML Output',
		description: 'Write data to XML files with configurable structure, encoding, and formatting. Supports element naming, compression, file splitting, and null value handling. Use for generating XML documents, creating SOAP payloads, producing configuration files, or exporting data in XML format for system integration and data exchange.',
		tags: ['xml', 'output', 'file', 'write'],
		configurationSchema: xmlOutputConfigSchema,
		examples: [
			{
				name: 'Generate XML Export',
				description: 'Create XML file with customer data',
				configuration: {
					filename: '/exports/customers.xml',
					encoding: 'UTF-8',
					mainElement: 'Customers',
					rowElement: 'Customer',
					zipped: false,
					omitNullValues: true,
				},
			},
			{
				name: 'Create Compressed XML Feed',
				description: 'Generate compressed XML data feed with file splitting',
				configuration: {
					filename: '/feeds/products.xml.gz',
					encoding: 'UTF-8',
					mainElement: 'ProductCatalog',
					rowElement: 'Product',
					zipped: true,
					splitEvery: 10000,
					omitNullValues: false,
				},
			},
		],
	},
	YAMLOutput: {
		typeId: 'YAMLOutput',
		category: StepCategory.OUTPUT,
		displayName: 'YAML Output',
		description: 'Write data to YAML format files with configurable encoding and structure. Supports append mode and parent folder creation. Use for generating configuration files, creating Kubernetes manifests, producing Docker Compose files, or exporting data in human-readable YAML format for configuration management and infrastructure as code.',
		tags: ['yaml', 'output', 'file', 'write'],
		configurationSchema: yamlOutputConfigSchema,
		examples: [
			{
				name: 'Generate Kubernetes Config',
				description: 'Create YAML configuration for Kubernetes deployment',
				configuration: {
					filename: '/k8s/deployment.yaml',
					encoding: 'UTF-8',
					appendToFile: false,
					createParentFolder: true,
				},
			},
			{
				name: 'Append Application Settings',
				description: 'Add settings to existing YAML configuration file',
				configuration: {
					filename: '/config/app_config.yaml',
					encoding: 'UTF-8',
					appendToFile: true,
					createParentFolder: false,
				},
			},
		],
	},

	// Streaming Output Steps
	KafkaProducer: {
		typeId: 'KafkaProducer',
		category: StepCategory.OUTPUT,
		displayName: 'Kafka Producer',
		description: 'Publish messages to Apache Kafka topics with configurable partitioning and compression. Supports batching, message keys, and multiple compression types. Use for streaming ETL outputs, implementing event-driven architectures, feeding real-time analytics pipelines, or integrating with Kafka-based messaging systems and data streaming platforms.',
		tags: ['streaming', 'output', 'kafka', 'write'],
		configurationSchema: kafkaProducerConfigSchema,
		examples: [
			{
				name: 'Stream Customer Events',
				description: 'Publish customer events to Kafka topic',
				configuration: {
					bootstrapServers: 'kafka1:9092,kafka2:9092',
					topic: 'customer-events',
					keyField: 'customer_id',
					messageField: 'event_data',
					compressionType: 'snappy',
					batchSize: 16384,
				},
			},
			{
				name: 'Publish Order Updates',
				description: 'Send order status updates to Kafka with high compression',
				configuration: {
					bootstrapServers: 'localhost:9092',
					topic: 'order-updates',
					keyField: 'order_id',
					messageField: 'order_json',
					compressionType: 'lz4',
					batchSize: 32768,
				},
			},
		],
	},
	JMSOutput: {
		typeId: 'JMSOutput',
		category: StepCategory.OUTPUT,
		displayName: 'JMS Output',
		description: 'Send messages to JMS queues or topics using Java Message Service. Supports both queue and topic destinations with JNDI configuration. Use for enterprise messaging integration, implementing message-driven workflows, connecting to application servers, or publishing to JMS-compatible message brokers like ActiveMQ or WebSphere MQ.',
		tags: ['streaming', 'output', 'jms', 'write'],
		configurationSchema: jmsOutputConfigSchema,
		examples: [
			{
				name: 'Send to JMS Queue',
				description: 'Publish messages to enterprise JMS queue',
				configuration: {
					connectionFactory: 'jms/ConnectionFactory',
					destination: 'jms/OrderQueue',
					destinationType: 'queue',
					messageField: 'order_message',
					jndiUrl: 'jnp://jmsserver:1099',
					username: 'jmsuser',
					password: 'jmspass',
				},
			},
			{
				name: 'Publish to JMS Topic',
				description: 'Broadcast events to JMS topic subscribers',
				configuration: {
					connectionFactory: 'jms/TopicConnectionFactory',
					destination: 'jms/EventsTopic',
					destinationType: 'topic',
					messageField: 'event_payload',
					jndiUrl: 'jnp://activemq:1099',
				},
			},
		],
	},
	MQOutput: {
		typeId: 'MQOutput',
		category: StepCategory.OUTPUT,
		displayName: 'MQ Output',
		description: 'Send messages to IBM MQ (WebSphere MQ) queues with configurable queue manager and channel settings. Supports message formats and MQ-specific configurations. Use for integrating with IBM MQ infrastructure, implementing enterprise messaging patterns, connecting to mainframe systems, or publishing to MQ-based message brokers.',
		tags: ['streaming', 'output', 'queue', 'write'],
		configurationSchema: mqOutputConfigSchema,
		examples: [
			{
				name: 'Send to IBM MQ Queue',
				description: 'Publish messages to WebSphere MQ queue',
				configuration: {
					queueManager: 'QM1',
					queueName: 'ORDERS.QUEUE',
					hostname: 'mqserver.example.com',
					port: 1414,
					channel: 'SYSTEM.DEF.SVRCONN',
					messageField: 'mq_message',
					messageFormat: 'MQSTR',
				},
			},
			{
				name: 'Mainframe Integration',
				description: 'Send data to mainframe system via MQ',
				configuration: {
					queueManager: 'MAINFRAME.QM',
					queueName: 'BATCH.INPUT',
					hostname: 'mainframe.corp.com',
					port: 1414,
					channel: 'BATCH.CHANNEL',
					messageField: 'batch_data',
					messageFormat: 'MQSTR',
				},
			},
		],
	},
	MQTTPublisher: {
		typeId: 'MQTTPublisher',
		category: StepCategory.OUTPUT,
		displayName: 'MQTT Publisher',
		description: 'Publish messages to MQTT broker topics with configurable QoS and retain settings. Supports IoT messaging patterns and lightweight publish-subscribe messaging. Use for IoT data streaming, sensor data publishing, implementing telemetry systems, or integrating with MQTT-based message brokers for device communication and real-time data distribution.',
		tags: ['streaming', 'output', 'mqtt', 'write'],
		configurationSchema: mqttPublisherConfigSchema,
		examples: [
			{
				name: 'Publish Sensor Data',
				description: 'Send IoT sensor readings to MQTT broker',
				configuration: {
					broker: 'tcp://mqtt.example.com:1883',
					topic: 'sensors/temperature',
					qos: '1',
					clientId: 'kettle-publisher-001',
					messageField: 'sensor_reading',
					retain: false,
				},
			},
			{
				name: 'Device Telemetry Stream',
				description: 'Publish device telemetry with message retention',
				configuration: {
					broker: 'tcp://iot-broker:1883',
					topic: 'devices/telemetry',
					qos: '2',
					clientId: 'telemetry-publisher',
					messageField: 'telemetry_json',
					retain: true,
				},
			},
		],
	},

	// Cloud/NoSQL Output Steps
	S3CSVOutput: {
		typeId: 'S3CSVOutput',
		category: StepCategory.OUTPUT,
		displayName: 'S3 CSV Output',
		description: 'Write CSV files directly to Amazon S3 buckets with configurable delimiters and encoding. Supports headers and field enclosures. Use for data lake ingestion, cloud-based data storage, creating S3-hosted data exports, or feeding data to AWS analytics services like Athena, Redshift Spectrum, or EMR.',
		tags: ['cloud', 'output', 's3', 'csv', 'write'],
		configurationSchema: s3CSVOutputConfigSchema,
		examples: [
			{
				name: 'Export to S3 Data Lake',
				description: 'Write sales data to S3 data lake as CSV',
				configuration: {
					awsAccessKey: 'AKIA...',
					awsSecretKey: 'secret...',
					bucket: 'data-lake-prod',
					key: 'sales/2024/daily_sales.csv',
					region: 'us-east-1',
					delimiter: ',',
					enclosure: '"',
					includeHeader: true,
					encoding: 'UTF-8',
				},
			},
			{
				name: 'S3 Export for Athena',
				description: 'Create S3 CSV for AWS Athena queries',
				configuration: {
					awsAccessKey: 'AKIA...',
					awsSecretKey: 'secret...',
					bucket: 'analytics-bucket',
					key: 'athena/customer_events.csv',
					region: 'us-west-2',
					delimiter: '|',
					enclosure: '"',
					includeHeader: true,
					encoding: 'UTF-8',
				},
			},
		],
	},
	MongoDbOutput: {
		typeId: 'MongoDbOutput',
		category: StepCategory.OUTPUT,
		displayName: 'MongoDB Output',
		description: 'Write documents to MongoDB collections with support for insert, update, upsert, and delete operations. Supports batch processing for performance. Use for loading NoSQL databases, implementing document-based data stores, creating MongoDB-backed applications, or migrating data to MongoDB from relational or other data sources.',
		tags: ['nosql', 'output', 'mongodb', 'write'],
		configurationSchema: mongoDbOutputConfigSchema,
		examples: [
			{
				name: 'Load Customer Documents',
				description: 'Insert customer data into MongoDB collection',
				configuration: {
					hostname: 'mongodb.example.com',
					port: 27017,
					database: 'crm',
					collection: 'customers',
					operation: 'insert',
					upsert: false,
					batchSize: 100,
				},
			},
			{
				name: 'Upsert Product Catalog',
				description: 'Update or insert products in MongoDB with upsert',
				configuration: {
					hostname: 'localhost',
					port: 27017,
					database: 'catalog',
					collection: 'products',
					operation: 'upsert',
					upsert: true,
					batchSize: 500,
				},
			},
		],
	},
	CassandraOutput: {
		typeId: 'CassandraOutput',
		category: StepCategory.OUTPUT,
		displayName: 'Cassandra Output',
		description: 'Write data to Apache Cassandra tables with configurable consistency levels and TTL. Supports batch processing for optimal performance. Use for loading distributed NoSQL databases, implementing high-availability data stores, creating time-series data storage, or building applications requiring horizontal scalability and fault tolerance.',
		tags: ['nosql', 'output', 'cassandra', 'write'],
		configurationSchema: cassandraOutputConfigSchema,
		examples: [
			{
				name: 'Load Time-Series Data',
				description: 'Write sensor data to Cassandra with TTL',
				configuration: {
					hostname: 'cassandra1.example.com',
					port: 9042,
					keyspace: 'iot',
					table: 'sensor_readings',
					consistencyLevel: 'LOCAL_QUORUM',
					batchSize: 500,
					ttl: 2592000,
				},
			},
			{
				name: 'Write User Events',
				description: 'Insert user activity events into Cassandra cluster',
				configuration: {
					hostname: 'cassandra-cluster',
					port: 9042,
					keyspace: 'analytics',
					table: 'user_events',
					consistencyLevel: 'QUORUM',
					batchSize: 1000,
				},
			},
		],
	},
	ElasticsearchBulkInsert: {
		typeId: 'ElasticsearchBulkInsert',
		category: StepCategory.OUTPUT,
		displayName: 'Elasticsearch Bulk Insert',
		description: 'Bulk load documents into Elasticsearch indices with configurable batch sizes and error handling. Supports document ID specification and bulk API optimization. Use for loading search indices, implementing full-text search, creating log analytics systems, or building Elasticsearch-backed applications with high-performance bulk indexing.',
		tags: ['nosql', 'output', 'elasticsearch', 'write'],
		configurationSchema: elasticsearchBulkInsertConfigSchema,
		examples: [
			{
				name: 'Index Product Catalog',
				description: 'Bulk load products into Elasticsearch for search',
				configuration: {
					hostname: 'elasticsearch.example.com',
					port: 9200,
					index: 'products',
					type: '_doc',
					idField: 'product_id',
					batchSize: 1000,
					stopOnError: true,
				},
			},
			{
				name: 'Load Log Data',
				description: 'Index application logs for analysis and search',
				configuration: {
					hostname: 'localhost',
					port: 9200,
					index: 'app-logs-2024',
					batchSize: 5000,
					stopOnError: false,
				},
			},
		],
	},
};
