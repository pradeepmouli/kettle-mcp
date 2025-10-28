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
};
