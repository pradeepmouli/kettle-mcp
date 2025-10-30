import { z } from 'zod';
import { StepCategory, type StepType } from './types.js';

/**
 * Validation step types
 * Data quality: validation, checksums, cleansing, deduplication
 */

/**
 * Configuration schema for DataValidator step
 */
const dataValidatorConfigSchema = z.object({
	validations: z.array(z.object({
		name: z.string().describe('Validation name'),
		fieldName: z.string().describe('Field to validate'),
		validationType: z.enum([
			'NOT_NULL',
			'NULL',
			'NOT_NULL_AND_NOT_EMPTY',
			'ONLY_NULL_ALLOWED',
			'DATA_TYPE',
			'MIN_LENGTH',
			'MAX_LENGTH',
			'REGULAR_EXPRESSION',
			'ALLOWED_VALUES',
		]).describe('Type of validation to perform'),
		allowedValues: z.array(z.string()).optional().describe('List of allowed values'),
		minimumLength: z.number().optional().describe('Minimum string length'),
		maximumLength: z.number().optional().describe('Maximum string length'),
		regularExpression: z.string().optional().describe('Regular expression pattern'),
		dataType: z.enum(['String', 'Integer', 'Number', 'Date', 'Boolean']).optional().describe('Expected data type'),
		errorCode: z.string().optional().describe('Error code for validation failure'),
		errorDescription: z.string().optional().describe('Error description'),
	})).describe('Validation rules to apply'),
	concatenateErrors: z.boolean().default(false).describe('Concatenate all error messages'),
	outputErrorField: z.string().default('validation_error').describe('Field name for error messages'),
});

/**
 * Configuration schema for CheckSum step
 */
const checksumConfigSchema = z.object({
	checksumType: z.enum(['CRC32', 'ADLER32', 'MD5', 'SHA1', 'SHA256']).default('CRC32').describe('Checksum algorithm'),
	resultField: z.string().default('checksum').describe('Field name for checksum result'),
	resultType: z.enum(['String', 'Hexadecimal']).default('Hexadecimal').describe('Format of checksum output'),
	fields: z.array(z.object({
		name: z.string(),
	})).optional().describe('Fields to include in checksum (all fields if not specified)'),
});

/**
 * Configuration schema for CRC32 step
 */
const crc32ConfigSchema = z.object({
	resultField: z.string().default('crc32').describe('Field name for CRC32 result'),
	fields: z.array(z.object({
		name: z.string(),
	})).optional().describe('Fields to include in CRC32 calculation'),
});

/**
 * Configuration schema for MD5 step
 */
const md5ConfigSchema = z.object({
	resultField: z.string().default('md5hash').describe('Field name for MD5 hash result'),
	fields: z.array(z.object({
		name: z.string(),
	})).optional().describe('Fields to include in MD5 hash'),
});

/**
 * Configuration schema for Coalesce step
 */
const coalesceConfigSchema = z.object({
	fields: z.array(z.object({
		name: z.string().describe('Target field name'),
		valueFields: z.array(z.string()).describe('Source fields to check in order'),
		removeInputFields: z.boolean().default(false).describe('Remove source fields after coalesce'),
		dataType: z.enum(['String', 'Integer', 'Number', 'Date', 'Boolean']).optional().describe('Target data type'),
	})).describe('Coalesce field definitions'),
});

/**
 * Configuration schema for DataCleanse step
 */
const dataCleanseConfigSchema = z.object({
	fields: z.array(z.object({
		name: z.string().describe('Field to cleanse'),
		operations: z.array(z.enum([
			'TRIM',
			'TRIM_LEFT',
			'TRIM_RIGHT',
			'UPPER_CASE',
			'LOWER_CASE',
			'REMOVE_SPECIAL_CHARACTERS',
			'REMOVE_DIGITS',
			'REMOVE_CONTROL_CHARACTERS',
			'ESCAPE_HTML',
			'UNESCAPE_HTML',
			'ESCAPE_XML',
			'UNESCAPE_XML',
		])).describe('Cleansing operations to apply'),
	})).describe('Fields to cleanse and operations'),
});

/**
 * Configuration schema for DetectEmptyStream step
 */
const detectEmptyStreamConfigSchema = z.object({
	outputField: z.string().default('isEmpty').describe('Field name for empty stream indicator'),
});

/**
 * Configuration schema for FieldValidator step
 */
const fieldValidatorConfigSchema = z.object({
	validations: z.array(z.object({
		name: z.string().describe('Field name to validate'),
		validationType: z.enum([
			'EMAIL',
			'PHONE_NUMBER',
			'CREDIT_CARD',
			'IP_ADDRESS',
			'URL',
			'REGULAR_EXPRESSION',
		]).describe('Type of validation'),
		regularExpression: z.string().optional().describe('Custom regular expression for validation'),
		errorField: z.string().optional().describe('Field to store error message'),
		validField: z.string().optional().describe('Field to store validation result (true/false)'),
	})).describe('Field validation rules'),
});

/**
 * Configuration schema for Validator step
 */
const validatorConfigSchema = z.object({
	validations: z.array(z.object({
		name: z.string().describe('Validation name'),
		fieldName: z.string().describe('Field to validate'),
		validationType: z.enum([
			'NOT_NULL',
			'NULL',
			'ONLY_DIGITS',
			'ONLY_CHARACTERS',
			'MIN_VALUE',
			'MAX_VALUE',
			'RANGE',
			'REGULAR_EXPRESSION',
		]).describe('Type of validation'),
		minimumValue: z.number().optional().describe('Minimum allowed value'),
		maximumValue: z.number().optional().describe('Maximum allowed value'),
		regularExpression: z.string().optional().describe('Regular expression pattern'),
	})).describe('Validation rules'),
	validationOutputField: z.string().default('is_valid').describe('Field indicating validation success'),
});

/**
 * Configuration schema for DataGrid step
 */
const dataGridConfigSchema = z.object({
	fields: z.array(z.object({
		name: z.string().describe('Field name'),
		type: z.enum(['String', 'Integer', 'Number', 'Date', 'Boolean']).describe('Field type'),
		format: z.string().optional().describe('Format pattern for dates/numbers'),
	})).describe('Field definitions'),
	data: z.array(z.array(z.any())).describe('Grid data as array of rows'),
});

export const VALIDATION_STEPS: Record<string, StepType> = {
	DataValidator: {
		typeId: 'DataValidator',
		category: StepCategory.VALIDATION,
		displayName: 'Data Validator',
		description: 'Validate data against comprehensive rules including null checks, data types, string lengths, regular expressions, and allowed value lists. Generate detailed error messages for validation failures. Use for enforcing data quality standards and identifying invalid records in ETL pipelines.',
		tags: ['validation', 'quality', 'transform', 'cleansing', 'profiling'],
		configurationSchema: dataValidatorConfigSchema,
		examples: [
			{
				name: 'Validate Customer Records',
				description: 'Validate customer data for required fields and email format',
				configuration: {
					validations: [
						{
							name: 'Email Required',
							fieldName: 'email',
							validationType: 'NOT_NULL_AND_NOT_EMPTY',
							errorCode: 'E001',
							errorDescription: 'Email is required',
						},
						{
							name: 'Valid Email Format',
							fieldName: 'email',
							validationType: 'REGULAR_EXPRESSION',
							regularExpression: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
							errorCode: 'E002',
							errorDescription: 'Invalid email format',
						},
					],
					concatenateErrors: true,
					outputErrorField: 'validation_errors',
				},
			},
			{
				name: 'Validate Product Codes',
				description: 'Ensure product codes are from allowed list',
				configuration: {
					validations: [
						{
							name: 'Valid Product Category',
							fieldName: 'category',
							validationType: 'ALLOWED_VALUES',
							allowedValues: ['Electronics', 'Clothing', 'Food', 'Books'],
							errorCode: 'E003',
							errorDescription: 'Invalid product category',
						},
					],
					outputErrorField: 'error_message',
				},
			},
		],
	},

	CheckSum: {
		typeId: 'CheckSum',
		category: StepCategory.VALIDATION,
		displayName: 'Add CheckSum',
		description: 'Calculate checksums or hash values across multiple fields to verify data integrity and detect duplicate or modified records. Supports CRC32, ADLER32, MD5, SHA1, and SHA256 algorithms. Use for data deduplication, change detection, and integrity verification in ETL workflows.',
		tags: ['checksum', 'validation', 'quality', 'deduplication', 'transform'],
		configurationSchema: checksumConfigSchema,
		examples: [
			{
				name: 'Detect Duplicate Records',
				description: 'Calculate MD5 hash of key fields to identify duplicates',
				configuration: {
					checksumType: 'MD5',
					resultField: 'record_hash',
					resultType: 'Hexadecimal',
					fields: [
						{ name: 'customer_id' },
						{ name: 'transaction_date' },
						{ name: 'amount' },
					],
				},
			},
			{
				name: 'Data Change Detection',
				description: 'Use SHA256 for secure change detection',
				configuration: {
					checksumType: 'SHA256',
					resultField: 'data_fingerprint',
					resultType: 'Hexadecimal',
				},
			},
		],
	},

	CRC32: {
		typeId: 'CRC32',
		category: StepCategory.VALIDATION,
		displayName: 'CRC-32',
		description: 'Calculate CRC-32 (Cyclic Redundancy Check) checksums for data integrity verification. Fast and efficient algorithm for detecting accidental data corruption. Use for error detection in data transfers and storage, or as a simple hash for deduplication.',
		tags: ['checksum', 'validation', 'quality', 'transform'],
		configurationSchema: crc32ConfigSchema,
		examples: [
			{
				name: 'File Integrity Check',
				description: 'Calculate CRC32 for file content verification',
				configuration: {
					resultField: 'file_crc32',
					fields: [
						{ name: 'file_content' },
						{ name: 'file_metadata' },
					],
				},
			},
			{
				name: 'Quick Deduplication',
				description: 'Use CRC32 as fast hash for duplicate detection',
				configuration: {
					resultField: 'quick_hash',
				},
			},
		],
	},

	MD5: {
		typeId: 'MD5',
		category: StepCategory.VALIDATION,
		displayName: 'MD5',
		description: 'Generate MD5 hash values for data fingerprinting and deduplication. Creates unique 128-bit hash signatures from field values. Use for identifying duplicate records, tracking data changes, and creating unique identifiers from multiple fields (not for cryptographic security).',
		tags: ['checksum', 'validation', 'quality', 'deduplication', 'transform'],
		configurationSchema: md5ConfigSchema,
		examples: [
			{
				name: 'Generate Unique IDs',
				description: 'Create unique identifiers from customer data',
				configuration: {
					resultField: 'customer_uid',
					fields: [
						{ name: 'first_name' },
						{ name: 'last_name' },
						{ name: 'date_of_birth' },
						{ name: 'email' },
					],
				},
			},
			{
				name: 'Content Deduplication',
				description: 'Hash document content for duplicate detection',
				configuration: {
					resultField: 'content_hash',
					fields: [
						{ name: 'document_body' },
					],
				},
			},
		],
	},

	Coalesce: {
		typeId: 'Coalesce',
		category: StepCategory.VALIDATION,
		displayName: 'Coalesce Fields',
		description: 'Select the first non-null value from multiple fields to handle missing data gracefully. Combines fallback logic for data quality improvement. Use for consolidating data from multiple sources, providing default values, and handling incomplete records in ETL workflows.',
		tags: ['validation', 'quality', 'transform', 'cleansing'],
		configurationSchema: coalesceConfigSchema,
		examples: [
			{
				name: 'Consolidate Phone Numbers',
				description: 'Use primary phone, fallback to mobile or home',
				configuration: {
					fields: [
						{
							name: 'phone',
							valueFields: ['primary_phone', 'mobile_phone', 'home_phone'],
							removeInputFields: true,
							dataType: 'String',
						},
					],
				},
			},
			{
				name: 'Email Fallback',
				description: 'Prefer business email, fallback to personal',
				configuration: {
					fields: [
						{
							name: 'contact_email',
							valueFields: ['business_email', 'personal_email', 'alternate_email'],
							removeInputFields: false,
						},
					],
				},
			},
		],
	},

	DataCleanse: {
		typeId: 'DataCleanse',
		category: StepCategory.VALIDATION,
		displayName: 'Data Cleanse',
		description: 'Apply data cleansing operations to standardize and clean field values. Supports trimming whitespace, case conversion, removing special characters, HTML/XML escaping, and control character removal. Use for data normalization, standardization, and quality improvement in ETL pipelines.',
		tags: ['cleansing', 'quality', 'transform', 'validation'],
		configurationSchema: dataCleanseConfigSchema,
		examples: [
			{
				name: 'Standardize Names',
				description: 'Clean and standardize customer names',
				configuration: {
					fields: [
						{
							name: 'customer_name',
							operations: ['TRIM', 'REMOVE_SPECIAL_CHARACTERS', 'UPPER_CASE'],
						},
					],
				},
			},
			{
				name: 'Clean Web Data',
				description: 'Remove HTML tags and escape special characters',
				configuration: {
					fields: [
						{
							name: 'description',
							operations: ['UNESCAPE_HTML', 'TRIM', 'REMOVE_CONTROL_CHARACTERS'],
						},
						{
							name: 'title',
							operations: ['ESCAPE_XML', 'TRIM'],
						},
					],
				},
			},
		],
	},

	DetectEmptyStream: {
		typeId: 'DetectEmptyStream',
		category: StepCategory.VALIDATION,
		displayName: 'Detect Empty Stream',
		description: 'Detect whether the data stream is empty or contains rows. Useful for conditional processing and error handling when no data is found. Outputs a single row with a boolean indicator regardless of input. Use for workflow validation and handling empty result sets.',
		tags: ['validation', 'quality', 'monitoring', 'transform'],
		configurationSchema: detectEmptyStreamConfigSchema,
		examples: [
			{
				name: 'Check Query Results',
				description: 'Detect if database query returned any rows',
				configuration: {
					outputField: 'has_results',
				},
			},
			{
				name: 'File Processing Validation',
				description: 'Verify file contains data before processing',
				configuration: {
					outputField: 'file_has_data',
				},
			},
		],
	},

	FieldValidator: {
		typeId: 'FieldValidator',
		category: StepCategory.VALIDATION,
		displayName: 'Field Validator',
		description: 'Validate fields against common patterns including email addresses, phone numbers, credit cards, IP addresses, and URLs. Supports custom regular expressions for specialized validation. Use for ensuring data conforms to expected formats in customer records, contact information, and web data.',
		tags: ['validation', 'quality', 'transform', 'profiling'],
		configurationSchema: fieldValidatorConfigSchema,
		examples: [
			{
				name: 'Validate Contact Information',
				description: 'Validate email and phone number formats',
				configuration: {
					validations: [
						{
							name: 'email',
							validationType: 'EMAIL',
							errorField: 'email_error',
							validField: 'email_valid',
						},
						{
							name: 'phone',
							validationType: 'PHONE_NUMBER',
							errorField: 'phone_error',
							validField: 'phone_valid',
						},
					],
				},
			},
			{
				name: 'Validate Web URLs',
				description: 'Check URL format for web scraping',
				configuration: {
					validations: [
						{
							name: 'website',
							validationType: 'URL',
							validField: 'url_is_valid',
						},
					],
				},
			},
		],
	},

	Validator: {
		typeId: 'Validator',
		category: StepCategory.VALIDATION,
		displayName: 'Validator',
		description: 'Validate and enforce data quality rules including null checks, numeric ranges, character/digit constraints, and custom regular expressions. Flexible validation step for enforcing business rules and data constraints. Execute comprehensive data quality validation in ETL workflows.',
		tags: ['validation', 'quality', 'transform', 'profiling'],
		configurationSchema: validatorConfigSchema,
		examples: [
			{
				name: 'Validate Age Range',
				description: 'Ensure age is within valid range',
				configuration: {
					validations: [
						{
							name: 'Age Range Check',
							fieldName: 'age',
							validationType: 'RANGE',
							minimumValue: 0,
							maximumValue: 120,
						},
					],
					validationOutputField: 'age_valid',
				},
			},
			{
				name: 'Validate Product Codes',
				description: 'Ensure product code contains only digits',
				configuration: {
					validations: [
						{
							name: 'Product Code Format',
							fieldName: 'product_code',
							validationType: 'ONLY_DIGITS',
						},
					],
					validationOutputField: 'code_valid',
				},
			},
		],
	},

	DataGrid: {
		typeId: 'DataGrid',
		category: StepCategory.VALIDATION,
		displayName: 'Data Grid',
		description: 'Generate test data or lookup tables by manually defining rows and columns in a grid. Useful for creating reference data, test datasets, and static lookup values. Use for prototyping transformations, unit testing, and providing static reference data without external sources.',
		tags: ['validation', 'quality', 'transform', 'read'],
		configurationSchema: dataGridConfigSchema,
		examples: [
			{
				name: 'Create Status Lookup Table',
				description: 'Define status codes and descriptions',
				configuration: {
					fields: [
						{ name: 'status_code', type: 'String' },
						{ name: 'status_name', type: 'String' },
						{ name: 'is_active', type: 'Boolean' },
					],
					data: [
						['A', 'Active', true],
						['I', 'Inactive', false],
						['P', 'Pending', true],
						['C', 'Cancelled', false],
					],
				},
			},
			{
				name: 'Generate Test Data',
				description: 'Create sample customer records for testing',
				configuration: {
					fields: [
						{ name: 'customer_id', type: 'Integer' },
						{ name: 'name', type: 'String' },
						{ name: 'email', type: 'String' },
					],
					data: [
						[1, 'John Doe', 'john@example.com'],
						[2, 'Jane Smith', 'jane@example.com'],
						[3, 'Bob Johnson', 'bob@example.com'],
					],
				},
			},
		],
	},
};
