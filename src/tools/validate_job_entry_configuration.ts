import { validateJobEntryConfiguration } from '../kettle/schemas/jobs/entryTypes/index.js';

/**
 * Validate a job entry configuration against its type schema
 */
export async function validateJobEntryConfigurationTool(
	entryType: string,
	configuration: Record<string, any>
): Promise<{ valid: boolean; error?: string; }> {
	const result = validateJobEntryConfiguration(entryType, configuration);

	if (result.valid) {
		return { valid: true };
	}

	return {
		valid: false,
		error: result.errors.join('; '),
	};
}
