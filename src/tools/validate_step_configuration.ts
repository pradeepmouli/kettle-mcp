import { validateStepConfiguration } from '../kettle/schemas/transformations/stepTypes/index.js';

/**
 * Validate step configuration before adding/updating
 */
export async function validateStepConfigurationTool(
	stepType: string,
	configuration: Record<string, any>
): Promise<{ valid: boolean; errors: string[]; }> {
	return validateStepConfiguration(stepType, configuration);
}
