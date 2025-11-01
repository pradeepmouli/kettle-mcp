/**
 * Standardized tag taxonomy for Kettle step type discovery
 *
 * Tags enable capability-based search and filtering by LLMs.
 * Each step type should have 3-5 relevant tags from this taxonomy.
 */

export const TAG_TAXONOMY = {
	/**
	 * Data Source Types (12 tags)
	 * Identify where data comes from or goes to
	 */
	dataSources: [
		'database',
		'file',
		'streaming',
		'api',
		'nosql',
		'cloud',
		'queue',
		'cache',
		'ldap',
		'email',
		'ftp',
		'sftp',
	] as const,

	/**
	 * File Formats (12 tags)
	 * Supported file formats for I/O operations
	 */
	fileFormats: [
		'csv',
		'json',
		'xml',
		'excel',
		'text',
		'parquet',
		'avro',
		'orc',
		'yaml',
		'properties',
		'ldif',
		'access',
	] as const,

	/**
	 * Operations (18 tags)
	 * Types of data transformations and operations
	 */
	operations: [
		'read',
		'write',
		'transform',
		'filter',
		'join',
		'lookup',
		'aggregate',
		'sort',
		'deduplicate',
		'normalize',
		'denormalize',
		'validate',
		'cleanse',
		'calculate',
		'split',
		'merge',
		'pivot',
		'unpivot',
	] as const,

	/**
	 * Technologies (22 tags)
	 * Specific databases, platforms, and protocols
	 */
	technologies: [
		'sql',
		'nosql',
		'mysql',
		'postgresql',
		'oracle',
		'sqlserver',
		'mongodb',
		'cassandra',
		'elasticsearch',
		'kafka',
		'jms',
		'mqtt',
		'hadoop',
		'spark',
		'hdfs',
		'hbase',
		's3',
		'azure',
		'gcp',
		'rest',
		'soap',
		'http',
	] as const,

	/**
	 * Data Quality (8 tags)
	 * Data validation, cleansing, and quality operations
	 */
	quality: [
		'quality',
		'validation',
		'checksum',
		'deduplication',
		'cleansing',
		'profiling',
		'sampling',
		'monitoring',
	] as const,

	/**
	 * Scripting (6 tags)
	 * Scripting languages and custom code execution
	 */
	scripting: [
		'javascript',
		'java',
		'groovy',
		'python',
		'shell',
		'sql-script',
	] as const,
} as const;

/**
 * Flatten all tags into a single array for easy validation
 */
export const ALL_TAGS = [
	...TAG_TAXONOMY.dataSources,
	...TAG_TAXONOMY.fileFormats,
	...TAG_TAXONOMY.operations,
	...TAG_TAXONOMY.technologies,
	...TAG_TAXONOMY.quality,
	...TAG_TAXONOMY.scripting,
] as const;

/**
 * Type helper for tag validation
 */
export type Tag = (typeof ALL_TAGS)[number];

/**
 * Validate that a tag exists in the taxonomy
 */
export function isValidTag(tag: string): tag is Tag {
	return ALL_TAGS.includes(tag as Tag);
}

/**
 * Get all tags that match a partial string (for search/autocomplete)
 */
export function findTags(partial: string): Tag[] {
	const lowerPartial = partial.toLowerCase();
	return ALL_TAGS.filter((tag) =>
		tag.toLowerCase().includes(lowerPartial)
	);
}
