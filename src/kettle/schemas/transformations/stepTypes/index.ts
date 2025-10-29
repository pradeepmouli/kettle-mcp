/**
 * Barrel export for all step types organized by category
 *
 * This modular organization makes it easier to:
 * - Find and edit specific step types by category
 * - Add new step types to appropriate categories
 * - Enable parallel development on different categories
 * - Support lazy loading if needed in the future
 */

export * from './bigdata.js';
export * from './flow.js';
export * from './input.js';
export * from './lookup.js';
export * from './output.js';
export * from './scripting.js';
export * from './transform.js';
export * from './types.js';
export * from './utility.js';
export * from './validation.js';

import { BIGDATA_STEPS } from './bigdata.js';
import { FLOW_STEPS } from './flow.js';
import { INPUT_STEPS } from './input.js';
import { LOOKUP_STEPS } from './lookup.js';
import { OUTPUT_STEPS } from './output.js';
import { SCRIPTING_STEPS } from './scripting.js';
import { TRANSFORM_STEPS } from './transform.js';
import type { StepCategory, StepType } from './types.js';
import { UTILITY_STEPS } from './utility.js';
import { VALIDATION_STEPS } from './validation.js';

/**
 * Combined registry of all step types across all categories
 */
export const STEP_TYPE_REGISTRY: Record<string, StepType> = {
	...INPUT_STEPS,
	...OUTPUT_STEPS,
	...TRANSFORM_STEPS,
	...LOOKUP_STEPS,
	...FLOW_STEPS,
	...SCRIPTING_STEPS,
	...UTILITY_STEPS,
	...BIGDATA_STEPS,
	...VALIDATION_STEPS,
};

/**
 * List all available step types
 */
export function listStepTypes(categoryFilter?: StepCategory): StepType[] {
	const allTypes = Object.values(STEP_TYPE_REGISTRY);
	if (categoryFilter) {
		return allTypes.filter((type) => type.category === categoryFilter);
	}
	return allTypes;
}

/**
 * Get schema for a specific step type
 */
export function getStepTypeSchema(typeId: string): StepType | undefined {
	return STEP_TYPE_REGISTRY[typeId];
}

/**
 * Validate step configuration against its type schema
 */
export function validateStepConfiguration(
	typeId: string,
	configuration: unknown
): { valid: boolean; errors: string[]; } {
	const stepType = getStepTypeSchema(typeId);
	if (!stepType) {
		return { valid: false, errors: [`Unknown step type: ${typeId}`] };
	}

	const result = stepType.configurationSchema.safeParse(configuration);
	if (result.success) {
		return { valid: true, errors: [] };
	}

	return {
		valid: false,
		errors: result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
	};
}
