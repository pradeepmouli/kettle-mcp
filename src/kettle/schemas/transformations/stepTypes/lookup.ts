import { z } from 'zod';
import { StepCategory, type StepType } from './types.js';

/**
 * Configuration schema for StreamLookup step
 */
const streamLookupConfigSchema = z.object({
	lookupStream: z.string().min(1).describe('Name of the lookup step to get reference data from'),
	keys: z.array(z.object({
		mainStreamField: z.string(),
		lookupStreamField: z.string(),
	})).min(1).describe('Key fields for matching records between main and lookup streams'),
	values: z.array(z.object({
		lookupField: z.string(),
		outputField: z.string().optional(),
		defaultValue: z.string().optional(),
	})).min(1).describe('Fields to retrieve from lookup stream'),
	memoryPreservation: z.boolean().default(true).describe('Load entire lookup stream into memory'),
	sortedList: z.boolean().default(false).describe('Lookup stream is pre-sorted on key fields'),
});

/**
 * Configuration schema for DatabaseLookup step
 */
const databaseLookupConfigSchema = z.object({
	connection: z.string().min(1).describe('Database connection name'),
	tableName: z.string().min(1).describe('Table to lookup values from'),
	keys: z.array(z.object({
		streamField: z.string(),
		tableField: z.string(),
		condition: z.enum(['=', '<>', '<', '<=', '>', '>=', 'LIKE', 'BETWEEN', 'IS NULL', 'IS NOT NULL']).default('='),
	})).min(1).describe('Lookup conditions (WHERE clause)'),
	values: z.array(z.object({
		tableField: z.string(),
		outputField: z.string(),
		defaultValue: z.string().optional(),
		defaultValueType: z.enum(['String', 'Integer', 'Number', 'Date', 'Boolean']).optional(),
	})).min(1).describe('Fields to return from database'),
	cacheSize: z.number().default(0).describe('Number of rows to cache (0 = no caching, -1 = cache all)'),
	loadAllRows: z.boolean().default(false).describe('Load all rows into memory at startup'),
	failOnMultipleResults: z.boolean().default(false).describe('Fail if lookup returns multiple rows'),
	orderBy: z.string().optional().describe('ORDER BY clause for lookup query'),
});

/**
 * Configuration schema for FuzzyMatch step
 */
const fuzzyMatchConfigSchema = z.object({
	lookupStream: z.string().min(1).describe('Name of the lookup step to get reference data from'),
	mainStreamField: z.string().min(1).describe('Field in main stream to match'),
	lookupStreamField: z.string().min(1).describe('Field in lookup stream to match against'),
	algorithm: z.enum([
		'Levenshtein',
		'DamerauLevenshtein',
		'Jaro',
		'JaroWinkler',
		'PairSimilarity',
		'Metaphone',
		'DoubleMetaphone',
		'SoundEx',
		'RefinedSoundEx',
	]).default('Levenshtein').describe('Fuzzy matching algorithm'),
	caseSensitive: z.boolean().default(false).describe('Case sensitive matching'),
	minimalValue: z.number().min(0).max(1).default(0.0).describe('Minimum similarity threshold (0.0-1.0)'),
	maximalValue: z.number().min(0).max(1).default(1.0).describe('Maximum similarity threshold (0.0-1.0)'),
	separator: z.string().optional().describe('Value separator for matching'),
	closerValue: z.boolean().default(false).describe('Return only the closest match'),
	valueField: z.string().optional().describe('Field name for similarity value'),
	values: z.array(z.object({
		lookupField: z.string(),
		outputField: z.string(),
	})).describe('Additional fields to retrieve from matched record'),
});

/**
 * Configuration schema for DimensionLookup step
 */
const dimensionLookupConfigSchema = z.object({
	connection: z.string().min(1).describe('Database connection name'),
	tableName: z.string().min(1).describe('Dimension table name'),
	updateDimension: z.boolean().default(true).describe('Update dimension table (false = lookup only)'),
	keys: z.array(z.object({
		streamField: z.string(),
		tableField: z.string(),
	})).min(1).describe('Natural key fields for dimension lookup'),
	fields: z.array(z.object({
		streamField: z.string(),
		tableField: z.string(),
		type: z.enum(['Insert', 'Update', 'Punch through']).default('Insert'),
	})).describe('Dimension attributes to track'),
	technicalKeyField: z.string().min(1).describe('Technical key (surrogate key) field name'),
	versionField: z.string().optional().describe('Version number field name'),
	dateFrom: z.string().optional().describe('Valid from date field name'),
	dateTo: z.string().optional().describe('Valid to date field name'),
	streamDateField: z.string().optional().describe('Stream field containing transaction date'),
	minYear: z.number().default(1900).describe('Minimum year for date range'),
	maxYear: z.number().default(2199).describe('Maximum year for date range'),
	cacheSize: z.number().default(5000).describe('Number of dimension keys to cache'),
	useAutoIncrement: z.boolean().default(false).describe('Use database auto-increment for technical key'),
	commitSize: z.number().default(100).describe('Commit size for dimension updates'),
});

/**
 * Configuration schema for CombinationLookup step
 */
const combinationLookupConfigSchema = z.object({
	connection: z.string().min(1).describe('Database connection name'),
	tableName: z.string().min(1).describe('Combination lookup/junk dimension table name'),
	technicalKeyField: z.string().min(1).describe('Technical key field name'),
	useAutoIncrement: z.boolean().default(false).describe('Use database auto-increment for technical key'),
	sequenceName: z.string().optional().describe('Database sequence name (if not using auto-increment)'),
	replaceFields: z.boolean().default(false).describe('Replace input fields with technical key'),
	keys: z.array(z.object({
		streamField: z.string(),
		tableField: z.string(),
	})).min(1).describe('Fields that form the unique combination'),
	hashField: z.string().optional().describe('Hash field name for quick lookups'),
	commitSize: z.number().default(100).describe('Commit size for inserts'),
	cacheSize: z.number().default(0).describe('Number of combinations to cache (0 = no caching, -1 = cache all)'),
	preloadCache: z.boolean().default(false).describe('Preload cache with existing combinations'),
	lastUpdateField: z.string().optional().describe('Last update timestamp field name'),
});

/**
 * Configuration schema for MergeRows step
 */
const mergeRowsConfigSchema = z.object({
	referenceStream: z.string().min(1).describe('Name of reference (old) stream step'),
	compareStream: z.string().min(1).describe('Name of compare (new) stream step'),
	flagField: z.string().default('flagfield').describe('Output field containing change flag'),
	keys: z.array(z.object({
		name: z.string(),
	})).min(1).describe('Key fields for comparing rows'),
	values: z.array(z.object({
		name: z.string(),
	})).min(1).describe('Value fields to compare for changes'),
});

/**
 * Configuration schema for Append step
 */
const appendConfigSchema = z.object({
	headStep: z.string().min(1).describe('Name of head (first) stream step'),
	tailStep: z.string().min(1).describe('Name of tail (second) stream step'),
});

/**
 * Lookup and join step types
 * Data enrichment operations: lookups against reference data and stream joins
 */
export const LOOKUP_STEPS: Record<string, StepType> = {
	StreamLookup: {
		typeId: 'StreamLookup',
		category: StepCategory.LOOKUP,
		displayName: 'Stream Lookup',
		description: 'Perform in-memory lookups against a reference stream to enrich main stream data with matching values. Entire lookup stream is loaded into memory for fast matching. Use for enriching data with reference information from another transformation step.',
		tags: ['lookup', 'join', 'transform', 'batch', 'mapping'],
		configurationSchema: streamLookupConfigSchema,
		examples: [
			{
				name: 'Enrich Orders with Product Details',
				description: 'Add product name and price to order records',
				configuration: {
					lookupStream: 'Product Master Data',
					keys: [
						{ mainStreamField: 'product_id', lookupStreamField: 'id' },
					],
					values: [
						{ lookupField: 'product_name', outputField: 'product_name' },
						{ lookupField: 'unit_price', outputField: 'price', defaultValue: '0.00' },
					],
					memoryPreservation: true,
					sortedList: false,
				},
			},
			{
				name: 'Customer Lookup',
				description: 'Add customer information to transaction records',
				configuration: {
					lookupStream: 'Customer Dimension',
					keys: [
						{ mainStreamField: 'customer_id', lookupStreamField: 'customer_key' },
					],
					values: [
						{ lookupField: 'customer_name', outputField: 'name' },
						{ lookupField: 'customer_segment', outputField: 'segment', defaultValue: 'Unknown' },
						{ lookupField: 'credit_limit', outputField: 'credit_limit', defaultValue: '0' },
					],
					memoryPreservation: true,
					sortedList: true,
				},
			},
		],
	},

	DatabaseLookup: {
		typeId: 'DatabaseLookup',
		category: StepCategory.LOOKUP,
		displayName: 'Database Lookup',
		description: 'Perform database lookups for each input row to retrieve matching values from database tables. Supports caching for performance and flexible lookup conditions. Use for enriching stream data with database reference information or dimension attributes.',
		tags: ['lookup', 'database', 'sql', 'transform', 'mapping'],
		configurationSchema: databaseLookupConfigSchema,
		examples: [
			{
				name: 'Product Pricing Lookup',
				description: 'Retrieve current product prices from database',
				configuration: {
					connection: 'MySQL_Pricing',
					tableName: 'product_prices',
					keys: [
						{ streamField: 'product_code', tableField: 'code', condition: '=' },
						{ streamField: 'effective_date', tableField: 'start_date', condition: '<=' },
					],
					values: [
						{ tableField: 'price', outputField: 'current_price', defaultValue: '0.00' },
						{ tableField: 'currency', outputField: 'price_currency', defaultValue: 'USD' },
					],
					cacheSize: 1000,
					loadAllRows: false,
					failOnMultipleResults: false,
					orderBy: 'start_date DESC',
				},
			},
			{
				name: 'Account Balance Lookup',
				description: 'Get current account balances for transactions',
				configuration: {
					connection: 'PostgreSQL_Banking',
					tableName: 'account_balances',
					keys: [
						{ streamField: 'account_number', tableField: 'account_id', condition: '=' },
					],
					values: [
						{ tableField: 'balance', outputField: 'available_balance' },
						{ tableField: 'account_status', outputField: 'status', defaultValue: 'ACTIVE' },
					],
					cacheSize: 5000,
					loadAllRows: false,
					failOnMultipleResults: true,
				},
			},
		],
	},

	FuzzyMatch: {
		typeId: 'FuzzyMatch',
		category: StepCategory.LOOKUP,
		displayName: 'Fuzzy Match',
		description: 'Execute fuzzy string matching between main stream and lookup stream using algorithms like Levenshtein distance, Jaro-Winkler, or phonetic matching. Returns similarity scores and closest matches to enable deduplication, data matching, or finding similar records with spelling variations.',
		tags: ['lookup', 'deduplication', 'quality', 'transform', 'cleansing'],
		configurationSchema: fuzzyMatchConfigSchema,
		examples: [
			{
				name: 'Customer Name Deduplication',
				description: 'Find duplicate customers with name variations',
				configuration: {
					lookupStream: 'Customer Master',
					mainStreamField: 'customer_name',
					lookupStreamField: 'name',
					algorithm: 'JaroWinkler',
					caseSensitive: false,
					minimalValue: 0.85,
					maximalValue: 1.0,
					closerValue: true,
					valueField: 'similarity_score',
					values: [
						{ lookupField: 'customer_id', outputField: 'matching_id' },
						{ lookupField: 'name', outputField: 'matched_name' },
					],
				},
			},
			{
				name: 'Product Matching',
				description: 'Match product descriptions with fuzzy logic',
				configuration: {
					lookupStream: 'Product Catalog',
					mainStreamField: 'product_desc',
					lookupStreamField: 'description',
					algorithm: 'Levenshtein',
					caseSensitive: false,
					minimalValue: 0.7,
					maximalValue: 1.0,
					closerValue: true,
					valueField: 'match_score',
					values: [
						{ lookupField: 'product_code', outputField: 'matched_code' },
					],
				},
			},
		],
	},

	DimensionLookup: {
		typeId: 'DimensionLookup',
		category: StepCategory.LOOKUP,
		displayName: 'Dimension Lookup/Update',
		description: 'Perform Type 1 or Type 2 slowly changing dimension lookups and updates in data warehouses. Manages surrogate keys, versioning, and historical tracking. Use for maintaining dimension tables in star schema data warehouses with support for historical changes.',
		tags: ['lookup', 'database', 'analytics', 'enterprise', 'etl'],
		configurationSchema: dimensionLookupConfigSchema,
		examples: [
			{
				name: 'Customer Dimension SCD Type 2',
				description: 'Track customer changes with history',
				configuration: {
					connection: 'DataWarehouse',
					tableName: 'dim_customer',
					updateDimension: true,
					keys: [
						{ streamField: 'customer_id', tableField: 'natural_key' },
					],
					fields: [
						{ streamField: 'customer_name', tableField: 'name', type: 'Insert' },
						{ streamField: 'address', tableField: 'address', type: 'Insert' },
						{ streamField: 'segment', tableField: 'segment', type: 'Insert' },
					],
					technicalKeyField: 'customer_key',
					versionField: 'version',
					dateFrom: 'valid_from',
					dateTo: 'valid_to',
					streamDateField: 'transaction_date',
					minYear: 2000,
					maxYear: 2100,
					cacheSize: 10000,
					useAutoIncrement: true,
					commitSize: 500,
				},
			},
		],
	},

	CombinationLookup: {
		typeId: 'CombinationLookup',
		category: StepCategory.LOOKUP,
		displayName: 'Combination Lookup/Update',
		description: 'Create and lookup combinations of field values to generate surrogate keys for junk dimensions or fact tables. Creates new combinations as needed. Use for maintaining junk dimensions or creating unique keys for field combinations in data warehouses.',
		tags: ['lookup', 'database', 'analytics', 'enterprise', 'etl'],
		configurationSchema: combinationLookupConfigSchema,
		examples: [
			{
				name: 'Order Flags Junk Dimension',
				description: 'Create surrogate key for order flag combinations',
				configuration: {
					connection: 'DataWarehouse',
					tableName: 'dim_order_flags',
					technicalKeyField: 'flag_key',
					useAutoIncrement: true,
					replaceFields: true,
					keys: [
						{ streamField: 'is_priority', tableField: 'priority_flag' },
						{ streamField: 'is_express', tableField: 'express_flag' },
						{ streamField: 'is_international', tableField: 'international_flag' },
					],
					hashField: 'combination_hash',
					commitSize: 100,
					cacheSize: -1,
					preloadCache: true,
				},
			},
		],
	},

	MergeRows: {
		typeId: 'MergeRows',
		category: StepCategory.JOIN,
		displayName: 'Merge Rows (diff)',
		description: 'Compare two sorted streams (reference and compare) to identify changes between old and new data. Outputs change flags for identical, changed, new, and deleted rows. Use for change data capture, detecting modifications in datasets, or generating delta records.',
		tags: ['join', 'transform', 'filter', 'validation', 'etl'],
		configurationSchema: mergeRowsConfigSchema,
		examples: [
			{
				name: 'Detect Customer Changes',
				description: 'Find changes in customer data between old and new snapshots',
				configuration: {
					referenceStream: 'Old Customer Data',
					compareStream: 'New Customer Data',
					flagField: 'change_type',
					keys: [
						{ name: 'customer_id' },
					],
					values: [
						{ name: 'name' },
						{ name: 'email' },
						{ name: 'address' },
					],
				},
			},
		],
	},

	Append: {
		typeId: 'Append',
		category: StepCategory.JOIN,
		displayName: 'Append Streams',
		description: 'Append one stream to another sequentially, outputting all rows from the head stream first, then all rows from the tail stream. Does not perform any matching or deduplication. Use for combining datasets that should be stacked vertically.',
		tags: ['join', 'transform', 'batch', 'etl', 'output'],
		configurationSchema: appendConfigSchema,
		examples: [
			{
				name: 'Combine Historical and Current Data',
				description: 'Append current month data to historical archive',
				configuration: {
					headStep: 'Historical Data',
					tailStep: 'Current Month',
				},
			},
			{
				name: 'Merge Multiple Sources',
				description: 'Stack data from different sources',
				configuration: {
					headStep: 'Source A Data',
					tailStep: 'Source B Data',
				},
			},
		],
	},
};
