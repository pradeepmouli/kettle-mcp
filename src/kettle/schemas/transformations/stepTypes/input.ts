import { z } from 'zod';
import { StepCategory, type StepType } from './types.js';

/**
 * Configuration schema for TableInput step
 */
const tableInputConfigSchema = z.object({
	connection: z.string().min(1).describe('Database connection name'),
	sql: z.string().min(1).describe('SQL query to execute'),
	limit: z.number().optional().describe('Maximum number of rows to return'),
	variables: z.boolean().optional().describe('Enable variable substitution'),
});

/**
 * Configuration schema for TextFileInput step
 */
const textFileInputConfigSchema = z.object({
	filename: z.string().describe('Path to input file'),
	separator: z.string().default(',').describe('Field separator'),
	enclosure: z.string().optional().describe('Field enclosure character'),
	header: z.boolean().default(true).describe('File has header row'),
	fields: z.array(z.object({
		name: z.string(),
		type: z.enum(['String', 'Integer', 'Number', 'Date', 'Boolean']),
	})).describe('Field definitions'),
});

/**
 * Configuration schema for ExcelInput step
 */
const excelInputConfigSchema = z.object({
	filename: z.string().describe('Path to Excel file'),
	sheetName: z.string().optional().describe('Sheet name to read'),
	startRow: z.number().default(0).describe('Starting row number'),
	startColumn: z.number().default(0).describe('Starting column number'),
	fields: z.array(z.object({
		name: z.string(),
		type: z.enum(['String', 'Integer', 'Number', 'Date', 'Boolean']),
	})).describe('Field definitions'),
});

/**
 * Configuration schema for JSONInput step
 */
const jsonInputConfigSchema = z.object({
	filename: z.string().optional().describe('Path to JSON file'),
	sourceIsAFile: z.boolean().default(true).describe('Source is a file'),
	fields: z.array(z.object({
		name: z.string(),
		path: z.string().describe('JSON path to field'),
		type: z.enum(['String', 'Integer', 'Number', 'Date', 'Boolean']),
	})).describe('Field definitions'),
});

/**
 * Configuration schema for RestClient step
 */
const restClientConfigSchema = z.object({
	url: z.string().describe('REST API endpoint URL'),
	method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).default('GET').describe('HTTP method'),
	headers: z.array(z.object({
		name: z.string(),
		value: z.string(),
	})).optional().describe('HTTP headers'),
	body: z.string().optional().describe('Request body'),
	resultFieldName: z.string().default('result').describe('Field name for response'),
});

/**
 * Configuration schema for MySQLBulkLoader step
 */
const mysqlBulkLoaderConfigSchema = z.object({
	connection: z.string().min(1).describe('MySQL database connection name'),
	tableName: z.string().min(1).describe('Target table name'),
	localFile: z.string().optional().describe('Local file path for LOAD DATA LOCAL INFILE'),
	fieldSeparator: z.string().default('\\t').describe('Field separator character'),
	fieldEnclosure: z.string().optional().describe('Field enclosure character'),
	escapeChar: z.string().default('\\\\').describe('Escape character'),
	bulkSize: z.number().default(10000).describe('Number of rows per bulk insert'),
});

/**
 * Configuration schema for database bulk loaders (PostgreSQL, Oracle, SQL Server, etc.)
 */
const bulkLoaderConfigSchema = z.object({
	connection: z.string().min(1).describe('Database connection name'),
	tableName: z.string().min(1).describe('Target table name'),
	truncateTable: z.boolean().default(false).describe('Truncate table before loading'),
	bulkSize: z.number().default(10000).describe('Number of rows per bulk insert'),
	fieldMappings: z.array(z.object({
		streamField: z.string(),
		tableField: z.string(),
	})).describe('Field mappings from stream to table'),
});

/**
 * Configuration schema for DatabaseJoin step
 */
const databaseJoinConfigSchema = z.object({
	connection: z.string().min(1).describe('Database connection name'),
	sql: z.string().min(1).describe('SQL query with parameters (use ? for placeholders)'),
	outerJoin: z.boolean().default(false).describe('Return rows even when query returns no results'),
	parameters: z.array(z.object({
		name: z.string(),
		type: z.enum(['String', 'Integer', 'Number', 'Date', 'Boolean']),
	})).describe('Query parameters from incoming stream'),
});

/**
 * Configuration schema for CSV Input step
 */
const csvInputConfigSchema = z.object({
	filename: z.string().describe('Path to CSV file'),
	delimiter: z.string().default(',').describe('Field delimiter'),
	enclosure: z.string().default('"').describe('Field enclosure character'),
	headerPresent: z.boolean().default(true).describe('First row contains headers'),
	lazyConversion: z.boolean().default(false).describe('Lazy type conversion for performance'),
	fields: z.array(z.object({
		name: z.string(),
		type: z.enum(['String', 'Integer', 'Number', 'Date', 'Boolean']),
		format: z.string().optional(),
	})).describe('Field definitions'),
});

/**
 * Configuration schema for Fixed File Input step
 */
const fixedFileInputConfigSchema = z.object({
	filename: z.string().describe('Path to fixed-width file'),
	lineWidth: z.number().describe('Fixed line width in characters'),
	bufferSize: z.number().default(50000).describe('Buffer size for reading'),
	fields: z.array(z.object({
		name: z.string(),
		type: z.enum(['String', 'Integer', 'Number', 'Date', 'Boolean']),
		width: z.number().describe('Field width in characters'),
		position: z.number().describe('Starting position (0-based)'),
	})).describe('Field definitions with positions'),
});

/**
 * Configuration schema for PropertyInput step
 */
const propertyInputConfigSchema = z.object({
	filename: z.string().describe('Path to .properties file'),
	fileType: z.enum(['properties', 'ini']).default('properties').describe('Property file format'),
	encoding: z.string().default('UTF-8').describe('File encoding'),
	includeFilename: z.boolean().default(false).describe('Include source filename in output'),
});

/**
 * Configuration schema for YAML Input step
 */
const yamlInputConfigSchema = z.object({
	filename: z.string().describe('Path to YAML file'),
	yamlField: z.string().default('yaml_data').describe('Output field name for YAML content'),
	includeFilename: z.boolean().default(false).describe('Include source filename in output'),
});

/**
 * Configuration schema for Parquet Input step
 */
const parquetInputConfigSchema = z.object({
	filename: z.string().describe('Path to Parquet file'),
	schemaFilename: z.string().optional().describe('Optional schema file path'),
	fields: z.array(z.object({
		name: z.string(),
		type: z.enum(['String', 'Integer', 'Number', 'Date', 'Boolean']),
	})).describe('Field definitions'),
});

/**
 * Configuration schema for Kafka Consumer step
 */
const kafkaConsumerConfigSchema = z.object({
	bootstrapServers: z.string().describe('Kafka bootstrap servers (host:port,...)'),
	topics: z.array(z.string()).describe('Topic names to consume from'),
	consumerGroup: z.string().describe('Consumer group ID'),
	autoOffsetReset: z.enum(['earliest', 'latest', 'none']).default('latest').describe('Auto offset reset policy'),
	keyField: z.string().default('kafka_key').describe('Output field name for message key'),
	messageField: z.string().default('kafka_message').describe('Output field name for message value'),
	partitionField: z.string().optional().describe('Output field name for partition number'),
	offsetField: z.string().optional().describe('Output field name for offset'),
});

/**
 * Configuration schema for JMS/MQ Input steps
 */
const jmsInputConfigSchema = z.object({
	connectionFactory: z.string().describe('JMS connection factory JNDI name'),
	destinationName: z.string().describe('Queue or topic name'),
	destinationType: z.enum(['queue', 'topic']).default('queue').describe('Destination type'),
	receiveTimeout: z.number().default(1000).describe('Receive timeout in milliseconds'),
	messageField: z.string().default('jms_message').describe('Output field name for message'),
});

/**
 * Configuration schema for MQTT Subscriber step
 */
const mqttSubscriberConfigSchema = z.object({
	broker: z.string().describe('MQTT broker URL (tcp://host:port)'),
	topics: z.array(z.string()).describe('Topic patterns to subscribe to'),
	qos: z.enum(['0', '1', '2']).default('1').describe('Quality of Service level'),
	clientId: z.string().describe('MQTT client ID'),
	messageField: z.string().default('mqtt_message').describe('Output field name for message'),
	topicField: z.string().default('mqtt_topic').describe('Output field name for topic'),
});

/**
 * Configuration schema for SOAP/Web Service steps
 */
const soapInputConfigSchema = z.object({
	wsdlUrl: z.string().describe('WSDL URL or file path'),
	operationName: z.string().describe('SOAP operation to invoke'),
	requestField: z.string().describe('Field containing SOAP request XML'),
	responseField: z.string().default('soap_response').describe('Output field for SOAP response'),
	httpAuth: z.object({
		username: z.string().optional(),
		password: z.string().optional(),
	}).optional().describe('HTTP authentication credentials'),
});

/**
 * Configuration schema for HTTP Client step
 */
const httpClientConfigSchema = z.object({
	url: z.string().describe('HTTP endpoint URL'),
	method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'HEAD']).default('GET').describe('HTTP method'),
	bodyField: z.string().optional().describe('Input field containing request body'),
	headerFields: z.array(z.object({
		name: z.string(),
		field: z.string(),
	})).optional().describe('Headers from input fields'),
	resultField: z.string().default('http_result').describe('Output field for response'),
	statusCodeField: z.string().default('http_status').describe('Output field for status code'),
});

/**
 * Configuration schema for S3 CSV Input step
 */
const s3CsvInputConfigSchema = z.object({
	awsAccessKey: z.string().describe('AWS access key ID'),
	awsSecretKey: z.string().describe('AWS secret access key'),
	bucket: z.string().describe('S3 bucket name'),
	key: z.string().describe('S3 object key (supports wildcards)'),
	region: z.string().default('us-east-1').describe('AWS region'),
	delimiter: z.string().default(',').describe('CSV delimiter'),
	includeHeader: z.boolean().default(true).describe('First row is header'),
	fields: z.array(z.object({
		name: z.string(),
		type: z.enum(['String', 'Integer', 'Number', 'Date', 'Boolean']),
	})).describe('Field definitions'),
});

/**
 * Configuration schema for MongoDB Input step
 */
const mongoDbInputConfigSchema = z.object({
	hostname: z.string().describe('MongoDB hostname'),
	port: z.number().default(27017).describe('MongoDB port'),
	database: z.string().describe('Database name'),
	collection: z.string().describe('Collection name'),
	query: z.string().describe('MongoDB query (JSON format)'),
	fields: z.array(z.object({
		name: z.string(),
		path: z.string().describe('Field path in document'),
		type: z.enum(['String', 'Integer', 'Number', 'Date', 'Boolean']),
	})).describe('Field definitions'),
});

/**
 * Configuration schema for Cassandra Input step
 */
const cassandraInputConfigSchema = z.object({
	hostname: z.string().describe('Cassandra hostname'),
	port: z.number().default(9042).describe('Cassandra port'),
	keyspace: z.string().describe('Keyspace name'),
	cqlQuery: z.string().describe('CQL SELECT query'),
	consistencyLevel: z.enum(['ONE', 'QUORUM', 'ALL']).default('ONE').describe('Read consistency level'),
	timeout: z.number().default(30000).describe('Query timeout in milliseconds'),
});

/**
 * Configuration schema for Elasticsearch Input step
 */
const elasticsearchInputConfigSchema = z.object({
	hostname: z.string().describe('Elasticsearch hostname'),
	port: z.number().default(9200).describe('Elasticsearch port'),
	index: z.string().describe('Index name or pattern'),
	type: z.string().optional().describe('Document type (deprecated in ES 7+)'),
	query: z.string().describe('Elasticsearch query (JSON format)'),
	scrollSize: z.number().default(1000).describe('Scroll batch size'),
	scrollTimeout: z.string().default('1m').describe('Scroll context timeout'),
});

/**
 * Configuration schema for Salesforce Input step
 */
const salesforceInputConfigSchema = z.object({
	username: z.string().describe('Salesforce username'),
	password: z.string().describe('Salesforce password'),
	securityToken: z.string().optional().describe('Salesforce security token'),
	module: z.string().describe('Salesforce object type (e.g., Account, Contact)'),
	query: z.string().describe('SOQL query'),
	timeout: z.number().default(60000).describe('Query timeout in milliseconds'),
});

/**
 * Configuration schema for GetXMLData step
 */
const getXMLDataConfigSchema = z.object({
	filename: z.string().optional().describe('Path to XML file'),
	xmlSource: z.enum(['file', 'field']).default('file').describe('XML source type'),
	xmlField: z.string().optional().describe('Field containing XML data (if source is field)'),
	loopXPath: z.string().describe('XPath expression for repeating elements'),
	fields: z.array(z.object({
		name: z.string(),
		xpath: z.string().describe('XPath expression for field'),
		type: z.enum(['String', 'Integer', 'Number', 'Date', 'Boolean']),
	})).describe('Field definitions with XPath'),
});

/**
 * Configuration schema for RSS Input step
 */
const rssInputConfigSchema = z.object({
	url: z.string().describe('RSS feed URL'),
	readFrom: z.string().optional().describe('Read items from this timestamp'),
	urlField: z.string().default('url').describe('Output field for item URL'),
	titleField: z.string().default('title').describe('Output field for item title'),
	descriptionField: z.string().default('description').describe('Output field for description'),
	pubDateField: z.string().default('pubDate').describe('Output field for publication date'),
});

/**
 * Configuration schema for LDAP Input step
 */
const ldapInputConfigSchema = z.object({
	host: z.string().describe('LDAP server hostname'),
	port: z.number().default(389).describe('LDAP server port'),
	baseDN: z.string().describe('Base DN for search'),
	filter: z.string().describe('LDAP search filter'),
	searchScope: z.enum(['object', 'onelevel', 'subtree']).default('subtree').describe('Search scope'),
	fields: z.array(z.object({
		name: z.string(),
		attribute: z.string().describe('LDAP attribute name'),
	})).describe('Field definitions from LDAP attributes'),
});

/**
 * Input step types registry
 */
export const INPUT_STEPS: Record<string, StepType> = {
	TableInput: {
		typeId: 'TableInput',
		category: StepCategory.INPUT,
		displayName: 'Table Input',
		description: 'Read data from a database table or view using SQL queries. Executes SELECT statements and streams results into the transformation. Supports connection pooling, parameterized queries, and variable substitution. Use for extracting data from relational databases (MySQL, PostgreSQL, Oracle, SQL Server, etc.).',
		tags: ['database', 'input', 'sql', 'read', 'etl'],
		configurationSchema: tableInputConfigSchema,
		examples: [
			{
				name: 'Read Customer Records',
				description: 'Select all active customers from a PostgreSQL database',
				configuration: {
					connection: 'PostgreSQL_Production',
					sql: 'SELECT customer_id, name, email, created_at FROM customers WHERE status = \'active\'',
					limit: 10000,
					variables: true,
				},
			},
			{
				name: 'Data Warehouse Extract',
				description: 'Extract daily sales data using parameterized query',
				configuration: {
					connection: 'MySQL_DataWarehouse',
					sql: 'SELECT * FROM sales WHERE sale_date = \'${P_EXTRACT_DATE}\'',
					variables: true,
				},
			},
		],
	},
	TextFileInput: {
		typeId: 'TextFileInput',
		category: StepCategory.INPUT,
		displayName: 'Text File Input',
		description: 'Read data from delimited text files including CSV, TSV, and custom formats. Supports header parsing, field type detection, encoding selection, and compression (gzip, zip). Use for ingesting flat files, log files, or data exports from external systems. Handles multiple file patterns and wildcards.',
		tags: ['file', 'input', 'csv', 'text', 'read', 'batch'],
		configurationSchema: textFileInputConfigSchema,
		examples: [
			{
				name: 'Import Customer CSV',
				description: 'Read customer data from a comma-delimited CSV file with headers',
				configuration: {
					filename: '/data/imports/customers.csv',
					separator: ',',
					enclosure: '"',
					header: true,
					fields: [
						{ name: 'customer_id', type: 'Integer' },
						{ name: 'name', type: 'String' },
						{ name: 'email', type: 'String' },
						{ name: 'signup_date', type: 'Date' },
					],
				},
			},
			{
				name: 'Process Server Logs',
				description: 'Parse tab-delimited log files without headers',
				configuration: {
					filename: '/var/log/app/*.log',
					separator: '\\t',
					header: false,
					fields: [
						{ name: 'timestamp', type: 'Date' },
						{ name: 'level', type: 'String' },
						{ name: 'message', type: 'String' },
					],
				},
			},
		],
	},
	ExcelInput: {
		typeId: 'ExcelInput',
		category: StepCategory.INPUT,
		displayName: 'Excel Input',
		description: 'Read data from Microsoft Excel files (.xls, .xlsx). Supports multiple sheets, cell ranges, and formula evaluation. Handles both legacy and modern Excel formats. Use for importing spreadsheet data, financial reports, or data exports from Excel-based systems.',
		tags: ['excel', 'input', 'file', 'spreadsheet', 'read'],
		configurationSchema: excelInputConfigSchema,
		examples: [
			{
				name: 'Import Sales Report',
				description: 'Read quarterly sales data from Excel spreadsheet',
				configuration: {
					filename: '/reports/Q4_Sales_2024.xlsx',
					sheetName: 'Sales_Data',
					startRow: 1,
					startColumn: 0,
					fields: [
						{ name: 'product_id', type: 'String' },
						{ name: 'product_name', type: 'String' },
						{ name: 'quantity_sold', type: 'Integer' },
						{ name: 'revenue', type: 'Number' },
						{ name: 'sale_date', type: 'Date' },
					],
				},
			},
			{
				name: 'Employee Data Import',
				description: 'Load employee records from HR Excel file',
				configuration: {
					filename: '/hr/employees_2024.xlsx',
					sheetName: 'Active_Employees',
					startRow: 0,
					startColumn: 0,
					fields: [
						{ name: 'employee_id', type: 'Integer' },
						{ name: 'full_name', type: 'String' },
						{ name: 'department', type: 'String' },
						{ name: 'hire_date', type: 'Date' },
						{ name: 'salary', type: 'Number' },
					],
				},
			},
		],
	},
	JSONInput: {
		typeId: 'JSONInput',
		category: StepCategory.INPUT,
		displayName: 'JSON Input',
		description: 'Parse and read data from JSON files or strings using JSONPath expressions. Supports nested structures, arrays, and complex hierarchies. Use for ingesting API responses, configuration files, or NoSQL database exports. Handles both file-based and inline JSON.',
		tags: ['json', 'input', 'file', 'rest-api', 'read', 'nosql'],
		configurationSchema: jsonInputConfigSchema,
		examples: [
			{
				name: 'Parse API Response File',
				description: 'Read customer data from JSON API response saved to file',
				configuration: {
					filename: '/data/api_responses/customers.json',
					sourceIsAFile: true,
					fields: [
						{ name: 'id', path: '$.id', type: 'Integer' },
						{ name: 'name', path: '$.name', type: 'String' },
						{ name: 'email', path: '$.contact.email', type: 'String' },
						{ name: 'created', path: '$.metadata.created_at', type: 'Date' },
					],
				},
			},
			{
				name: 'Parse NoSQL Export',
				description: 'Extract fields from MongoDB JSON export',
				configuration: {
					filename: '/exports/mongodb_users.json',
					sourceIsAFile: true,
					fields: [
						{ name: 'user_id', path: '$._id', type: 'String' },
						{ name: 'username', path: '$.username', type: 'String' },
						{ name: 'status', path: '$.account.status', type: 'String' },
						{ name: 'last_login', path: '$.account.lastLogin', type: 'Date' },
					],
				},
			},
		],
	},
	RestClient: {
		typeId: 'RestClient',
		category: StepCategory.INPUT,
		displayName: 'REST Client',
		description: 'Call REST API endpoints and retrieve responses. Supports all HTTP methods (GET, POST, PUT, DELETE, PATCH), custom headers, authentication, and JSON/XML parsing. Use for integrating with web services, microservices, or third-party APIs. Enables dynamic parameter substitution for each row.',
		tags: ['rest-api', 'input', 'http', 'api', 'web-service', 'json'],
		configurationSchema: restClientConfigSchema,
		examples: [
			{
				name: 'Fetch User Data',
				description: 'GET user details from REST API',
				configuration: {
					url: 'https://api.example.com/users/${USER_ID}',
					method: 'GET',
					headers: [
						{ name: 'Authorization', value: 'Bearer ${API_TOKEN}' },
						{ name: 'Content-Type', value: 'application/json' },
					],
					resultFieldName: 'user_data',
				},
			},
			{
				name: 'Create Order via API',
				description: 'POST order data to external order management system',
				configuration: {
					url: 'https://api.example.com/orders',
					method: 'POST',
					headers: [
						{ name: 'Authorization', value: 'Bearer ${API_TOKEN}' },
						{ name: 'Content-Type', value: 'application/json' },
					],
					body: '{"customer_id": "${CUSTOMER_ID}", "items": ${ORDER_ITEMS}, "total": ${ORDER_TOTAL}}',
					resultFieldName: 'order_response',
				},
			},
		],
	},
	
	// Database Input Steps (8 types)
	MySQLBulkLoader: {
		typeId: 'MySQLBulkLoader',
		category: StepCategory.INPUT,
		displayName: 'MySQL Bulk Loader',
		description: 'Load large volumes of data into MySQL database tables using LOAD DATA INFILE for maximum performance. Bypasses SQL INSERT statements for faster bulk loading. Supports field separators, enclosures, and escape characters. Use for high-volume data imports into MySQL databases.',
		tags: ['database', 'input', 'mysql', 'bulk', 'performance'],
		configurationSchema: mysqlBulkLoaderConfigSchema,
		examples: [
			{
				name: 'Bulk Load Customer Data',
				description: 'Fast load of customer records into MySQL table',
				configuration: {
					connection: 'MySQL_Production',
					tableName: 'customers',
					fieldSeparator: '\\t',
					bulkSize: 50000,
				},
			},
			{
				name: 'Data Warehouse ETL',
				description: 'Load fact table with high-volume transaction data',
				configuration: {
					connection: 'MySQL_DW',
					tableName: 'fact_sales',
					fieldSeparator: ',',
					fieldEnclosure: '"',
					bulkSize: 100000,
				},
			},
		],
	},
	
	PostgreSQLBulkLoader: {
		typeId: 'PostgreSQLBulkLoader',
		category: StepCategory.INPUT,
		displayName: 'PostgreSQL Bulk Loader',
		description: 'Load large volumes of data into PostgreSQL database tables using COPY command for optimal performance. Handles tab-delimited and CSV formats. Supports field mappings and error tolerance. Use for high-volume data imports into PostgreSQL databases.',
		tags: ['database', 'input', 'postgresql', 'bulk', 'performance'],
		configurationSchema: bulkLoaderConfigSchema,
		examples: [
			{
				name: 'Bulk Load Product Catalog',
				description: 'Fast load of product data into PostgreSQL',
				configuration: {
					connection: 'PostgreSQL_Prod',
					tableName: 'products',
					truncateTable: false,
					bulkSize: 50000,
					fieldMappings: [
						{ streamField: 'prod_id', tableField: 'product_id' },
						{ streamField: 'prod_name', tableField: 'name' },
						{ streamField: 'price', tableField: 'unit_price' },
					],
				},
			},
		],
	},
	
	OracleBulkLoader: {
		typeId: 'OracleBulkLoader',
		category: StepCategory.INPUT,
		displayName: 'Oracle Bulk Loader',
		description: 'Load large volumes of data into Oracle database tables using SQL*Loader or direct path loading for maximum throughput. Supports parallel loading and partitioned tables. Use for enterprise-scale data imports into Oracle databases.',
		tags: ['database', 'input', 'oracle', 'bulk', 'enterprise'],
		configurationSchema: bulkLoaderConfigSchema,
		examples: [
			{
				name: 'Load Financial Transactions',
				description: 'Bulk load transaction data into Oracle data warehouse',
				configuration: {
					connection: 'Oracle_DW',
					tableName: 'TRANSACTIONS',
					truncateTable: false,
					bulkSize: 100000,
					fieldMappings: [
						{ streamField: 'txn_id', tableField: 'TRANSACTION_ID' },
						{ streamField: 'amount', tableField: 'AMOUNT' },
						{ streamField: 'txn_date', tableField: 'TRANSACTION_DATE' },
					],
				},
			},
		],
	},
	
	SQLServerBulkLoader: {
		typeId: 'SQLServerBulkLoader',
		category: StepCategory.INPUT,
		displayName: 'SQL Server Bulk Loader',
		description: 'Load large volumes of data into Microsoft SQL Server tables using BCP (Bulk Copy Program) for high-performance inserts. Supports field mappings and batch sizing. Use for high-volume data imports into SQL Server databases.',
		tags: ['database', 'input', 'sqlserver', 'bulk', 'microsoft'],
		configurationSchema: bulkLoaderConfigSchema,
		examples: [
			{
				name: 'Load Sales Data',
				description: 'Fast load of daily sales into SQL Server',
				configuration: {
					connection: 'SQLServer_Analytics',
					tableName: 'DailySales',
					truncateTable: true,
					bulkSize: 50000,
					fieldMappings: [
						{ streamField: 'sale_id', tableField: 'SaleID' },
						{ streamField: 'customer', tableField: 'CustomerName' },
						{ streamField: 'total', tableField: 'TotalAmount' },
					],
				},
			},
		],
	},
	
	MonetDBBulkLoader: {
		typeId: 'MonetDBBulkLoader',
		category: StepCategory.INPUT,
		displayName: 'MonetDB Bulk Loader',
		description: 'Load large volumes of data into MonetDB columnar database using COPY INTO for analytical workloads. Optimized for column-oriented storage and query performance. Use for loading data warehouses and analytical databases.',
		tags: ['database', 'input', 'nosql', 'bulk', 'analytics'],
		configurationSchema: bulkLoaderConfigSchema,
		examples: [
			{
				name: 'Load Analytics Data',
				description: 'Bulk load clickstream data into MonetDB',
				configuration: {
					connection: 'MonetDB_Analytics',
					tableName: 'clickstream',
					bulkSize: 100000,
					fieldMappings: [
						{ streamField: 'event_id', tableField: 'id' },
						{ streamField: 'timestamp', tableField: 'event_time' },
						{ streamField: 'user_id', tableField: 'user' },
					],
				},
			},
		],
	},
	
	VerticaBulkLoader: {
		typeId: 'VerticaBulkLoader',
		category: StepCategory.INPUT,
		displayName: 'Vertica Bulk Loader',
		description: 'Load large volumes of data into Vertica analytical database using COPY command optimized for columnar storage. Supports parallel loading and compression. Use for enterprise analytical data warehouses requiring high-performance bulk loading.',
		tags: ['database', 'input', 'analytics', 'bulk', 'enterprise'],
		configurationSchema: bulkLoaderConfigSchema,
		examples: [
			{
				name: 'Load Time Series Data',
				description: 'Bulk load sensor data into Vertica',
				configuration: {
					connection: 'Vertica_TimeSeries',
					tableName: 'sensor_readings',
					bulkSize: 200000,
					fieldMappings: [
						{ streamField: 'sensor', tableField: 'sensor_id' },
						{ streamField: 'reading', tableField: 'value' },
						{ streamField: 'ts', tableField: 'timestamp' },
					],
				},
			},
		],
	},
	
	DatabaseJoin: {
		typeId: 'DatabaseJoin',
		category: StepCategory.INPUT,
		displayName: 'Database Join',
		description: 'Execute parameterized database queries for each input row to perform lookups or joins with database tables. Supports outer joins and query optimization. Use for enriching stream data with database lookups or performing row-by-row database queries.',
		tags: ['database', 'input', 'join', 'lookup', 'sql'],
		configurationSchema: databaseJoinConfigSchema,
		examples: [
			{
				name: 'Enrich Orders with Customer Data',
				description: 'Lookup customer details for each order',
				configuration: {
					connection: 'PostgreSQL_CRM',
					sql: 'SELECT name, email, phone FROM customers WHERE customer_id = ?',
					outerJoin: true,
					parameters: [
						{ name: 'customer_id', type: 'Integer' },
					],
				},
			},
			{
				name: 'Product Price Lookup',
				description: 'Get current product pricing from database',
				configuration: {
					connection: 'MySQL_Pricing',
					sql: 'SELECT price, discount FROM product_pricing WHERE product_code = ? AND effective_date <= ?',
					outerJoin: false,
					parameters: [
						{ name: 'product_code', type: 'String' },
						{ name: 'transaction_date', type: 'Date' },
					],
				},
			},
		],
	},
	
	GetTableNames: {
		typeId: 'GetTableNames',
		category: StepCategory.INPUT,
		displayName: 'Get Table Names',
		description: 'Retrieve list of table names from a database connection for metadata-driven ETL workflows. Supports schema filtering and pattern matching. Use for dynamically discovering database tables for processing or metadata extraction.',
		tags: ['database', 'input', 'metadata', 'schema', 'discovery'],
		configurationSchema: z.object({
			connection: z.string().min(1).describe('Database connection name'),
			schemaName: z.string().optional().describe('Schema name filter (leave empty for all schemas)'),
			includeSystemTables: z.boolean().default(false).describe('Include system tables in results'),
			tableNamePattern: z.string().optional().describe('Table name pattern (supports % wildcard)'),
		}),
		examples: [
			{
				name: 'List User Tables',
				description: 'Get all user tables from a schema',
				configuration: {
					connection: 'Oracle_Prod',
					schemaName: 'APP_SCHEMA',
					includeSystemTables: false,
				},
			},
		],
	},
	
	// File Input Steps (7 types)
	CSVInput: {
		typeId: 'CSVInput',
		category: StepCategory.INPUT,
		displayName: 'CSV Input',
		description: 'Read data from CSV (Comma-Separated Values) files with advanced parsing options including custom delimiters, enclosures, and encoding. Optimized for large files with lazy conversion and parallel reading. Use for processing CSV exports, data feeds, and flat file imports.',
		tags: ['file', 'input', 'csv', 'text', 'read'],
		configurationSchema: csvInputConfigSchema,
		examples: [
			{
				name: 'Import Sales CSV',
				description: 'Read daily sales data from CSV file',
				configuration: {
					filename: '/data/sales/daily_sales_${DATE}.csv',
					delimiter: ',',
					enclosure: '"',
					headerPresent: true,
					lazyConversion: true,
					fields: [
						{ name: 'sale_id', type: 'Integer' },
						{ name: 'product', type: 'String' },
						{ name: 'quantity', type: 'Integer' },
						{ name: 'amount', type: 'Number', format: '###,###.00' },
						{ name: 'sale_date', type: 'Date', format: 'yyyy-MM-dd' },
					],
				},
			},
		],
	},
	
	FixedFileInput: {
		typeId: 'FixedFileInput',
		category: StepCategory.INPUT,
		displayName: 'Fixed File Input',
		description: 'Read data from fixed-width text files where each field has a specific position and length. Common in mainframe and legacy system exports. Supports field positioning by character offset and width. Use for processing fixed-format files from legacy systems or mainframes.',
		tags: ['file', 'input', 'text', 'mainframe', 'legacy'],
		configurationSchema: fixedFileInputConfigSchema,
		examples: [
			{
				name: 'Mainframe Extract',
				description: 'Read fixed-width customer file from mainframe',
				configuration: {
					filename: '/data/mainframe/CUST.DAT',
					lineWidth: 200,
					bufferSize: 100000,
					fields: [
						{ name: 'customer_id', type: 'String', width: 10, position: 0 },
						{ name: 'name', type: 'String', width: 50, position: 10 },
						{ name: 'account_number', type: 'String', width: 20, position: 60 },
						{ name: 'balance', type: 'Number', width: 15, position: 80 },
					],
				},
			},
		],
	},
	
	AccessInput: {
		typeId: 'AccessInput',
		category: StepCategory.INPUT,
		displayName: 'Microsoft Access Input',
		description: 'Read data from Microsoft Access database files (.mdb, .accdb). Supports table and query extraction. Use for importing data from desktop Access databases or legacy Access applications.',
		tags: ['file', 'input', 'access', 'database', 'microsoft'],
		configurationSchema: z.object({
			filename: z.string().describe('Path to Access database file'),
			tableName: z.string().optional().describe('Table name to read'),
			query: z.string().optional().describe('SQL query to execute'),
			limit: z.number().optional().describe('Maximum rows to return'),
		}),
		examples: [
			{
				name: 'Extract Access Table',
				description: 'Read customer table from Access database',
				configuration: {
					filename: '/data/legacy/customers.accdb',
					tableName: 'tblCustomers',
					limit: 100000,
				},
			},
		],
	},
	
	PropertyInput: {
		typeId: 'PropertyInput',
		category: StepCategory.INPUT,
		displayName: 'Property File Input',
		description: 'Read configuration data from Java .properties or .ini files. Parses key-value pairs into structured data. Use for reading application configuration files, environment settings, or property-based data sources.',
		tags: ['file', 'input', 'properties', 'text', 'configuration'],
		configurationSchema: propertyInputConfigSchema,
		examples: [
			{
				name: 'Load Application Config',
				description: 'Read application properties file',
				configuration: {
					filename: '/config/application.properties',
					fileType: 'properties',
					encoding: 'UTF-8',
					includeFilename: true,
				},
			},
		],
	},
	
	LDIFInput: {
		typeId: 'LDIFInput',
		category: StepCategory.INPUT,
		displayName: 'LDIF Input',
		description: 'Read and parse LDIF (LDAP Data Interchange Format) files containing directory service entries. Supports multi-valued attributes and entry parsing. Use for processing LDAP exports, directory service data, or user/group information from directory servers.',
		tags: ['file', 'input', 'ldif', 'ldap', 'directory'],
		configurationSchema: z.object({
			filename: z.string().describe('Path to LDIF file'),
			encoding: z.string().default('UTF-8').describe('File encoding'),
			fields: z.array(z.object({
				name: z.string(),
				ldifAttribute: z.string().describe('LDIF attribute name'),
			})).describe('Field mappings from LDIF attributes'),
		}),
		examples: [
			{
				name: 'Import LDAP Users',
				description: 'Read user entries from LDIF export',
				configuration: {
					filename: '/exports/users.ldif',
					encoding: 'UTF-8',
					fields: [
						{ name: 'username', ldifAttribute: 'uid' },
						{ name: 'full_name', ldifAttribute: 'cn' },
						{ name: 'email', ldifAttribute: 'mail' },
						{ name: 'department', ldifAttribute: 'departmentNumber' },
					],
				},
			},
		],
	},
	
	YAMLInput: {
		typeId: 'YAMLInput',
		category: StepCategory.INPUT,
		displayName: 'YAML Input',
		description: 'Read and parse YAML (YAML Ain\'t Markup Language) files. Supports nested structures and lists. Use for reading configuration files, Kubernetes manifests, or data serialized in YAML format.',
		tags: ['file', 'input', 'yaml', 'text', 'configuration'],
		configurationSchema: yamlInputConfigSchema,
		examples: [
			{
				name: 'Load Config YAML',
				description: 'Read application configuration from YAML',
				configuration: {
					filename: '/config/app-config.yaml',
					yamlField: 'config_data',
					includeFilename: true,
				},
			},
		],
	},
	
	ParquetInput: {
		typeId: 'ParquetInput',
		category: StepCategory.INPUT,
		displayName: 'Parquet File Input',
		description: 'Read data from Apache Parquet columnar storage files. Optimized for analytical queries and compression. Supports schema evolution and predicate pushdown. Use for reading big data files from Hadoop, Spark, or cloud storage systems.',
		tags: ['file', 'input', 'parquet', 'bigdata', 'columnar'],
		configurationSchema: parquetInputConfigSchema,
		examples: [
			{
				name: 'Read Analytics Data',
				description: 'Load Parquet files from data lake',
				configuration: {
					filename: '/datalake/events/year=2024/month=10/*.parquet',
					fields: [
						{ name: 'event_id', type: 'String' },
						{ name: 'user_id', type: 'String' },
						{ name: 'event_type', type: 'String' },
						{ name: 'timestamp', type: 'Date' },
					],
				},
			},
		],
	},
	
	// Streaming Input Steps (4 types)
	KafkaConsumer: {
		typeId: 'KafkaConsumer',
		category: StepCategory.INPUT,
		displayName: 'Kafka Consumer',
		description: 'Consume messages from Apache Kafka topics in real-time streaming workflows. Supports consumer groups, offset management, and parallel consumption. Use for ingesting event streams, change data capture, or real-time data pipelines from Kafka.',
		tags: ['streaming', 'input', 'kafka', 'realtime', 'events'],
		configurationSchema: kafkaConsumerConfigSchema,
		examples: [
			{
				name: 'Consume User Events',
				description: 'Read user activity events from Kafka topic',
				configuration: {
					bootstrapServers: 'kafka1:9092,kafka2:9092,kafka3:9092',
					topics: ['user-events', 'user-activity'],
					consumerGroup: 'etl-consumer-group',
					autoOffsetReset: 'earliest',
					keyField: 'event_key',
					messageField: 'event_data',
					partitionField: 'kafka_partition',
					offsetField: 'kafka_offset',
				},
			},
		],
	},
	
	JMSInput: {
		typeId: 'JMSInput',
		category: StepCategory.INPUT,
		displayName: 'JMS Consumer',
		description: 'Consume messages from JMS (Java Message Service) queues or topics. Supports JNDI lookup, transaction management, and message selectors. Use for integrating with enterprise messaging systems like ActiveMQ, RabbitMQ, or IBM MQ.',
		tags: ['streaming', 'input', 'jms', 'queue', 'messaging'],
		configurationSchema: jmsInputConfigSchema,
		examples: [
			{
				name: 'Process Order Queue',
				description: 'Consume order messages from JMS queue',
				configuration: {
					connectionFactory: 'jms/ConnectionFactory',
					destinationName: 'jms/OrderQueue',
					destinationType: 'queue',
					receiveTimeout: 5000,
					messageField: 'order_message',
				},
			},
		],
	},
	
	MQInput: {
		typeId: 'MQInput',
		category: StepCategory.INPUT,
		displayName: 'IBM MQ Input',
		description: 'Consume messages from IBM MQ (formerly WebSphere MQ) queues. Enterprise-grade messaging for mission-critical applications. Supports transactional messaging and guaranteed delivery. Use for integrating with IBM MQ messaging infrastructure.',
		tags: ['streaming', 'input', 'queue', 'messaging', 'enterprise'],
		configurationSchema: jmsInputConfigSchema,
		examples: [
			{
				name: 'Read Transaction Queue',
				description: 'Consume transaction messages from IBM MQ',
				configuration: {
					connectionFactory: 'wmq/ConnectionFactory',
					destinationName: 'TRANSACTION.QUEUE',
					destinationType: 'queue',
					receiveTimeout: 3000,
					messageField: 'transaction_data',
				},
			},
		],
	},
	
	MQTTSubscriber: {
		typeId: 'MQTTSubscriber',
		category: StepCategory.INPUT,
		displayName: 'MQTT Subscriber',
		description: 'Subscribe to MQTT topics for IoT (Internet of Things) and lightweight messaging. Supports QoS levels and wildcard topic subscriptions. Use for ingesting IoT sensor data, device telemetry, or pub/sub messaging from MQTT brokers.',
		tags: ['streaming', 'input', 'mqtt', 'iot', 'telemetry'],
		configurationSchema: mqttSubscriberConfigSchema,
		examples: [
			{
				name: 'IoT Sensor Data',
				description: 'Subscribe to temperature sensor topics',
				configuration: {
					broker: 'tcp://iot-broker:1883',
					topics: ['sensors/temperature/#', 'sensors/humidity/#'],
					qos: '1',
					clientId: 'kettle-iot-consumer-001',
					messageField: 'sensor_reading',
					topicField: 'sensor_topic',
				},
			},
		],
	},
	
	// Web Service Input Steps (3 types)
	SOAPInput: {
		typeId: 'SOAPInput',
		category: StepCategory.INPUT,
		displayName: 'SOAP Web Service Input',
		description: 'Invoke SOAP web services and process responses. Supports WSDL-based service discovery, authentication, and complex SOAP envelopes. Use for integrating with enterprise SOAP APIs and legacy web services.',
		tags: ['api', 'input', 'soap', 'web-service', 'xml'],
		configurationSchema: soapInputConfigSchema,
		examples: [
			{
				name: 'Invoke Customer Lookup Service',
				description: 'Call SOAP service to retrieve customer data',
				configuration: {
					wsdlUrl: 'https://services.example.com/CustomerService?wsdl',
					operationName: 'getCustomerDetails',
					requestField: 'soap_request',
					responseField: 'soap_response',
					httpAuth: {
						username: '${SOAP_USER}',
						password: '${SOAP_PASSWORD}',
					},
				},
			},
		],
	},
	
	HTTPClient: {
		typeId: 'HTTPClient',
		category: StepCategory.INPUT,
		displayName: 'HTTP Client',
		description: 'Execute HTTP requests with full control over headers, body, and method. Supports dynamic URLs and parameters from input fields. Use for calling REST APIs, webhooks, or any HTTP endpoints row-by-row.',
		tags: ['api', 'input', 'http', 'web-service', 'rest'],
		configurationSchema: httpClientConfigSchema,
		examples: [
			{
				name: 'Fetch Product Details',
				description: 'GET product information from REST API for each SKU',
				configuration: {
					url: 'https://api.example.com/products/${product_sku}',
					method: 'GET',
					headerFields: [
						{ name: 'Authorization', field: 'auth_token' },
					],
					resultField: 'product_json',
					statusCodeField: 'http_status',
				},
			},
		],
	},
	
	WebServiceLookup: {
		typeId: 'WebServiceLookup',
		category: StepCategory.INPUT,
		displayName: 'Web Service Lookup',
		description: 'Call web services for each row to enrich data with external API responses. Optimized for lookup operations with caching and connection pooling. Use for enriching stream data with web service calls or API-based data augmentation.',
		tags: ['api', 'input', 'lookup', 'web-service', 'rest'],
		configurationSchema: z.object({
			wsdlUrl: z.string().optional().describe('WSDL URL for SOAP services'),
			httpUrl: z.string().optional().describe('HTTP URL for REST services'),
			operationName: z.string().describe('Operation or endpoint name'),
			inputFields: z.array(z.string()).describe('Fields to pass to service'),
			outputField: z.string().default('lookup_result').describe('Field for service response'),
		}),
		examples: [
			{
				name: 'Address Validation',
				description: 'Validate addresses using external API',
				configuration: {
					httpUrl: 'https://api.addressvalidation.com/validate',
					operationName: 'validateAddress',
					inputFields: ['street', 'city', 'state', 'zip'],
					outputField: 'validated_address',
				},
			},
		],
	},
	
	// Cloud/NoSQL Input Steps (5 types)
	S3CSVInput: {
		typeId: 'S3CSVInput',
		category: StepCategory.INPUT,
		displayName: 'S3 CSV Input',
		description: 'Read CSV files from Amazon S3 cloud storage. Supports IAM credentials, wildcards for multiple files, and streaming large files. Use for processing data stored in AWS S3 buckets without local downloads.',
		tags: ['cloud', 'input', 'csv', 's3', 'aws'],
		configurationSchema: s3CsvInputConfigSchema,
		examples: [
			{
				name: 'Read S3 Data Lake Files',
				description: 'Process daily CSV files from S3 data lake',
				configuration: {
					awsAccessKey: '${AWS_ACCESS_KEY}',
					awsSecretKey: '${AWS_SECRET_KEY}',
					bucket: 'company-datalake',
					key: 'raw/sales/year=2024/month=10/*.csv',
					region: 'us-east-1',
					delimiter: ',',
					includeHeader: true,
					fields: [
						{ name: 'transaction_id', type: 'String' },
						{ name: 'amount', type: 'Number' },
						{ name: 'date', type: 'Date' },
					],
				},
			},
		],
	},
	
	MongoDbInput: {
		typeId: 'MongoDbInput',
		category: StepCategory.INPUT,
		displayName: 'MongoDB Input',
		description: 'Query and read documents from MongoDB collections. Supports MongoDB query language, aggregation pipelines, and field projection. Use for extracting data from MongoDB NoSQL databases or document stores.',
		tags: ['nosql', 'input', 'mongodb', 'database', 'document'],
		configurationSchema: mongoDbInputConfigSchema,
		examples: [
			{
				name: 'Extract User Documents',
				description: 'Read active users from MongoDB collection',
				configuration: {
					hostname: 'mongo-prod-01',
					port: 27017,
					database: 'application_db',
					collection: 'users',
					query: '{"status": "active", "created_at": {"$gte": ISODate("2024-01-01")}}',
					fields: [
						{ name: 'user_id', path: '_id', type: 'String' },
						{ name: 'username', path: 'username', type: 'String' },
						{ name: 'email', path: 'contact.email', type: 'String' },
						{ name: 'created', path: 'created_at', type: 'Date' },
					],
				},
			},
		],
	},
	
	CassandraInput: {
		typeId: 'CassandraInput',
		category: StepCategory.INPUT,
		displayName: 'Cassandra Input',
		description: 'Query and read data from Apache Cassandra distributed NoSQL database. Supports CQL queries and consistency level tuning. Use for extracting time-series data, wide-column data, or highly scalable NoSQL datasets.',
		tags: ['nosql', 'input', 'cassandra', 'database', 'distributed'],
		configurationSchema: cassandraInputConfigSchema,
		examples: [
			{
				name: 'Read Time Series Data',
				description: 'Extract sensor readings from Cassandra',
				configuration: {
					hostname: 'cassandra-cluster-01',
					port: 9042,
					keyspace: 'iot_data',
					cqlQuery: 'SELECT sensor_id, timestamp, value FROM sensor_readings WHERE sensor_id = ? AND timestamp >= ? ALLOW FILTERING',
					consistencyLevel: 'QUORUM',
					timeout: 30000,
				},
			},
		],
	},
	
	ElasticsearchInput: {
		typeId: 'ElasticsearchInput',
		category: StepCategory.INPUT,
		displayName: 'Elasticsearch Input',
		description: 'Search and retrieve documents from Elasticsearch indices. Supports full Elasticsearch query DSL, aggregations, and scroll API for large result sets. Use for extracting search data, logs, or analytics from Elasticsearch clusters.',
		tags: ['nosql', 'input', 'elasticsearch', 'search', 'analytics'],
		configurationSchema: elasticsearchInputConfigSchema,
		examples: [
			{
				name: 'Extract Application Logs',
				description: 'Read error logs from Elasticsearch',
				configuration: {
					hostname: 'es-cluster-01',
					port: 9200,
					index: 'application-logs-*',
					query: '{"query": {"bool": {"must": [{"term": {"level": "ERROR"}}, {"range": {"@timestamp": {"gte": "now-1d"}}}]}}}',
					scrollSize: 5000,
					scrollTimeout: '2m',
				},
			},
		],
	},
	
	SalesforceInput: {
		typeId: 'SalesforceInput',
		category: StepCategory.INPUT,
		displayName: 'Salesforce Input',
		description: 'Query and extract data from Salesforce CRM using SOQL (Salesforce Object Query Language). Supports all standard and custom objects. Use for extracting customer data, sales records, or any Salesforce data for ETL processing.',
		tags: ['cloud', 'input', 'api', 'crm', 'salesforce'],
		configurationSchema: salesforceInputConfigSchema,
		examples: [
			{
				name: 'Extract Account Records',
				description: 'Read account data from Salesforce',
				configuration: {
					username: '${SF_USERNAME}',
					password: '${SF_PASSWORD}',
					securityToken: '${SF_TOKEN}',
					module: 'Account',
					query: 'SELECT Id, Name, Industry, AnnualRevenue, CreatedDate FROM Account WHERE CreatedDate >= LAST_N_DAYS:30',
					timeout: 60000,
				},
			},
		],
	},
	
	// Other Input Steps (3 types)
	GetXMLData: {
		typeId: 'GetXMLData',
		category: StepCategory.INPUT,
		displayName: 'Get XML Data',
		description: 'Parse and extract data from XML files or fields using XPath expressions. Supports complex XML structures, namespaces, and repeating elements. Use for processing XML documents, SOAP responses, or any hierarchical XML data.',
		tags: ['xml', 'input', 'file', 'parse', 'xpath'],
		configurationSchema: getXMLDataConfigSchema,
		examples: [
			{
				name: 'Parse Invoice XML',
				description: 'Extract invoice line items from XML file',
				configuration: {
					filename: '/data/invoices/invoice_${INV_ID}.xml',
					xmlSource: 'file',
					loopXPath: '/Invoice/LineItems/LineItem',
					fields: [
						{ name: 'item_id', xpath: 'ItemID', type: 'String' },
						{ name: 'description', xpath: 'Description', type: 'String' },
						{ name: 'quantity', xpath: 'Quantity', type: 'Integer' },
						{ name: 'price', xpath: 'UnitPrice', type: 'Number' },
					],
				},
			},
		],
	},
	
	RSSInput: {
		typeId: 'RSSInput',
		category: StepCategory.INPUT,
		displayName: 'RSS Feed Input',
		description: 'Read and parse RSS feeds to extract news articles, blog posts, or any syndicated content. Supports RSS and Atom formats. Use for monitoring news feeds, blog aggregation, or content syndication workflows.',
		tags: ['api', 'input', 'xml', 'feed', 'web'],
		configurationSchema: rssInputConfigSchema,
		examples: [
			{
				name: 'Monitor News Feed',
				description: 'Read latest articles from tech news RSS feed',
				configuration: {
					url: 'https://news.example.com/tech/rss',
					readFrom: '2024-10-01T00:00:00Z',
					urlField: 'article_url',
					titleField: 'title',
					descriptionField: 'summary',
					pubDateField: 'published_date',
				},
			},
		],
	},
	
	LDAPInput: {
		typeId: 'LDAPInput',
		category: StepCategory.INPUT,
		displayName: 'LDAP Input',
		description: 'Query LDAP directories (Active Directory, OpenLDAP) to extract user, group, or organizational data. Supports complex filters and multiple search scopes. Use for synchronizing directory data, user provisioning, or identity management workflows.',
		tags: ['ldap', 'input', 'directory', 'authentication', 'users'],
		configurationSchema: ldapInputConfigSchema,
		examples: [
			{
				name: 'Extract Active Users',
				description: 'Query LDAP for active employee accounts',
				configuration: {
					host: 'ldap.example.com',
					port: 389,
					baseDN: 'ou=users,dc=example,dc=com',
					filter: '(&(objectClass=person)(accountStatus=active))',
					searchScope: 'subtree',
					fields: [
						{ name: 'username', attribute: 'uid' },
						{ name: 'email', attribute: 'mail' },
						{ name: 'department', attribute: 'departmentNumber' },
						{ name: 'manager', attribute: 'manager' },
					],
				},
			},
		],
	},
};
