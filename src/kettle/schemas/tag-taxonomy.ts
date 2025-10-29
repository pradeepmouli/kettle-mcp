/**
 * Standard tag taxonomy for Kettle step types and job entries
 *
 * These tags enable LLMs to map natural language user intents to appropriate
 * step types and job entries. Use tags consistently across all step definitions.
 */

/**
 * Data Source Tags - Identify the type of data source or destination
 */
export const DATA_SOURCE_TAGS = {
	DATABASE: 'database',
	FILE: 'file',
	CSV: 'csv',
	JSON: 'json',
	XML: 'xml',
	EXCEL: 'excel',
	SPREADSHEET: 'spreadsheet',
	REST_API: 'rest-api',
	HTTP: 'http',
	API: 'api',
	WEB_SERVICE: 'web-service',
	KAFKA: 'kafka',
	TEXT: 'text',
	LDIF: 'ldif',
} as const;

/**
 * Operation Tags - Describe what operation the step performs
 */
export const OPERATION_TAGS = {
	READ: 'read',
	WRITE: 'write',
	FILTER: 'filter',
	TRANSFORM: 'transform',
	AGGREGATE: 'aggregate',
	JOIN: 'join',
	LOOKUP: 'lookup',
	SORT: 'sort',
	ORDER: 'order',
	RANKING: 'ranking',
	DEDUPLICATE: 'deduplicate',
	INPUT: 'input',
	OUTPUT: 'output',
	COLUMNS: 'columns',
	FIELDS: 'fields',
	SELECT: 'select',
	MAPPING: 'mapping',
	CONDITION: 'condition',
	CALCULATE: 'calculate',
	FORMULA: 'formula',
	DERIVED: 'derived',
	START: 'start',
	ENTRY: 'entry',
	LOG: 'log',
	DEBUG: 'debug',
	MONITORING: 'monitoring',
	EXECUTE: 'execute',
	TRANSFORMATION: 'transformation',
} as const;

/**
 * Domain Tags - Categorize the domain or context
 */
export const DOMAIN_TAGS = {
	SQL: 'sql',
	NOSQL: 'nosql',
	STREAMING: 'streaming',
	BATCH: 'batch',
	ETL: 'etl',
	VALIDATION: 'validation',
	WORKFLOW: 'workflow',
	ORCHESTRATION: 'orchestration',
	NESTED: 'nested',
	ROUTING: 'routing',
	MATH: 'math',
} as const;

/**
 * Technology Tags - Specific databases, platforms, and protocols
 */
export const TECHNOLOGY_TAGS = {
	MYSQL: 'mysql',
	POSTGRESQL: 'postgresql',
	ORACLE: 'oracle',
	SQLSERVER: 'sqlserver',
	MONGODB: 'mongodb',
	CASSANDRA: 'cassandra',
	ELASTICSEARCH: 'elasticsearch',
	JMS: 'jms',
	MQTT: 'mqtt',
	HADOOP: 'hadoop',
	SPARK: 'spark',
	HDFS: 'hdfs',
	HBASE: 'hbase',
	S3: 's3',
	AZURE: 'azure',
	GCP: 'gcp',
	REST: 'rest',
	SOAP: 'soap',
	LDAP: 'ldap',
	FTP: 'ftp',
	SFTP: 'sftp',
} as const;

/**
 * Quality and Processing Tags
 */
export const QUALITY_TAGS = {
	QUALITY: 'quality',
	CHECKSUM: 'checksum',
	DEDUPLICATION: 'deduplication',
	CLEANSING: 'cleansing',
	PROFILING: 'profiling',
	SAMPLING: 'sampling',
	PERFORMANCE: 'performance',
	BULK: 'bulk',
	ENTERPRISE: 'enterprise',
	ANALYTICS: 'analytics',
	DISTRIBUTED: 'distributed',
	DOCUMENT: 'document',
	SEARCH: 'search',
	CRM: 'crm',
	SALESFORCE: 'salesforce',
	AWS: 'aws',
	CLOUD: 'cloud',
	COLUMNAR: 'columnar',
	BIGDATA: 'bigdata',
	REALTIME: 'realtime',
	EVENTS: 'events',
	QUEUE: 'queue',
	MESSAGING: 'messaging',
	IOT: 'iot',
	TELEMETRY: 'telemetry',
	DIRECTORY: 'directory',
	AUTHENTICATION: 'authentication',
	USERS: 'users',
	FEED: 'feed',
	WEB: 'web',
	PARSE: 'parse',
	XPATH: 'xpath',
	MAINFRAME: 'mainframe',
	LEGACY: 'legacy',
	MICROSOFT: 'microsoft',
	ACCESS: 'access',
	PROPERTIES: 'properties',
	CONFIGURATION: 'configuration',
	PARQUET: 'parquet',
	YAML: 'yaml',
	SCHEMA: 'schema',
	DISCOVERY: 'discovery',
	METADATA: 'metadata',
} as const;

/**
 * All available tags combined
 */
export const ALL_TAGS = {
	...DATA_SOURCE_TAGS,
	...OPERATION_TAGS,
	...DOMAIN_TAGS,
	...TECHNOLOGY_TAGS,
	...QUALITY_TAGS,
} as const;

/**
 * Type for tag values
 */
export type Tag = typeof ALL_TAGS[keyof typeof ALL_TAGS];
