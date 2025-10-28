import { validateStepConfiguration } from '../kettle/schemas/transformations/stepTypes/index.js';
import { buildKettleXml, ensureKettleFile, parseKettleXml } from '../kettle/xml-utils.js';
import { atomicWrite } from '../utils/file-utils.js';

/**
 * Update an existing step in a transformation
 */
export async function updateTransformationStep(
	filePath: string,
	stepName: string,
	updates: {
		configuration?: Record<string, any>;
		xloc?: number;
		yloc?: number;
	}
): Promise<{ success: boolean; transformation?: any; warnings?: string[]; error?: string; }> {
	try {
		// Validate file type
		ensureKettleFile(filePath, 'transformation');

		// Read and parse transformation XML
		const transformation = await parseKettleXml(filePath);

		if (!transformation.transformation) {
			return { success: false, error: 'Invalid transformation file structure' };
		}

		// Ensure steps array exists
		if (!transformation.transformation.step) {
			return { success: false, error: 'No steps found in transformation' };
		}

		// Ensure steps is an array
		const steps = Array.isArray(transformation.transformation.step)
			? transformation.transformation.step
			: [transformation.transformation.step];

		// Find the step to update
		const stepIndex = steps.findIndex((s: any) => s.name === stepName);
		if (stepIndex === -1) {
			return { success: false, error: `Step "${stepName}" not found` };
		}

		const step = steps[stepIndex];

		// Update configuration if provided
		if (updates.configuration) {
			// Merge configuration first
			const mergedConfig = { ...step, ...updates.configuration };

			// Validate the merged configuration against step type schema
			const configValidation = validateStepConfiguration(step.type, mergedConfig);
			if (!configValidation.valid) {
				return {
					success: false,
					error: `Invalid step configuration: ${configValidation.errors.join(', ')}`,
				};
			}

			// Merge configuration
			Object.assign(step, updates.configuration);
		}

		// Update GUI coordinates if provided
		if (updates.xloc !== undefined || updates.yloc !== undefined) {
			if (!step.GUI) {
				step.GUI = {};
			}
			if (updates.xloc !== undefined) {
				step.GUI.xloc = updates.xloc;
			}
			if (updates.yloc !== undefined) {
				step.GUI.yloc = updates.yloc;
			}
		}

		// Update the step in the array
		steps[stepIndex] = step;
		transformation.transformation.step = steps.length === 1 ? steps[0] : steps;

		// Build and write XML
		const xmlContent = buildKettleXml(transformation);
		await atomicWrite(filePath, xmlContent);

		return { success: true, transformation, warnings: [] };
	} catch (error) {
		return { success: false, error: (error as Error).message };
	}
}
