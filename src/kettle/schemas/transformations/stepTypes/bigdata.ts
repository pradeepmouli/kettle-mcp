import { z } from 'zod';
import { StepCategory, type StepType } from './types.js';

/**
 * BigData step types
 * Big data platforms: Hadoop, Spark, cloud storage
 */

/**
 * Configuration schema for Hadoop File Input step
 */
const hadoopFileInputConfigSchema = z.object({
	filename: z.string().describe('HDFS file path or pattern'),
	inputFormat: z.enum(['TextInputFormat', 'SequenceFileInputFormat', 'AvroInputFormat']).default('TextInputFormat').describe('Hadoop input format'),
	compression: z.enum(['none', 'gzip', 'bzip2', 'snappy', 'lzo']).default('none').describe('Compression codec'),
	fields: z.array(z.object({
		name: z.string(),
		type: z.enum(['String', 'Integer', 'Number', 'Date', 'Boolean']),
	})).describe('Field definitions'),
});

/**
 * Configuration schema for Hadoop File Output step
 */
const hadoopFileOutputConfigSchema = z.object({
	filename: z.string().describe('HDFS output file path'),
	outputFormat: z.enum(['TextOutputFormat', 'SequenceFileOutputFormat', 'AvroOutputFormat']).default('TextOutputFormat').describe('Hadoop output format'),
	compression: z.enum(['none', 'gzip', 'bzip2', 'snappy', 'lzo']).default('none').describe('Compression codec'),
	overwrite: z.boolean().default(false).describe('Overwrite existing files'),
});

/**
 * Configuration schema for HDFS File Input step
 */
const hdfsFileInputConfigSchema = z.object({
	namenode: z.string().describe('HDFS namenode URL (hdfs://host:port)'),
	filepath: z.string().describe('HDFS file path or pattern'),
	fileType: z.enum(['text', 'parquet', 'avro', 'orc']).default('text').describe('File type'),
	fields: z.array(z.object({
		name: z.string(),
		type: z.enum(['String', 'Integer', 'Number', 'Date', 'Boolean']),
	})).describe('Field definitions'),
});

/**
 * Configuration schema for HDFS File Output step
 */
const hdfsFileOutputConfigSchema = z.object({
	namenode: z.string().describe('HDFS namenode URL (hdfs://host:port)'),
	filepath: z.string().describe('HDFS output file path'),
	fileType: z.enum(['text', 'parquet', 'avro', 'orc']).default('text').describe('File type'),
	overwrite: z.boolean().default(false).describe('Overwrite existing files'),
	replication: z.number().default(3).describe('HDFS replication factor'),
});

/**
 * Configuration schema for HBase Input step
 */
const hbaseInputConfigSchema = z.object({
	zookeeperQuorum: z.string().describe('ZooKeeper quorum (host:port,...)'),
	tableName: z.string().describe('HBase table name'),
	startRow: z.string().optional().describe('Start row key for scan'),
	stopRow: z.string().optional().describe('Stop row key for scan'),
	columnFamilies: z.array(z.object({
		family: z.string(),
		qualifier: z.string().optional(),
		fieldName: z.string(),
	})).describe('Column families and qualifiers to read'),
});

/**
 * Configuration schema for HBase Output step
 */
const hbaseOutputConfigSchema = z.object({
	zookeeperQuorum: z.string().describe('ZooKeeper quorum (host:port,...)'),
	tableName: z.string().describe('HBase table name'),
	rowKeyField: z.string().describe('Field to use as row key'),
	columnMappings: z.array(z.object({
		fieldName: z.string(),
		columnFamily: z.string(),
		qualifier: z.string(),
	})).describe('Field to column family/qualifier mappings'),
	writeBufferSize: z.number().default(2097152).describe('Write buffer size in bytes'),
});

/**
 * Configuration schema for S3 File Input step
 */
const s3FileInputConfigSchema = z.object({
	awsAccessKey: z.string().describe('AWS access key ID (use environment variables in production)'),
	awsSecretKey: z.string().describe('AWS secret access key (use environment variables in production)'),
	bucket: z.string().describe('S3 bucket name'),
	key: z.string().describe('S3 object key or pattern'),
	region: z.string().default('us-east-1').describe('AWS region'),
	fileFormat: z.enum(['text', 'csv', 'json', 'parquet', 'avro']).default('text').describe('File format'),
	fields: z.array(z.object({
		name: z.string(),
		type: z.enum(['String', 'Integer', 'Number', 'Date', 'Boolean']),
	})).optional().describe('Field definitions'),
});

/**
 * Configuration schema for S3 File Output step
 */
const s3FileOutputConfigSchema = z.object({
	awsAccessKey: z.string().describe('AWS access key ID (use environment variables in production)'),
	awsSecretKey: z.string().describe('AWS secret access key (use environment variables in production)'),
	bucket: z.string().describe('S3 bucket name'),
	key: z.string().describe('S3 object key'),
	region: z.string().default('us-east-1').describe('AWS region'),
	fileFormat: z.enum(['text', 'csv', 'json', 'parquet', 'avro']).default('text').describe('File format'),
	overwrite: z.boolean().default(false).describe('Overwrite existing objects'),
	storageClass: z.enum(['STANDARD', 'INTELLIGENT_TIERING', 'GLACIER']).default('STANDARD').describe('S3 storage class'),
});

/**
 * Configuration schema for Azure Event Hubs Consumer step
 */
const azureEventHubsConsumerConfigSchema = z.object({
	connectionString: z.string().describe('Event Hubs connection string'),
	eventHubName: z.string().describe('Event Hub name'),
	consumerGroup: z.string().default('$Default').describe('Consumer group name'),
	partitionId: z.string().optional().describe('Specific partition ID (leave empty for all partitions)'),
	messageField: z.string().default('message').describe('Output field name for message body'),
	offsetField: z.string().optional().describe('Output field name for offset'),
	partitionKeyField: z.string().optional().describe('Output field name for partition key'),
});

/**
 * Configuration schema for Azure Event Hubs Producer step
 */
const azureEventHubsProducerConfigSchema = z.object({
	connectionString: z.string().describe('Event Hubs connection string'),
	eventHubName: z.string().describe('Event Hub name'),
	messageField: z.string().describe('Input field containing message body'),
	partitionKeyField: z.string().optional().describe('Input field for partition key'),
	batchSize: z.number().default(100).describe('Number of messages per batch'),
});

/**
 * Configuration schema for Google Analytics step
 */
const googleAnalyticsConfigSchema = z.object({
	clientId: z.string().describe('Google OAuth client ID'),
	clientSecret: z.string().describe('Google OAuth client secret'),
	refreshToken: z.string().describe('OAuth refresh token'),
	viewId: z.string().describe('Google Analytics view ID'),
	startDate: z.string().describe('Start date (YYYY-MM-DD)'),
	endDate: z.string().describe('End date (YYYY-MM-DD)'),
	metrics: z.array(z.string()).describe('Metrics to retrieve (e.g., ga:sessions, ga:pageviews)'),
	dimensions: z.array(z.string()).optional().describe('Dimensions to group by (e.g., ga:country, ga:city)'),
	filters: z.string().optional().describe('Dimension or metric filters'),
});

/**
 * Configuration schema for Salesforce Upsert step
 */
const salesforceUpsertConfigSchema = z.object({
	username: z.string().describe('Salesforce username'),
	password: z.string().describe('Salesforce password'),
	securityToken: z.string().optional().describe('Salesforce security token'),
	module: z.string().describe('Salesforce object type (e.g., Account, Contact, Lead)'),
	externalIdField: z.string().describe('External ID field for upsert matching'),
	fieldMappings: z.array(z.object({
		streamField: z.string(),
		salesforceField: z.string(),
	})).describe('Field mappings from stream to Salesforce'),
	batchSize: z.number().default(200).describe('Number of records per batch'),
	timeout: z.number().default(60000).describe('Operation timeout in milliseconds'),
});

/**
 * Configuration schema for Salesforce Delete step
 */
const salesforceDeleteConfigSchema = z.object({
	username: z.string().describe('Salesforce username'),
	password: z.string().describe('Salesforce password'),
	securityToken: z.string().optional().describe('Salesforce security token'),
	module: z.string().describe('Salesforce object type (e.g., Account, Contact, Lead)'),
	idField: z.string().describe('Field containing Salesforce record ID'),
	batchSize: z.number().default(200).describe('Number of records per batch'),
	timeout: z.number().default(60000).describe('Operation timeout in milliseconds'),
});

/**
 * Configuration schema for Avro Input step
 */
const avroInputConfigSchema = z.object({
	filename: z.string().describe('Path to Avro file'),
	schemaFilename: z.string().optional().describe('Optional Avro schema file path'),
	fields: z.array(z.object({
		name: z.string(),
		avroPath: z.string().optional().describe('Path within Avro record'),
		type: z.enum(['String', 'Integer', 'Number', 'Date', 'Boolean']),
	})).describe('Field definitions'),
});

/**
 * Configuration schema for Avro Output step
 */
const avroOutputConfigSchema = z.object({
	filename: z.string().describe('Output Avro file path'),
	schemaFilename: z.string().optional().describe('Optional Avro schema file path'),
	compressionCodec: z.enum(['null', 'snappy', 'deflate', 'bzip2', 'xz']).default('snappy').describe('Compression codec'),
	namespace: z.string().optional().describe('Avro schema namespace'),
	recordName: z.string().default('Record').describe('Avro record name'),
	docString: z.string().optional().describe('Schema documentation string'),
});

export const BIGDATA_STEPS: Record<string, StepType> = {
	HadoopFileInput: {
		typeId: 'HadoopFileInput',
		category: StepCategory.BIGDATA,
		displayName: 'Hadoop File Input',
		description: 'Read data from Hadoop Distributed File System (HDFS) using various input formats including text, sequence files, and Avro. Supports compression codecs (gzip, bzip2, snappy, lzo) and pattern-based file selection. Use for ingesting large-scale data from Hadoop clusters into ETL pipelines.',
		tags: ['hadoop', 'hdfs', 'bigdata', 'input', 'distributed'],
		configurationSchema: hadoopFileInputConfigSchema,
		examples: [
			{
				name: 'Read Compressed Logs from HDFS',
				description: 'Ingest gzip-compressed log files from Hadoop cluster',
				configuration: {
					filename: '/data/logs/app-*.log.gz',
					inputFormat: 'TextInputFormat',
					compression: 'gzip',
					fields: [
						{ name: 'timestamp', type: 'String' },
						{ name: 'level', type: 'String' },
						{ name: 'message', type: 'String' },
					],
				},
			},
			{
				name: 'Read Avro Files',
				description: 'Process Avro-formatted data from HDFS',
				configuration: {
					filename: '/warehouse/events/date=2024-01-01/*.avro',
					inputFormat: 'AvroInputFormat',
					compression: 'snappy',
					fields: [
						{ name: 'event_id', type: 'String' },
						{ name: 'user_id', type: 'Integer' },
						{ name: 'event_type', type: 'String' },
					],
				},
			},
		],
	},
	HadoopFileOutput: {
		typeId: 'HadoopFileOutput',
		category: StepCategory.BIGDATA,
		displayName: 'Hadoop File Output',
		description: 'Write data to Hadoop Distributed File System (HDFS) using various output formats including text, sequence files, and Avro. Supports compression codecs and file overwrite control. Use for persisting processed data to Hadoop clusters for downstream processing or archival.',
		tags: ['hadoop', 'hdfs', 'bigdata', 'output', 'distributed'],
		configurationSchema: hadoopFileOutputConfigSchema,
		examples: [
			{
				name: 'Write Compressed Text Output',
				description: 'Save processed data to HDFS with snappy compression',
				configuration: {
					filename: '/data/output/processed_data.txt.snappy',
					outputFormat: 'TextOutputFormat',
					compression: 'snappy',
					overwrite: true,
				},
			},
			{
				name: 'Write Sequence Files',
				description: 'Store data in Hadoop sequence file format',
				configuration: {
					filename: '/warehouse/facts/daily_sales.seq',
					outputFormat: 'SequenceFileOutputFormat',
					compression: 'gzip',
					overwrite: false,
				},
			},
		],
	},
	HDFSFileInput: {
		typeId: 'HDFSFileInput',
		category: StepCategory.BIGDATA,
		displayName: 'HDFS File Input',
		description: 'Read files from HDFS with support for multiple file formats including text, Parquet, Avro, and ORC. Connects directly to HDFS namenode and supports pattern-based file selection. Use for reading big data files stored in HDFS with format-specific optimizations.',
		tags: ['hdfs', 'hadoop', 'bigdata', 'input', 'parquet', 'columnar'],
		configurationSchema: hdfsFileInputConfigSchema,
		examples: [
			{
				name: 'Read Parquet Files',
				description: 'Ingest columnar Parquet data from HDFS',
				configuration: {
					namenode: 'hdfs://namenode.example.com:8020',
					filepath: '/data/warehouse/sales/*.parquet',
					fileType: 'parquet',
					fields: [
						{ name: 'sale_id', type: 'Integer' },
						{ name: 'product_name', type: 'String' },
						{ name: 'amount', type: 'Number' },
						{ name: 'sale_date', type: 'Date' },
					],
				},
			},
			{
				name: 'Read ORC Files',
				description: 'Process optimized row columnar (ORC) files',
				configuration: {
					namenode: 'hdfs://namenode.example.com:8020',
					filepath: '/hive/warehouse/customer_events/*.orc',
					fileType: 'orc',
					fields: [
						{ name: 'customer_id', type: 'Integer' },
						{ name: 'event_type', type: 'String' },
						{ name: 'timestamp', type: 'Date' },
					],
				},
			},
		],
	},
	HDFSFileOutput: {
		typeId: 'HDFSFileOutput',
		category: StepCategory.BIGDATA,
		displayName: 'HDFS File Output',
		description: 'Write files to HDFS with support for multiple formats including text, Parquet, Avro, and ORC. Configurable replication factor and overwrite control. Use for persisting processed data to HDFS in optimized formats for analytics and data warehousing.',
		tags: ['hdfs', 'hadoop', 'bigdata', 'output', 'parquet', 'columnar'],
		configurationSchema: hdfsFileOutputConfigSchema,
		examples: [
			{
				name: 'Write Parquet Files',
				description: 'Save data in columnar Parquet format for efficient querying',
				configuration: {
					namenode: 'hdfs://namenode.example.com:8020',
					filepath: '/data/warehouse/daily_aggregates.parquet',
					fileType: 'parquet',
					overwrite: true,
					replication: 3,
				},
			},
			{
				name: 'Write ORC Files',
				description: 'Store data in ORC format for Hive tables',
				configuration: {
					namenode: 'hdfs://namenode.example.com:8020',
					filepath: '/hive/warehouse/processed_events.orc',
					fileType: 'orc',
					overwrite: false,
					replication: 2,
				},
			},
		],
	},
	HBaseInput: {
		typeId: 'HBaseInput',
		category: StepCategory.BIGDATA,
		displayName: 'HBase Input',
		description: 'Read data from Apache HBase NoSQL database using table scans with configurable start and stop row keys. Retrieves data from specified column families and qualifiers. Use for reading real-time big data from HBase tables in distributed ETL workflows.',
		tags: ['hbase', 'nosql', 'bigdata', 'input', 'hadoop'],
		configurationSchema: hbaseInputConfigSchema,
		examples: [
			{
				name: 'Scan Customer Events',
				description: 'Read customer event data from HBase table',
				configuration: {
					zookeeperQuorum: 'zk1.example.com:2181,zk2.example.com:2181',
					tableName: 'customer_events',
					startRow: 'customer_001',
					stopRow: 'customer_999',
					columnFamilies: [
						{ family: 'info', qualifier: 'event_type', fieldName: 'event_type' },
						{ family: 'info', qualifier: 'timestamp', fieldName: 'event_time' },
						{ family: 'data', qualifier: 'payload', fieldName: 'event_data' },
					],
				},
			},
			{
				name: 'Full Table Scan',
				description: 'Read all records from HBase table',
				configuration: {
					zookeeperQuorum: 'zk1.example.com:2181',
					tableName: 'user_profiles',
					columnFamilies: [
						{ family: 'profile', qualifier: 'name', fieldName: 'user_name' },
						{ family: 'profile', qualifier: 'email', fieldName: 'user_email' },
					],
				},
			},
		],
	},
	HBaseOutput: {
		typeId: 'HBaseOutput',
		category: StepCategory.BIGDATA,
		displayName: 'HBase Output',
		description: 'Write data to Apache HBase NoSQL database with configurable row keys and column family mappings. Supports write buffering for improved performance. Use for persisting real-time data to HBase tables in distributed big data pipelines.',
		tags: ['hbase', 'nosql', 'bigdata', 'output', 'hadoop'],
		configurationSchema: hbaseOutputConfigSchema,
		examples: [
			{
				name: 'Write User Events',
				description: 'Store user activity events in HBase',
				configuration: {
					zookeeperQuorum: 'zk1.example.com:2181,zk2.example.com:2181',
					tableName: 'user_events',
					rowKeyField: 'event_id',
					columnMappings: [
						{ fieldName: 'user_id', columnFamily: 'info', qualifier: 'uid' },
						{ fieldName: 'event_type', columnFamily: 'info', qualifier: 'type' },
						{ fieldName: 'event_data', columnFamily: 'data', qualifier: 'payload' },
					],
					writeBufferSize: 2097152,
				},
			},
			{
				name: 'Update Customer Profiles',
				description: 'Upsert customer profile data to HBase',
				configuration: {
					zookeeperQuorum: 'zk1.example.com:2181',
					tableName: 'customer_profiles',
					rowKeyField: 'customer_id',
					columnMappings: [
						{ fieldName: 'name', columnFamily: 'profile', qualifier: 'name' },
						{ fieldName: 'email', columnFamily: 'profile', qualifier: 'email' },
						{ fieldName: 'last_updated', columnFamily: 'meta', qualifier: 'updated_at' },
					],
					writeBufferSize: 4194304,
				},
			},
		],
	},
	S3FileInput: {
		typeId: 'S3FileInput',
		category: StepCategory.BIGDATA,
		displayName: 'S3 File Input',
		description: 'Read files from Amazon S3 cloud storage with support for multiple formats including text, CSV, JSON, Parquet, and Avro. Supports pattern-based object selection and AWS authentication. Use for ingesting cloud-stored data into ETL workflows.',
		tags: ['s3', 'aws', 'cloud', 'input', 'file'],
		configurationSchema: s3FileInputConfigSchema,
		examples: [
			{
				name: 'Read JSON from S3',
				description: 'Ingest JSON files from S3 bucket',
				configuration: {
					awsAccessKey: '${AWS_ACCESS_KEY_ID}',
					awsSecretKey: '${AWS_SECRET_ACCESS_KEY}',
					bucket: 'my-data-bucket',
					key: 'raw-data/events-*.json',
					region: 'us-east-1',
					fileFormat: 'json',
					fields: [
						{ name: 'event_id', type: 'String' },
						{ name: 'timestamp', type: 'Date' },
						{ name: 'user_id', type: 'Integer' },
					],
				},
			},
			{
				name: 'Read Parquet from S3',
				description: 'Process Parquet files stored in S3',
				configuration: {
					awsAccessKey: '${AWS_ACCESS_KEY_ID}',
					awsSecretKey: '${AWS_SECRET_ACCESS_KEY}',
					bucket: 'analytics-warehouse',
					key: 'sales/year=2024/month=01/*.parquet',
					region: 'us-west-2',
					fileFormat: 'parquet',
				},
			},
		],
	},
	S3FileOutput: {
		typeId: 'S3FileOutput',
		category: StepCategory.BIGDATA,
		displayName: 'S3 File Output',
		description: 'Write files to Amazon S3 cloud storage with support for multiple formats and storage classes. Configurable overwrite control and storage class selection (Standard, Intelligent Tiering, Glacier). Use for persisting processed data to cloud storage.',
		tags: ['s3', 'aws', 'cloud', 'output', 'file'],
		configurationSchema: s3FileOutputConfigSchema,
		examples: [
			{
				name: 'Write CSV to S3',
				description: 'Save processed data as CSV in S3',
				configuration: {
					awsAccessKey: '${AWS_ACCESS_KEY_ID}',
					awsSecretKey: '${AWS_SECRET_ACCESS_KEY}',
					bucket: 'output-bucket',
					key: 'processed/daily_report.csv',
					region: 'us-east-1',
					fileFormat: 'csv',
					overwrite: true,
					storageClass: 'STANDARD',
				},
			},
			{
				name: 'Archive to Glacier',
				description: 'Write data to S3 Glacier for long-term storage',
				configuration: {
					awsAccessKey: '${AWS_ACCESS_KEY_ID}',
					awsSecretKey: '${AWS_SECRET_ACCESS_KEY}',
					bucket: 'archive-bucket',
					key: 'archives/2024/historical_data.parquet',
					region: 'us-east-1',
					fileFormat: 'parquet',
					overwrite: false,
					storageClass: 'GLACIER',
				},
			},
		],
	},
	AzureEventHubsConsumer: {
		typeId: 'AzureEventHubsConsumer',
		category: StepCategory.BIGDATA,
		displayName: 'Azure Event Hubs Consumer',
		description: 'Consume messages from Azure Event Hubs, a fully managed real-time data ingestion service. Supports consumer groups, partition selection, and offset tracking. Use for ingesting streaming events from Azure cloud into ETL pipelines.',
		tags: ['azure', 'cloud', 'streaming', 'input', 'realtime', 'events'],
		configurationSchema: azureEventHubsConsumerConfigSchema,
		examples: [
			{
				name: 'Consume IoT Events',
				description: 'Read IoT device telemetry from Event Hubs',
				configuration: {
					connectionString: 'Endpoint=sb://myeventhub.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=${EVENTHUB_ACCESS_KEY}',
					eventHubName: 'iot-telemetry',
					consumerGroup: '$Default',
					messageField: 'telemetry_data',
					offsetField: 'event_offset',
					partitionKeyField: 'device_id',
				},
			},
			{
				name: 'Process Application Logs',
				description: 'Ingest application log events from specific partition',
				configuration: {
					connectionString: 'Endpoint=sb://myeventhub.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=${EVENTHUB_ACCESS_KEY}',
					eventHubName: 'app-logs',
					consumerGroup: 'log-processor',
					partitionId: '0',
					messageField: 'log_message',
				},
			},
		],
	},
	AzureEventHubsProducer: {
		typeId: 'AzureEventHubsProducer',
		category: StepCategory.BIGDATA,
		displayName: 'Azure Event Hubs Producer',
		description: 'Publish messages to Azure Event Hubs for real-time event streaming. Supports batching and partition key routing. Use for sending processed events to Azure cloud for downstream consumption by analytics services.',
		tags: ['azure', 'cloud', 'streaming', 'output', 'realtime', 'events'],
		configurationSchema: azureEventHubsProducerConfigSchema,
		examples: [
			{
				name: 'Publish Processed Events',
				description: 'Send enriched events to Event Hubs',
				configuration: {
					connectionString: 'Endpoint=sb://myeventhub.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=${EVENTHUB_ACCESS_KEY}',
					eventHubName: 'processed-events',
					messageField: 'event_payload',
					partitionKeyField: 'customer_id',
					batchSize: 100,
				},
			},
			{
				name: 'Stream Analytics Results',
				description: 'Publish real-time analytics to Event Hubs',
				configuration: {
					connectionString: 'Endpoint=sb://myeventhub.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=${EVENTHUB_ACCESS_KEY}',
					eventHubName: 'analytics-stream',
					messageField: 'analytics_result',
					batchSize: 50,
				},
			},
		],
	},
	GoogleAnalytics: {
		typeId: 'GoogleAnalytics',
		category: StepCategory.BIGDATA,
		displayName: 'Google Analytics',
		description: 'Retrieve web analytics data from Google Analytics using the Reporting API. Query metrics and dimensions with date ranges and filters. Use for extracting website traffic, user behavior, and conversion data into ETL workflows for business intelligence.',
		tags: ['gcp', 'analytics', 'cloud', 'input', 'web', 'api'],
		configurationSchema: googleAnalyticsConfigSchema,
		examples: [
			{
				name: 'Daily Traffic Report',
				description: 'Extract daily sessions and pageview metrics',
				configuration: {
					clientId: '123456789.apps.googleusercontent.com',
					clientSecret: 'GOCSPX-...',
					refreshToken: '1//0...',
					viewId: '12345678',
					startDate: '2024-01-01',
					endDate: '2024-01-31',
					metrics: ['ga:sessions', 'ga:pageviews', 'ga:users'],
					dimensions: ['ga:date', 'ga:country'],
				},
			},
			{
				name: 'E-commerce Performance',
				description: 'Analyze e-commerce transactions by product',
				configuration: {
					clientId: '123456789.apps.googleusercontent.com',
					clientSecret: 'GOCSPX-...',
					refreshToken: '1//0...',
					viewId: '12345678',
					startDate: '2024-01-01',
					endDate: '2024-01-31',
					metrics: ['ga:transactions', 'ga:transactionRevenue'],
					dimensions: ['ga:productName', 'ga:productCategory'],
					filters: 'ga:transactions>0',
				},
			},
		],
	},
	SalesforceUpsert: {
		typeId: 'SalesforceUpsert',
		category: StepCategory.BIGDATA,
		displayName: 'Salesforce Upsert',
		description: 'Insert or update Salesforce records using external ID matching. Performs upsert operations (insert if new, update if exists) based on external ID field. Use for synchronizing data with Salesforce CRM, ensuring data consistency without duplicates.',
		tags: ['salesforce', 'cloud', 'crm', 'output', 'write'],
		configurationSchema: salesforceUpsertConfigSchema,
		examples: [
			{
				name: 'Sync Customer Accounts',
				description: 'Upsert customer account records to Salesforce',
				configuration: {
					username: '${SALESFORCE_USERNAME}',
					password: '${SALESFORCE_PASSWORD}',
					securityToken: '${SALESFORCE_SECURITY_TOKEN}',
					module: 'Account',
					externalIdField: 'External_Customer_ID__c',
					fieldMappings: [
						{ streamField: 'customer_id', salesforceField: 'External_Customer_ID__c' },
						{ streamField: 'company_name', salesforceField: 'Name' },
						{ streamField: 'email', salesforceField: 'Email__c' },
						{ streamField: 'phone', salesforceField: 'Phone' },
					],
					batchSize: 200,
					timeout: 60000,
				},
			},
			{
				name: 'Update Lead Information',
				description: 'Sync marketing leads to Salesforce',
				configuration: {
					username: '${SALESFORCE_USERNAME}',
					password: '${SALESFORCE_PASSWORD}',
					module: 'Lead',
					externalIdField: 'Lead_Source_ID__c',
					fieldMappings: [
						{ streamField: 'lead_id', salesforceField: 'Lead_Source_ID__c' },
						{ streamField: 'first_name', salesforceField: 'FirstName' },
						{ streamField: 'last_name', salesforceField: 'LastName' },
						{ streamField: 'email', salesforceField: 'Email' },
					],
					batchSize: 200,
					timeout: 60000,
				},
			},
		],
	},
	SalesforceDelete: {
		typeId: 'SalesforceDelete',
		category: StepCategory.BIGDATA,
		displayName: 'Salesforce Delete',
		description: 'Delete records from Salesforce using record IDs. Performs bulk deletion operations with configurable batch sizes. Use for removing obsolete or duplicate records from Salesforce CRM in data cleanup and synchronization workflows.',
		tags: ['salesforce', 'cloud', 'crm', 'output', 'bulk'],
		configurationSchema: salesforceDeleteConfigSchema,
		examples: [
			{
				name: 'Delete Duplicate Leads',
				description: 'Remove duplicate lead records from Salesforce',
				configuration: {
					username: '${SALESFORCE_USERNAME}',
					password: '${SALESFORCE_PASSWORD}',
					securityToken: '${SALESFORCE_SECURITY_TOKEN}',
					module: 'Lead',
					idField: 'salesforce_id',
					batchSize: 200,
					timeout: 60000,
				},
			},
			{
				name: 'Clean Up Old Records',
				description: 'Delete archived contact records',
				configuration: {
					username: '${SALESFORCE_USERNAME}',
					password: '${SALESFORCE_PASSWORD}',
					module: 'Contact',
					idField: 'contact_id',
					batchSize: 100,
					timeout: 60000,
				},
			},
		],
	},
	AvroInput: {
		typeId: 'AvroInput',
		category: StepCategory.BIGDATA,
		displayName: 'Avro Input',
		description: 'Read data from Apache Avro files, a compact binary format with schema evolution support. Handles schema files and embedded schemas. Use for ingesting data stored in Avro format from big data platforms, data lakes, or event streaming systems.',
		tags: ['file', 'bigdata', 'input', 'schema', 'columnar'],
		configurationSchema: avroInputConfigSchema,
		examples: [
			{
				name: 'Read User Events',
				description: 'Ingest user event data from Avro files',
				configuration: {
					filename: '/data/events/user_events.avro',
					fields: [
						{ name: 'event_id', type: 'String' },
						{ name: 'user_id', type: 'Integer' },
						{ name: 'event_type', type: 'String' },
						{ name: 'timestamp', type: 'Date' },
					],
				},
			},
			{
				name: 'Read with Schema File',
				description: 'Process Avro data using external schema definition',
				configuration: {
					filename: '/data/sales/transactions.avro',
					schemaFilename: '/schemas/transaction.avsc',
					fields: [
						{ name: 'transaction_id', type: 'String' },
						{ name: 'amount', type: 'Number' },
						{ name: 'customer_id', type: 'Integer' },
					],
				},
			},
		],
	},
	AvroOutput: {
		typeId: 'AvroOutput',
		category: StepCategory.BIGDATA,
		displayName: 'Avro Output',
		description: 'Write data to Apache Avro files with configurable compression and schema settings. Generates schema automatically or uses provided schema file. Use for persisting data in compact, schema-rich format for big data processing and long-term storage.',
		tags: ['file', 'bigdata', 'output', 'schema', 'columnar'],
		configurationSchema: avroOutputConfigSchema,
		examples: [
			{
				name: 'Write Events to Avro',
				description: 'Save processed events in compressed Avro format',
				configuration: {
					filename: '/output/processed_events.avro',
					compressionCodec: 'snappy',
					namespace: 'com.example.events',
					recordName: 'UserEvent',
					docString: 'User activity events',
				},
			},
			{
				name: 'Archive Data in Avro',
				description: 'Store historical data with deflate compression',
				configuration: {
					filename: '/archive/sales_history.avro',
					compressionCodec: 'deflate',
					namespace: 'com.example.sales',
					recordName: 'SaleRecord',
				},
			},
		],
	},
};
