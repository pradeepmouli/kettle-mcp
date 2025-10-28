/**
 * Barrel export for all job entry types organized by category
 *
 * This modular organization makes it easier to:
 * - Find and edit specific job entry types by category
 * - Add new job entry types to appropriate categories
 * - Enable parallel development on different categories
 * - Support lazy loading if needed in the future
 */

export * from './general.js';
export * from './types.js';

import { GENERAL_JOB_ENTRIES } from './general.js';
import type { JobEntryCategory, JobEntryType } from './types.js';

/**
 * Combined registry of all job entry types across all categories
 */
export const JOB_ENTRY_TYPE_REGISTRY: Record<string, JobEntryType> = {
	...GENERAL_JOB_ENTRIES,
	// Future categories will be added here:
	// ...FILE_MANAGEMENT_JOB_ENTRIES,
	// ...MAIL_JOB_ENTRIES,
	// etc.
};

/**
 * List all available job entry types
 */
export function listJobEntryTypes(categoryFilter?: JobEntryCategory): JobEntryType[] {
	const allTypes = Object.values(JOB_ENTRY_TYPE_REGISTRY);
	if (categoryFilter) {
		return allTypes.filter((type) => type.category === categoryFilter);
	}
	return allTypes;
}

/**
 * Get schema for a specific job entry type
 */
export function getJobEntryTypeSchema(typeId: string): JobEntryType | undefined {
	return JOB_ENTRY_TYPE_REGISTRY[typeId];
}

/**
 * Validate job entry configuration against its type schema
 */
export function validateJobEntryConfiguration(
	typeId: string,
	configuration: unknown
): { valid: boolean; errors: string[]; } {
	const entryType = getJobEntryTypeSchema(typeId);
	if (!entryType) {
		return { valid: false, errors: [`Unknown job entry type: ${typeId}`] };
	}

	const result = entryType.configurationSchema.safeParse(configuration);
	if (result.success) {
		return { valid: true, errors: [] };
	}

	return {
		valid: false,
		errors: result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
	};
}
