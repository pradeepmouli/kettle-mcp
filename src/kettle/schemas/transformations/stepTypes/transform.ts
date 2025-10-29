import { z } from 'zod';
import { StepCategory, type StepType } from './types.js';

/**
 * Configuration schema for SelectValues step
 */
const selectValuesConfigSchema = z.object({
	fields: z.union([
		z.array(z.object({
			name: z.string(),
			rename: z.string().optional(),
		})),
		z.object({
			field: z.array(z.object({
				name: z.string(),
				rename: z.string().optional(),
			})),
			select_unspecified: z.string().optional(),
		}),
	]).describe('Fields to select and optionally rename'),
	removeUnspecified: z.boolean().optional().describe('Remove fields not in selection'),
});

/**
 * Configuration schema for FilterRows step
 */
const filterRowsConfigSchema = z.object({
	condition: z.object({
		leftvalue: z.string().describe('Left side field name'),
		function: z.enum(['=', '<>', '<', '<=', '>', '>=', 'LIKE', 'REGEXP', 'IS NULL', 'IS NOT NULL']),
		rightvalue: z.string().optional().describe('Right side value or field'),
	}).describe('Filter condition'),
	sendTrueStepname: z.string().optional().describe('Step for matching rows'),
	sendFalseStepname: z.string().optional().describe('Step for non-matching rows'),
});

/**
 * Configuration schema for SortRows step
 */
const sortRowsConfigSchema = z.object({
	fields: z.array(z.object({
		name: z.string(),
		ascending: z.boolean().default(true),
	})).describe('Fields to sort by'),
});

/**
 * Configuration schema for Calculator step
 */
const calculatorConfigSchema = z.object({
	calculation: z.array(z.object({
		fieldName: z.string().describe('New field name'),
		calculationType: z.enum([
			'ADD', 'SUBTRACT', 'MULTIPLY', 'DIVIDE',
			'PERCENT', 'SQRT', 'ABS', 'ROUND',
		]),
		fieldA: z.string().optional().describe('First field'),
		fieldB: z.string().optional().describe('Second field'),
		valueType: z.enum(['String', 'Integer', 'Number', 'Date', 'Boolean']).default('Number'),
	})).describe('Calculations to perform'),
});

/**
 * Configuration schema for AddConstants step
 */
const addConstantsConfigSchema = z.object({
	fields: z.array(z.object({
		name: z.string().describe('Field name'),
		type: z.enum(['String', 'Integer', 'Number', 'Date', 'Boolean']).describe('Field type'),
		value: z.string().describe('Constant value'),
	})).describe('Constant fields to add'),
});

/**
 * Configuration schema for ValueMapper step
 */
const valueMapperConfigSchema = z.object({
	fieldToUse: z.string().describe('Field to map'),
	targetField: z.string().describe('Target field for mapped value'),
	nonMatchDefault: z.string().optional().describe('Default value for non-matches'),
	mappings: z.array(z.object({
		sourceValue: z.string(),
		targetValue: z.string(),
	})).describe('Value mappings'),
});

/**
 * Configuration schema for FieldSplitter step
 */
const fieldSplitterConfigSchema = z.object({
	splitField: z.string().describe('Field to split'),
	delimiter: z.string().describe('Delimiter to split on'),
	fields: z.array(z.object({
		name: z.string(),
		type: z.enum(['String', 'Integer', 'Number', 'Date', 'Boolean']).default('String'),
	})).describe('Output fields'),
});

/**
 * Configuration schema for ConcatFields step
 */
const concatFieldsConfigSchema = z.object({
	targetFieldName: z.string().describe('Name of concatenated field'),
	separator: z.string().default('').describe('Separator between fields'),
	fields: z.array(z.object({
		name: z.string(),
	})).describe('Fields to concatenate'),
});

/**
 * Configuration schema for ColumnsSplitter step
 */
const columnsSplitterConfigSchema = z.object({
	delimiter: z.string().describe('Column delimiter'),
	fields: z.array(z.object({
		name: z.string(),
		type: z.enum(['String', 'Integer', 'Number', 'Date', 'Boolean']).default('String'),
	})).describe('Output fields'),
});

/**
 * Configuration schema for SetFieldValue step
 */
const setFieldValueConfigSchema = z.object({
	fields: z.array(z.object({
		fieldName: z.string(),
		replaceValue: z.string(),
		replaceMask: z.string().optional(),
	})).describe('Fields to set'),
});

/**
 * Configuration schema for JavaFilter step
 */
const javaFilterConfigSchema = z.object({
	condition: z.string().describe('Java expression returning boolean'),
});

/**
 * Configuration schema for RegexEval step
 */
const regexEvalConfigSchema = z.object({
	script: z.string().optional().describe('Regular expression pattern'),
	matcher: z.string().describe('Field to match against'),
	resultFieldName: z.string().default('result').describe('Result field name'),
	replaceFields: z.boolean().default(false).describe('Replace existing fields'),
});

/**
 * Configuration schema for SampleRows step
 */
const sampleRowsConfigSchema = z.object({
	linesRange: z.string().describe('Range of lines (e.g., 1..100)'),
	lineNumberField: z.string().optional().describe('Add line number field'),
});

/**
 * Configuration schema for Formula step
 */
const formulaConfigSchema = z.object({
	formula: z.array(z.object({
		fieldName: z.string().describe('Result field name'),
		formula: z.string().describe('Formula expression'),
		valueType: z.enum(['String', 'Integer', 'Number', 'Date', 'Boolean']).default('Number'),
	})).describe('Formulas to calculate'),
});

/**
 * Configuration schema for AnalyticQuery step
 */
const analyticQueryConfigSchema = z.object({
	groupFields: z.array(z.string()).describe('Fields to group by'),
	aggregates: z.array(z.object({
		field: z.string(),
		subject: z.string(),
		type: z.enum(['LEAD', 'LAG', 'FIRST_VALUE', 'LAST_VALUE', 'ROW_NUMBER', 'RANK', 'DENSE_RANK']),
		offset: z.number().optional(),
	})).describe('Analytic functions'),
});

/**
 * Configuration schema for NumberRange step
 */
const numberRangeConfigSchema = z.object({
	inputField: z.string().describe('Input field to check'),
	outputField: z.string().describe('Output range field'),
	ranges: z.array(z.object({
		lowerBound: z.number(),
		upperBound: z.number(),
		value: z.string(),
	})).describe('Range definitions'),
});

/**
 * Configuration schema for Constant step
 */
const constantConfigSchema = z.object({
	fields: z.array(z.object({
		name: z.string(),
		type: z.enum(['String', 'Integer', 'Number', 'Date', 'Boolean']),
		value: z.string(),
	})).describe('Constant fields'),
});

/**
 * Configuration schema for SortedMerge step
 */
const sortedMergeConfigSchema = z.object({
	fields: z.array(z.object({
		name: z.string(),
	})).describe('Fields to merge on'),
});

/**
 * Configuration schema for ReservoirSampling step
 */
const reservoirSamplingConfigSchema = z.object({
	sampleSize: z.number().describe('Number of rows to sample'),
	seed: z.number().optional().describe('Random seed for reproducibility'),
});

/**
 * Configuration schema for Unique step
 */
const uniqueConfigSchema = z.object({
	compareFields: z.array(z.object({
		name: z.string(),
	})).describe('Fields to compare for uniqueness'),
	countField: z.string().optional().describe('Count field name'),
	rejectDuplicates: z.boolean().default(false).describe('Reject duplicate rows'),
});

/**
 * Configuration schema for UniqueRowsByHashKey step
 */
const uniqueRowsByHashKeyConfigSchema = z.object({
	hashField: z.string().default('hashcode').describe('Hash field name'),
	compareFields: z.array(z.object({
		name: z.string(),
	})).describe('Fields to hash'),
	rejectDuplicates: z.boolean().default(false).describe('Reject duplicate rows'),
});

/**
 * Configuration schema for StringOperations step
 */
const stringOperationsConfigSchema = z.object({
	fields: z.array(z.object({
		inStreamName: z.string(),
		outStreamName: z.string().optional(),
		operation: z.enum(['trim', 'upper', 'lower', 'padding', 'remove_special_characters']),
	})).describe('String operations to perform'),
});

/**
 * Configuration schema for StringCut step
 */
const stringCutConfigSchema = z.object({
	fields: z.array(z.object({
		inStreamName: z.string(),
		outStreamName: z.string(),
		cutFrom: z.number().describe('Start position'),
		cutTo: z.number().describe('End position'),
	})).describe('String cut operations'),
});

/**
 * Configuration schema for ReplaceString step
 */
const replaceStringConfigSchema = z.object({
	fields: z.array(z.object({
		inStreamName: z.string(),
		outStreamName: z.string().optional(),
		searchPattern: z.string(),
		replaceString: z.string(),
		useRegex: z.boolean().default(false),
		caseSensitive: z.boolean().default(true),
		wholeWord: z.boolean().default(false),
	})).describe('String replacement operations'),
});

/**
 * Configuration schema for SplitFields step
 */
const splitFieldsConfigSchema = z.object({
	splitField: z.string().describe('Field to split'),
	delimiter: z.string().describe('Delimiter'),
	newFieldNames: z.array(z.string()).describe('Names for split fields'),
});

/**
 * Configuration schema for IfNull step
 */
const ifNullConfigSchema = z.object({
	fields: z.array(z.object({
		name: z.string(),
		value: z.string().describe('Value to use if null'),
	})).describe('Fields to check for null'),
});

/**
 * Configuration schema for NullIf step
 */
const nullIfConfigSchema = z.object({
	fields: z.array(z.object({
		name: z.string(),
		value: z.string().describe('Value to compare; set null if equal'),
	})).describe('Fields to check'),
});

/**
 * Configuration schema for AddSequence step
 */
const addSequenceConfigSchema = z.object({
	valueName: z.string().default('id').describe('Sequence field name'),
	startAt: z.number().default(1).describe('Starting value'),
	incrementBy: z.number().default(1).describe('Increment'),
	maxValue: z.number().optional().describe('Maximum value'),
});

/**
 * Configuration schema for GetSystemInfo step
 */
const getSystemInfoConfigSchema = z.object({
	fields: z.array(z.object({
		name: z.string(),
		type: z.enum([
			'system_date', 'system_time', 'yesterday', 'today', 'tomorrow',
			'hostname', 'ip_address', 'current_pid', 'jvm_max_memory',
		]),
	})).describe('System info fields to add'),
});

/**
 * Configuration schema for DateDiff step (as DateCalculator)
 */
const dateDiffConfigSchema = z.object({
	fieldA: z.string().describe('First date field'),
	fieldB: z.string().describe('Second date field'),
	resultField: z.string().describe('Result field name'),
	calculationType: z.enum(['years', 'months', 'days', 'hours', 'minutes', 'seconds']),
});

/**
 * Configuration schema for RowNormalizer step
 */
const rowNormalizerConfigSchema = z.object({
	typeField: z.string().describe('Type field name'),
	fields: z.array(z.object({
		fieldName: z.string(),
		type: z.string(),
		value: z.string().optional(),
	})).describe('Fields to normalize'),
});

/**
 * Configuration schema for RowDenormalizer step
 */
const rowDenormalizerConfigSchema = z.object({
	groupField: z.array(z.string()).describe('Fields to group by'),
	keyField: z.string().describe('Key field for pivoting'),
	targetFields: z.array(z.object({
		fieldName: z.string(),
		keyValue: z.string(),
		type: z.enum(['String', 'Integer', 'Number', 'Date', 'Boolean']).default('String'),
	})).describe('Target denormalized fields'),
});

/**
 * Configuration schema for ColumnToRows step
 */
const columnToRowsConfigSchema = z.object({
	fields: z.array(z.object({
		name: z.string(),
	})).describe('Fields to unpivot'),
	keyField: z.string().default('Key').describe('Field name for keys'),
	valueField: z.string().default('Value').describe('Field name for values'),
});

/**
 * Configuration schema for RowsToColumns step
 */
const rowsToColumnsConfigSchema = z.object({
	groupField: z.array(z.string()).describe('Group by fields'),
	keyField: z.string().describe('Key field'),
	valueField: z.string().describe('Value field'),
	aggregation: z.enum(['SUM', 'AVERAGE', 'MIN', 'MAX', 'COUNT']).default('SUM'),
});

/**
 * Configuration schema for Joiner step
 */
const joinerConfigSchema = z.object({
	joinType: z.enum(['INNER', 'LEFT OUTER', 'RIGHT OUTER', 'FULL OUTER']).default('INNER'),
	keys1: z.array(z.string()).describe('Keys from first stream'),
	keys2: z.array(z.string()).describe('Keys from second stream'),
});

/**
 * Configuration schema for MergeJoin step
 */
const mergeJoinConfigSchema = z.object({
	joinType: z.enum(['INNER', 'LEFT OUTER', 'RIGHT OUTER', 'FULL OUTER']).default('INNER'),
	keys1: z.array(z.string()).describe('Sort keys from first stream'),
	keys2: z.array(z.string()).describe('Sort keys from second stream'),
});

/**
 * Configuration schema for MultiWayMergeJoin step
 */
const multiWayMergeJoinConfigSchema = z.object({
	inputSteps: z.array(z.object({
		stepName: z.string(),
		keys: z.array(z.string()),
	})).describe('Input steps and their join keys'),
});

/**
 * Configuration schema for JoinRows step
 */
const joinRowsConfigSchema = z.object({
	directory: z.string().optional().describe('Temp directory for sorting'),
	prefix: z.string().default('join').describe('Prefix for temp files'),
	cacheSize: z.number().default(500).describe('Main step cache size'),
	condition: z.string().optional().describe('Join condition'),
});

/**
 * Configuration schema for GroupBy step
 */
const groupByConfigSchema = z.object({
	groupFields: z.array(z.string()).describe('Fields to group by'),
	aggregates: z.array(z.object({
		field: z.string(),
		subject: z.string(),
		type: z.enum(['SUM', 'AVERAGE', 'MIN', 'MAX', 'COUNT', 'COUNT_DISTINCT', 'CONCAT_COMMA']),
	})).describe('Aggregation functions'),
	alwaysGivingBackOneRow: z.boolean().default(false).describe('Always return at least one row'),
});

/**
 * Configuration schema for MemoryGroupBy step
 */
const memoryGroupByConfigSchema = z.object({
	groupFields: z.array(z.string()).describe('Fields to group by'),
	aggregates: z.array(z.object({
		field: z.string(),
		subject: z.string(),
		type: z.enum(['SUM', 'AVERAGE', 'MIN', 'MAX', 'COUNT', 'COUNT_DISTINCT']),
	})).describe('Aggregation functions'),
});

/**
 * Configuration schema for AggregateRows step
 */
const aggregateRowsConfigSchema = z.object({
	aggregates: z.array(z.object({
		field: z.string(),
		subject: z.string(),
		type: z.enum(['SUM', 'AVERAGE', 'MIN', 'MAX', 'COUNT']),
	})).describe('Aggregation functions'),
	alwaysGivingBackOneRow: z.boolean().default(false).describe('Always return at least one row'),
});

/**
 * Configuration schema for UniqueRows step
 */
const uniqueRowsConfigSchema = z.object({
	compareFields: z.array(z.object({
		name: z.string(),
		caseInsensitive: z.boolean().default(false),
	})).describe('Fields to compare'),
	countField: z.string().optional().describe('Count field name'),
	rejectDuplicates: z.boolean().default(false).describe('Output duplicates to error stream'),
});

/**
 * Configuration schema for SwitchCase step
 */
const switchCaseConfigSchema = z.object({
	fieldName: z.string().describe('Field to evaluate'),
	caseValueType: z.enum(['String', 'Integer', 'Number']).default('String'),
	cases: z.array(z.object({
		value: z.string(),
		targetStepName: z.string(),
	})).describe('Case mappings'),
	defaultTargetStepName: z.string().optional().describe('Default target step'),
});

/**
 * Configuration schema for Transpose step
 */
const transposeConfigSchema = z.object({
	keyField: z.string().optional().describe('Key field to transpose on'),
	fields: z.array(z.object({
		name: z.string(),
	})).describe('Fields to transpose'),
});

/**
 * Transform step types registry
 */
export const TRANSFORM_STEPS: Record<string, StepType> = {
	SelectValues: {
		typeId: 'SelectValues',
		category: StepCategory.TRANSFORM,
		displayName: 'Select Values',
		description: 'Select, rename, reorder, or remove fields from the data stream. Core transformation step for data shaping and schema mapping. Supports field selection (whitelist/blacklist), renaming with metadata preservation, type conversion, and field reordering. Essential for aligning source data with target schemas.',
		tags: ['transform', 'fields', 'select', 'filter', 'mapping'],
		configurationSchema: selectValuesConfigSchema,
	},
	FilterRows: {
		typeId: 'FilterRows',
		category: StepCategory.TRANSFORM,
		displayName: 'Filter Rows',
		description: 'Route rows to different streams based on conditions. Supports comparison operators (=, <>, <, >, <=, >=), pattern matching (LIKE, REGEXP), and null checks. Essential for data quality filtering, conditional routing, and business rule enforcement. Splits data flow into true/false paths.',
		tags: ['transform', 'filter', 'condition', 'routing', 'validation'],
		configurationSchema: filterRowsConfigSchema,
	},
	SortRows: {
		typeId: 'SortRows',
		category: StepCategory.TRANSFORM,
		displayName: 'Sort Rows',
		description: 'Sort data rows by one or more fields in ascending or descending order. Required before certain operations like merge joins or group by. Handles multiple sort keys with configurable direction per field. Use for ordered output, ranking, or preparing data for downstream operations.',
		tags: ['transform', 'sort', 'order', 'ranking'],
		configurationSchema: sortRowsConfigSchema,
	},
	Calculator: {
		typeId: 'Calculator',
		category: StepCategory.TRANSFORM,
		displayName: 'Calculator',
		description: 'Perform mathematical calculations and create calculated fields. Supports arithmetic operations (add, subtract, multiply, divide), mathematical functions (sqrt, abs, round), and percentage calculations. Use for deriving metrics, financial calculations, or data enrichment with computed values.',
		tags: ['transform', 'calculate', 'math', 'formula', 'derived'],
		configurationSchema: calculatorConfigSchema,
	},
	// Field Operation Steps
	AddConstants: {
		typeId: 'AddConstants',
		category: StepCategory.TRANSFORM,
		displayName: 'Add Constants',
		description: 'Add constant fields with predefined values to each row in the data stream. Useful for adding metadata, version numbers, processing dates, or default values. Supports multiple data types and can be used for tagging, categorization, or data enrichment with static values.',
		tags: ['transform', 'calculate', 'validation'],
		configurationSchema: addConstantsConfigSchema,
	},
	ValueMapper: {
		typeId: 'ValueMapper',
		category: StepCategory.TRANSFORM,
		displayName: 'Value Mapper',
		description: 'Map field values from source to target values using lookup tables. Essential for data standardization, code translation, and categorical mapping. Supports default values for non-matches and is commonly used for status codes, country codes, and business categorization.',
		tags: ['transform', 'lookup', 'cleansing'],
		configurationSchema: valueMapperConfigSchema,
	},
	FieldSplitter: {
		typeId: 'FieldSplitter',
		category: StepCategory.TRANSFORM,
		displayName: 'Split Field to Rows',
		description: 'Split a delimited field into multiple output fields. Parse comma-separated, pipe-delimited, or custom-separated values into distinct columns. Commonly used for parsing concatenated data, expanding multi-value fields, and data normalization from legacy systems.',
		tags: ['transform', 'parse', 'fields'],
		configurationSchema: fieldSplitterConfigSchema,
	},
	ConcatFields: {
		typeId: 'ConcatFields',
		category: StepCategory.TRANSFORM,
		displayName: 'Concat Fields',
		description: 'Concatenate multiple fields into a single field with optional separator. Build composite keys, full names, addresses, or formatted strings from multiple columns. Supports custom delimiters and handles null values gracefully.',
		tags: ['transform', 'join', 'text'],
		configurationSchema: concatFieldsConfigSchema,
	},
	ColumnsSplitter: {
		typeId: 'ColumnsSplitter',
		category: StepCategory.TRANSFORM,
		displayName: 'Split Columns',
		description: 'Split columns based on delimiter into separate fields. Parse structured text data with consistent delimiters into normalized columns. Use for CSV-like data embedded in fields or tab-separated values.',
		tags: ['transform', 'columns', 'parse'],
		configurationSchema: columnsSplitterConfigSchema,
	},
	SetFieldValue: {
		typeId: 'SetFieldValue',
		category: StepCategory.TRANSFORM,
		displayName: 'Set Field Value',
		description: 'Set or override field values based on conditions or patterns. Replace field contents with new values, apply masks, or conditionally update data. Useful for data cleansing, anonymization, and applying business rules.',
		tags: ['transform', 'cleansing', 'validation'],
		configurationSchema: setFieldValueConfigSchema,
	},
	// Filtering Steps
	JavaFilter: {
		typeId: 'JavaFilter',
		category: StepCategory.TRANSFORM,
		displayName: 'Java Filter',
		description: 'Filter rows using Java expressions for complex conditional logic. Write custom filtering logic using Java syntax for advanced data quality rules, business logic validation, and complex multi-field conditions that exceed simple comparison operators.',
		tags: ['transform', 'filter', 'validation'],
		configurationSchema: javaFilterConfigSchema,
	},
	RegexEval: {
		typeId: 'RegexEval',
		category: StepCategory.TRANSFORM,
		displayName: 'Regex Evaluation',
		description: 'Evaluate fields using regular expression patterns for pattern matching and validation. Extract substrings, validate formats (email, phone, SSN), or test data against complex patterns. Returns boolean results and optionally extracts capture groups.',
		tags: ['transform', 'validation', 'text'],
		configurationSchema: regexEvalConfigSchema,
	},
	SampleRows: {
		typeId: 'SampleRows',
		category: StepCategory.TRANSFORM,
		displayName: 'Sample Rows',
		description: 'Extract a sample of rows from the data stream based on line ranges or patterns. Useful for testing transformations with subset of data, debugging, or creating representative datasets. Supports range specifications and row number tracking.',
		tags: ['transform', 'sampling', 'filter'],
		configurationSchema: sampleRowsConfigSchema,
	},
	// Calculation Steps
	Formula: {
		typeId: 'Formula',
		category: StepCategory.TRANSFORM,
		displayName: 'Formula',
		description: 'Calculate fields using Pentaho formula language with Excel-like functions. Supports mathematical, statistical, logical, text, and date functions. More powerful than Calculator with support for complex expressions, nested functions, and advanced calculations.',
		tags: ['transform', 'calculate', 'text'],
		configurationSchema: formulaConfigSchema,
	},
	AnalyticQuery: {
		typeId: 'AnalyticQuery',
		category: StepCategory.TRANSFORM,
		displayName: 'Analytic Query',
		description: 'Calculate SQL analytic functions like LEAD, LAG, ROW_NUMBER, RANK, DENSE_RANK, FIRST_VALUE, and LAST_VALUE. Essential for time-series analysis, ranking, running totals, and window functions without requiring database round-trips.',
		tags: ['transform', 'aggregate', 'sql'],
		configurationSchema: analyticQueryConfigSchema,
	},
	NumberRange: {
		typeId: 'NumberRange',
		category: StepCategory.TRANSFORM,
		displayName: 'Number Range',
		description: 'Classify numeric values into categorical ranges and assign labels based on numeric boundaries. Transform continuous data into bins, brackets, or categories (e.g., age groups, income brackets, score ranges). Configure multiple ranges with custom labels for segmentation and grouping analysis.',
		tags: ['transform', 'calculate', 'validation'],
		configurationSchema: numberRangeConfigSchema,
	},
	Constant: {
		typeId: 'Constant',
		category: StepCategory.TRANSFORM,
		displayName: 'Add Constants',
		description: 'Generate rows with constant values without input. Create lookup tables, reference data, or configuration rows programmatically. Useful for testing, creating metadata rows, or generating static reference datasets.',
		tags: ['transform', 'calculate', 'read'],
		configurationSchema: constantConfigSchema,
	},
	// Sorting Steps
	SortedMerge: {
		typeId: 'SortedMerge',
		category: StepCategory.TRANSFORM,
		displayName: 'Sorted Merge',
		description: 'Merge multiple pre-sorted streams into single sorted output stream. Efficiently combines already-sorted data without full re-sort. Essential for parallel processing, distributed ETL, and maintaining sort order across stream merges.',
		tags: ['transform', 'join', 'sort'],
		configurationSchema: sortedMergeConfigSchema,
	},
	ReservoirSampling: {
		typeId: 'ReservoirSampling',
		category: StepCategory.TRANSFORM,
		displayName: 'Reservoir Sampling',
		description: 'Extract random sample of specified size from large datasets using reservoir sampling algorithm. Provides statistically valid random sampling without loading entire dataset into memory. Useful for data profiling, testing, and creating representative samples.',
		tags: ['transform', 'sampling', 'profiling'],
		configurationSchema: reservoirSamplingConfigSchema,
	},
	// Deduplication Steps
	Unique: {
		typeId: 'Unique',
		category: StepCategory.TRANSFORM,
		displayName: 'Unique',
		description: 'Remove duplicate rows based on specified comparison fields. Identifies and filters duplicates while optionally counting occurrences. Can output duplicates to error stream for auditing. Requires sorted input for optimal performance.',
		tags: ['transform', 'deduplicate', 'filter'],
		configurationSchema: uniqueConfigSchema,
	},
	UniqueRowsByHashKey: {
		typeId: 'UniqueRowsByHashKey',
		category: StepCategory.TRANSFORM,
		displayName: 'Unique Rows (HashKey)',
		description: 'Remove duplicates using hash-based comparison for better performance with unsorted data. Generates hash values from specified fields and identifies duplicates. Memory-efficient approach for large datasets with high duplicate rates.',
		tags: ['transform', 'deduplicate', 'checksum'],
		configurationSchema: uniqueRowsByHashKeyConfigSchema,
	},
	// String Operation Steps
	StringOperations: {
		typeId: 'StringOperations',
		category: StepCategory.TRANSFORM,
		displayName: 'String Operations',
		description: 'Transform text fields using common string operations like trim, upper, lower, padding, and special character removal. Clean and standardize text data, normalize case, remove whitespace, and format strings. Essential for data quality and text normalization.',
		tags: ['transform', 'text', 'cleansing'],
		configurationSchema: stringOperationsConfigSchema,
	},
	StringCut: {
		typeId: 'StringCut',
		category: StepCategory.TRANSFORM,
		displayName: 'String Cut',
		description: 'Extract substrings from fields using position-based cutting. Slice strings by character positions to extract prefixes, suffixes, or middle segments. Useful for parsing fixed-width data, extracting codes, or splitting structured text.',
		tags: ['transform', 'text', 'fields'],
		configurationSchema: stringCutConfigSchema,
	},
	ReplaceString: {
		typeId: 'ReplaceString',
		category: StepCategory.TRANSFORM,
		displayName: 'Replace in String',
		description: 'Find and replace text in string fields using literal or regex patterns. Support for case-sensitive/insensitive matching, whole word matching, and global replacement. Essential for data cleansing, standardization, and text transformation.',
		tags: ['transform', 'text', 'cleansing'],
		configurationSchema: replaceStringConfigSchema,
	},
	SplitFields: {
		typeId: 'SplitFields',
		category: StepCategory.TRANSFORM,
		displayName: 'Split Fields',
		description: 'Split delimited field values into multiple new fields with configurable delimiter. Parse structured text into normalized columns. Commonly used for CSV-in-field, tag parsing, and multi-value field expansion.',
		tags: ['transform', 'text', 'fields'],
		configurationSchema: splitFieldsConfigSchema,
	},
	IfNull: {
		typeId: 'IfNull',
		category: StepCategory.TRANSFORM,
		displayName: 'If Field Value is Null',
		description: 'Replace null values with default values to ensure data completeness. Handle missing data by substituting nulls with meaningful defaults, empty strings, or zero values. Essential for data quality and preventing downstream errors.',
		tags: ['transform', 'validation', 'cleansing'],
		configurationSchema: ifNullConfigSchema,
	},
	NullIf: {
		typeId: 'NullIf',
		category: StepCategory.TRANSFORM,
		displayName: 'Null If',
		description: 'Transform field to null when it matches specified value. Standardize representation of missing or invalid data by converting sentinel values to nulls. Useful for cleaning data where empty strings, zeros, or special codes represent missing values.',
		tags: ['transform', 'validation', 'cleansing'],
		configurationSchema: nullIfConfigSchema,
	},
	// Date/Time Steps
	AddSequence: {
		typeId: 'AddSequence',
		category: StepCategory.TRANSFORM,
		displayName: 'Add Sequence',
		description: 'Generate auto-incrementing sequence numbers for each row to create unique identifiers. Produce surrogate keys, row numbers, or sequential IDs. Configure starting value, increment, and optional maximum. Essential for creating primary keys and row tracking.',
		tags: ['transform', 'calculate', 'database'],
		configurationSchema: addSequenceConfigSchema,
	},
	GetSystemInfo: {
		typeId: 'GetSystemInfo',
		category: StepCategory.TRANSFORM,
		displayName: 'Get System Info',
		description: 'Retrieve system information like current date, time, hostname, IP address, process ID, and JVM memory. Add execution metadata, timestamps, and environment information to data. Useful for auditing, logging, and metadata enrichment.',
		tags: ['transform', 'monitoring', 'validation'],
		configurationSchema: getSystemInfoConfigSchema,
	},
	DateDiff: {
		typeId: 'DateDiff',
		category: StepCategory.TRANSFORM,
		displayName: 'Calculate Date Difference',
		description: 'Calculate difference between two date fields in years, months, days, hours, minutes, or seconds. Compute age, duration, elapsed time, or time-to-event metrics. Essential for temporal analysis and time-based calculations.',
		tags: ['transform', 'calculate', 'validation'],
		configurationSchema: dateDiffConfigSchema,
	},
	// Normalization Steps
	RowNormalizer: {
		typeId: 'RowNormalizer',
		category: StepCategory.TRANSFORM,
		displayName: 'Row Normalizer',
		description: 'Convert columns into rows (unpivot operation). Transform wide format to long format by converting multiple columns into key-value pairs. Essential for normalizing denormalized data, preparing data for analysis, and converting crosstabs to relational format.',
		tags: ['transform', 'fields', 'transform'],
		configurationSchema: rowNormalizerConfigSchema,
	},
	RowDenormalizer: {
		typeId: 'RowDenormalizer',
		category: StepCategory.TRANSFORM,
		displayName: 'Row Denormalizer',
		description: 'Convert rows into columns (pivot operation). Transform long format to wide format by pivoting key-value pairs into separate columns. Essential for creating crosstabs, pivot tables, and wide-format reports from normalized data.',
		tags: ['transform', 'aggregate', 'fields'],
		configurationSchema: rowDenormalizerConfigSchema,
	},
	ColumnToRows: {
		typeId: 'ColumnToRows',
		category: StepCategory.TRANSFORM,
		displayName: 'Columns to Rows',
		description: 'Transform multiple columns into rows with field name as key using unpivot operation. Convert wide-format data with repeating column patterns into normalized long format. Commonly used for survey data, time-series in columns, and denormalized structures.',
		tags: ['transform', 'fields', 'columns'],
		configurationSchema: columnToRowsConfigSchema,
	},
	RowsToColumns: {
		typeId: 'RowsToColumns',
		category: StepCategory.TRANSFORM,
		displayName: 'Rows to Columns',
		description: 'Pivot rows into columns with aggregation. Transform long-format data into wide format by creating columns from row values. Supports aggregation functions for duplicate keys. Essential for reporting, crosstabs, and matrix transformations.',
		tags: ['transform', 'aggregate', 'fields'],
		configurationSchema: rowsToColumnsConfigSchema,
	},
	// Join Steps
	Joiner: {
		typeId: 'Joiner',
		category: StepCategory.TRANSFORM,
		displayName: 'Merge Join (Joiner)',
		description: 'Join two data streams using inner, left outer, right outer, or full outer join. Combine datasets on matching keys without requiring sorted input. Memory-based join suitable for moderate data volumes. Essential for data integration and enrichment.',
		tags: ['transform', 'join', 'aggregate'],
		configurationSchema: joinerConfigSchema,
	},
	MergeJoin: {
		typeId: 'MergeJoin',
		category: StepCategory.TRANSFORM,
		displayName: 'Merge Join',
		description: 'Efficiently join two pre-sorted streams using merge algorithm. Requires both inputs sorted on join keys but provides better performance for large datasets. Supports inner, left, right, and full outer joins. Optimal for joining large sorted datasets.',
		tags: ['transform', 'join', 'aggregate'],
		configurationSchema: mergeJoinConfigSchema,
	},
	MultiWayMergeJoin: {
		typeId: 'MultiWayMergeJoin',
		category: StepCategory.TRANSFORM,
		displayName: 'Multiway Merge Join',
		description: 'Join multiple pre-sorted streams (3 or more) in single operation. More efficient than chaining multiple two-way joins. All inputs must be sorted on join keys. Ideal for star schema joins and combining multiple reference datasets.',
		tags: ['transform', 'join', 'aggregate'],
		configurationSchema: multiWayMergeJoinConfigSchema,
	},
	JoinRows: {
		typeId: 'JoinRows',
		category: StepCategory.TRANSFORM,
		displayName: 'Join Rows (Cartesian)',
		description: 'Execute Cartesian product join combining every row from first stream with every row from second stream. Use cautiously as output size is product of input sizes. Useful for generating all combinations, creating test data, or expanding hierarchies.',
		tags: ['transform', 'join', 'aggregate'],
		configurationSchema: joinRowsConfigSchema,
	},
	// Aggregation Steps
	GroupBy: {
		typeId: 'GroupBy',
		category: StepCategory.TRANSFORM,
		displayName: 'Group By',
		description: 'Aggregate rows using GROUP BY with sum, average, min, max, count, and other functions. Requires sorted input on group fields. Calculate statistics, summarize data, and perform analytical aggregations. Essential for reporting and data summarization.',
		tags: ['transform', 'aggregate', 'calculate'],
		configurationSchema: groupByConfigSchema,
	},
	MemoryGroupBy: {
		typeId: 'MemoryGroupBy',
		category: StepCategory.TRANSFORM,
		displayName: 'Memory Group By',
		description: 'Aggregate rows in memory without requiring sorted input. More flexible than Group By but limited by available memory. Suitable for smaller datasets or when sorting is impractical. Supports same aggregation functions as Group By.',
		tags: ['transform', 'aggregate', 'calculate'],
		configurationSchema: memoryGroupByConfigSchema,
	},
	AggregateRows: {
		typeId: 'AggregateRows',
		category: StepCategory.TRANSFORM,
		displayName: 'Aggregate Rows',
		description: 'Aggregate all rows into single output row with sum, average, min, max, count functions. Calculate overall statistics without grouping. Useful for totals, grand summaries, and single-value metrics across entire dataset.',
		tags: ['transform', 'aggregate', 'calculate'],
		configurationSchema: aggregateRowsConfigSchema,
	},
	UniqueRows: {
		typeId: 'UniqueRows',
		category: StepCategory.TRANSFORM,
		displayName: 'Unique Rows',
		description: 'Keep only unique rows based on field comparison with optional case-insensitive matching. Identifies duplicates and optionally counts occurrences. More flexible than Unique step with support for case-insensitive comparison and error routing.',
		tags: ['transform', 'deduplicate', 'filter'],
		configurationSchema: uniqueRowsConfigSchema,
	},
	// Other Transform Steps
	SwitchCase: {
		typeId: 'SwitchCase',
		category: StepCategory.TRANSFORM,
		displayName: 'Switch / Case',
		description: 'Filter and route rows to different target steps based on field value matching. Implement multi-way conditional routing with case statements and default path. Essential for workflow branching, data routing, and implementing business logic with multiple outcomes.',
		tags: ['transform', 'filter', 'validation'],
		configurationSchema: switchCaseConfigSchema,
	},
	Transpose: {
		typeId: 'Transpose',
		category: StepCategory.TRANSFORM,
		displayName: 'Transpose',
		description: 'Transpose rows and columns by converting row values into column headers. Advanced reshaping for matrix transformations and data restructuring. Useful for creating wide-format datasets from key-value pairs and dynamic column generation.',
		tags: ['transform', 'fields', 'columns'],
		configurationSchema: transposeConfigSchema,
	},
};
