/**
 * XML Parser for Kettle artifacts using fast-xml-parser
 *
 * Provides round-trip safe parsing and writing of .ktr and .kjb files.
 */

import type { X2jOptions, XmlBuilderOptions } from 'fast-xml-parser';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';

// ============================================================================
// Parser Configuration
// ============================================================================

/**
 * Parser options for reading Kettle XML files
 * Preserves structure and unknown fields for round-trip safety
 */
export const KETTLE_PARSER_OPTIONS: Partial<X2jOptions> = {
	ignoreAttributes: false,
	attributeNamePrefix: '@_',
	textNodeName: '#text',
	parseAttributeValue: false, // Preserve as strings
	parseTagValue: false, // Preserve as strings
	trimValues: false, // Preserve whitespace
	cdataPropName: '#cdata',
	commentPropName: '#comment',
	preserveOrder: false, // Use object representation
	allowBooleanAttributes: true,
	ignoreDeclaration: false,
	ignorePiTags: false,
	removeNSPrefix: false, // Keep namespaces
};

/**
 * Builder options for writing Kettle XML files
 * Ensures output matches original format as closely as possible
 */
export const KETTLE_BUILDER_OPTIONS: Partial<XmlBuilderOptions> = {
	ignoreAttributes: false,
	attributeNamePrefix: '@_',
	textNodeName: '#text',
	cdataPropName: '#cdata',
	commentPropName: '#comment',
	format: true, // Pretty-print
	indentBy: '  ', // 2 spaces (Kettle standard)
	suppressEmptyNode: true, // Use self-closing tags
	suppressBooleanAttributes: false,
	suppressUnpairedNode: false,
	tagValueProcessor: (_name: string, value: unknown) => {
		// Preserve values as-is
		return String(value);
	},
	attributeValueProcessor: (_name: string, value: unknown) => {
		// Preserve attribute values as-is
		return String(value);
	},
};

// ============================================================================
// Parser & Builder Instances
// ============================================================================

export const kettleParser = new XMLParser(KETTLE_PARSER_OPTIONS);
export const kettleBuilder = new XMLBuilder(KETTLE_BUILDER_OPTIONS);

// ============================================================================
// Parse Functions
// ============================================================================

/**
 * Parse Kettle XML string to JSON object
 */
export function parseKettleXml(xmlString: string): unknown {
	return kettleParser.parse(xmlString);
}

/**
 * Parse a transformation (.ktr) file
 */
export function parseTransformation(xmlString: string): unknown {
	const parsed = parseKettleXml(xmlString);
	if (typeof parsed !== 'object' || parsed === null || !('transformation' in parsed)) {
		throw new Error('Invalid transformation XML: missing root "transformation" element');
	}
	return (parsed as { transformation: unknown; }).transformation;
}

/**
 * Parse a job (.kjb) file
 */
export function parseJob(xmlString: string): unknown {
	const parsed = parseKettleXml(xmlString);
	if (typeof parsed !== 'object' || parsed === null || !('job' in parsed)) {
		throw new Error('Invalid job XML: missing root "job" element');
	}
	return (parsed as { job: unknown; }).job;
}

// ============================================================================
// Build Functions
// ============================================================================

/**
 * Build Kettle XML string from JSON object
 */
export function buildKettleXml(jsonObj: unknown): string {
	return kettleBuilder.build(jsonObj);
}

/**
 * Build a transformation (.ktr) XML string from JSON
 */
export function buildTransformation(transformationObj: unknown): string {
	const wrapped = { transformation: transformationObj };
	return `<?xml version="1.0" encoding="UTF-8"?>\n${buildKettleXml(wrapped)}\n`;
}

/**
 * Build a job (.kjb) XML string from JSON
 */
export function buildJob(jobObj: unknown): string {
	const wrapped = { job: jobObj };
	return `<?xml version="1.0" encoding="UTF-8"?>\n${buildKettleXml(wrapped)}\n`;
}

// ============================================================================
// Normalization Helpers
// ============================================================================

/**
 * Normalize parsed Kettle JSON for easier processing
 * - Convert single-item objects to arrays where expected (hops, steps, entries, etc.)
 * - Convert empty strings to empty arrays for plural container elements
 * - Extract text nodes from simple elements
 * - Convert numeric strings to numbers for known numeric fields
 */
export function normalizeKettleJson(obj: unknown): unknown {
	if (typeof obj !== 'object' || obj === null) {
		return obj;
	}

	if (Array.isArray(obj)) {
		return obj.map(normalizeKettleJson);
	}

	const normalized: Record<string, unknown> = {};

	// Numeric fields that should be numbers
	const numericFields = [
		'job_status', 'size_rowset', 'sleep_time_empty', 'sleep_time_full',
		'feedback_size', 'step_performance_capturing_delay',
		'step_performance_capturing_size_limit', 'xloc', 'yloc', 'copies',
		'gui_draw', 'parallel', 'from_nr', 'to_nr', 'nr',
		'limit', 'length', 'precision', 'never_ending', 'interval_in_ms',
		'schedulerType', 'intervalSeconds', 'intervalMinutes', 'hour', 'minutes',
		'weekDay', 'DayOfMonth',
	];

	for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
		// Special handling for transformation 'step' → 'steps'
		if (key === 'step' && Array.isArray(value)) {
			normalized['steps'] = value.map(normalizeKettleJson);
			continue;
		}

		// Special handling for 'order' object (contains 'hop' array) → extract hop array to 'order' directly
		if (key === 'order' && typeof value === 'object' && value !== null && !Array.isArray(value)) {
			const orderObj = value as Record<string, unknown>;
			if ('hop' in orderObj) {
				const hopValue = orderObj.hop;
				if (Array.isArray(hopValue)) {
					normalized['order'] = hopValue.map(normalizeKettleJson);
				} else if (hopValue !== '' && hopValue !== null && hopValue !== undefined) {
					normalized['order'] = [normalizeKettleJson(hopValue)];
				} else {
					normalized['order'] = [];
				}
			} else {
				// No hop, empty order
				normalized['order'] = [];
			}
			continue;
		}

		// Special handling for job 'entries' object (contains 'entry' array) → extract to array
		if (key === 'entries' && typeof value === 'object' && value !== null && !Array.isArray(value)) {
			const entriesObj = value as Record<string, unknown>;
			if ('entry' in entriesObj) {
				const entryValue = entriesObj.entry;
				if (Array.isArray(entryValue)) {
					normalized['entries'] = entryValue.map(normalizeKettleJson);
				} else if (entryValue !== '' && entryValue !== null && entryValue !== undefined) {
					normalized['entries'] = [normalizeKettleJson(entryValue)];
				} else {
					normalized['entries'] = [];
				}
			} else {
				normalized['entries'] = [];
			}
			continue;
		}

		// Special handling for job 'hops' object (contains 'hop' array) → extract to array
		if (key === 'hops' && typeof value === 'object' && value !== null && !Array.isArray(value)) {
			const hopsObj = value as Record<string, unknown>;
			if ('hop' in hopsObj) {
				const hopValue = hopsObj.hop;
				if (Array.isArray(hopValue)) {
					normalized['hops'] = hopValue.map(normalizeKettleJson);
				} else if (hopValue !== '' && hopValue !== null && hopValue !== undefined) {
					normalized['hops'] = [normalizeKettleJson(hopValue)];
				} else {
					normalized['hops'] = [];
				}
			} else {
				normalized['hops'] = [];
			}
			continue;
		}

		// Handle empty string containers that should be empty arrays
		// (check for empty or whitespace-only strings)
		if ((key === 'parameters' || key === 'notepads' || key === 'slaveservers') &&
			(value === '' || value === null || value === undefined ||
				(typeof value === 'string' && value.trim() === ''))) {
			normalized[key] = [];
			continue;
		}

		// Handle nested 'parameters' in info object or at root
		if (key === 'parameters' && typeof value === 'object' && value !== null && !Array.isArray(value)) {
			const paramsObj = value as Record<string, unknown>;
			if ('parameter' in paramsObj) {
				const paramValue = paramsObj.parameter;
				if (Array.isArray(paramValue)) {
					normalized['parameters'] = paramValue.map(normalizeKettleJson);
				} else if (paramValue !== '' && paramValue !== null && paramValue !== undefined) {
					normalized['parameters'] = [normalizeKettleJson(paramValue)];
				} else {
					normalized['parameters'] = [];
				}
			} else {
				// Empty parameters object
				normalized['parameters'] = [];
			}
			continue;
		}

		// Handle 'fields' in steps - same pattern
		if (key === 'fields' && typeof value === 'object' && value !== null && !Array.isArray(value)) {
			const fieldsObj = value as Record<string, unknown>;
			if ('field' in fieldsObj) {
				const fieldValue = fieldsObj.field;
				if (Array.isArray(fieldValue)) {
					normalized['fields'] = fieldValue.map(normalizeKettleJson);
				} else if (fieldValue !== '' && fieldValue !== null && fieldValue !== undefined) {
					normalized['fields'] = [normalizeKettleJson(fieldValue)];
				} else {
					normalized['fields'] = [];
				}
			} else {
				normalized['fields'] = [];
			}
			continue;
		}

		// Extract text nodes
		if (
			typeof value === 'object' &&
			value !== null &&
			!Array.isArray(value) &&
			'#text' in value &&
			Object.keys(value).length === 1
		) {
			normalized[key] = (value as { '#text': unknown; })['#text'];
			continue;
		}

		// Convert numeric strings to numbers
		if (numericFields.includes(key) && typeof value === 'string') {
			const num = Number(value);
			if (!isNaN(num)) {
				normalized[key] = num;
				continue;
			}
		}

		// Handle 'attributes' - should be an object, not a string
		if (key === 'attributes') {
			if (value === '' || value === null || value === undefined) {
				normalized[key] = {};
				continue;
			}
		}

		// Recurse
		normalized[key] = normalizeKettleJson(value);
	}

	return normalized;
}

/**
 * Denormalize Kettle JSON back to XML-friendly format
 * - Unwrap single-item arrays back to objects where needed
 * - Restore text nodes
 * - Convert empty arrays back to empty strings for XML
 * - Restore Kettle-specific structure (steps → step, hops in order object for transformations, etc.)
 */
export function denormalizeKettleJson(obj: unknown): unknown {
	if (typeof obj !== 'object' || obj === null) {
		return obj;
	}

	if (Array.isArray(obj)) {
		return obj.map(denormalizeKettleJson);
	}

	const denormalized: Record<string, unknown> = {};

	for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
		// Special handling for 'steps' → 'step' (transformation)
		if (key === 'steps' && Array.isArray(value)) {
			const denormalizedSteps = value.map(denormalizeKettleJson);
			denormalized['step'] = denormalizedSteps;
			continue;
		}

		// Special handling for 'order' array → wrap in order object with hop child
		if (key === 'order' && Array.isArray(value)) {
			const denormalizedOrder = value.map(denormalizeKettleJson);
			if (denormalizedOrder.length === 0) {
				denormalized['order'] = '';
			} else if (denormalizedOrder.length === 1) {
				denormalized['order'] = { hop: denormalizedOrder[0] };
			} else {
				denormalized['order'] = { hop: denormalizedOrder };
			}
			continue;
		}

		// Special handling for 'entries' → wrap in entries object with entry child
		if (key === 'entries' && Array.isArray(value)) {
			const denormalizedEntries = value.map(denormalizeKettleJson);
			if (denormalizedEntries.length === 0) {
				denormalized['entries'] = '';
			} else if (denormalizedEntries.length === 1) {
				denormalized['entries'] = { entry: denormalizedEntries[0] };
			} else {
				denormalized['entries'] = { entry: denormalizedEntries };
			}
			continue;
		}

		// Special handling for 'hops' → wrap in hops object with hop child
		if (key === 'hops' && Array.isArray(value)) {
			const denormalizedHops = value.map(denormalizeKettleJson);
			if (denormalizedHops.length === 0) {
				denormalized['hops'] = '';
			} else if (denormalizedHops.length === 1) {
				denormalized['hops'] = { hop: denormalizedHops[0] };
			} else {
				denormalized['hops'] = { hop: denormalizedHops };
			}
			continue;
		}

		// Special handling for 'parameters' → wrap with parameter child
		if (key === 'parameters' && Array.isArray(value)) {
			const denormalizedParams = value.map(denormalizeKettleJson);
			if (denormalizedParams.length === 0) {
				denormalized['parameters'] = '';
			} else if (denormalizedParams.length === 1) {
				denormalized['parameters'] = { parameter: denormalizedParams[0] };
			} else {
				denormalized['parameters'] = { parameter: denormalizedParams };
			}
			continue;
		}

		// Special handling for 'fields' → wrap with field child
		if (key === 'fields' && Array.isArray(value)) {
			const denormalizedFields = value.map(denormalizeKettleJson);
			if (denormalizedFields.length === 0) {
				denormalized['fields'] = '';
			} else if (denormalizedFields.length === 1) {
				denormalized['fields'] = { field: denormalizedFields[0] };
			} else {
				denormalized['fields'] = { field: denormalizedFields };
			}
			continue;
		}

		// Handle 'notepads', 'slaveservers' - empty arrays → empty strings
		if ((key === 'notepads' || key === 'slaveservers') && Array.isArray(value)) {
			if (value.length === 0) {
				denormalized[key] = '';
			} else {
				denormalized[key] = value.map(denormalizeKettleJson);
			}
			continue;
		}

		// Handle attributes - convert empty object to empty string
		if (key === 'attributes' && typeof value === 'object' && value !== null && !Array.isArray(value)) {
			if (Object.keys(value as Record<string, unknown>).length === 0) {
				denormalized[key] = '';
				continue;
			}
		}

		// Recurse
		denormalized[key] = denormalizeKettleJson(value);
	}

	return denormalized;
}
