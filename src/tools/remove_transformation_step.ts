import { buildKettleXml, ensureKettleFile, parseKettleXml } from '../kettle/xml-utils.js';
import { atomicWrite } from '../utils/file-utils.js';

/**
 * Remove a step from a transformation and automatically remove all connected hops
 */
export async function removeTransformationStep(
	filePath: string,
	stepName: string
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
		let steps = Array.isArray(transformation.transformation.step)
			? transformation.transformation.step
			: [transformation.transformation.step];

		// Find the step to remove
		const stepExists = steps.some((s: any) => s.name === stepName);
		if (!stepExists) {
			return { success: false, error: `Step "${stepName}" not found` };
		}

		// Remove the step
		steps = steps.filter((s: any) => s.name !== stepName);

		// Update steps in transformation
		if (steps.length === 0) {
			delete transformation.transformation.step;
		} else {
			transformation.transformation.step = steps.length === 1 ? steps[0] : steps;
		}

		// Remove all hops connected to this step
		if (transformation.transformation.order?.hop) {
			let hops = Array.isArray(transformation.transformation.order.hop)
				? transformation.transformation.order.hop
				: [transformation.transformation.order.hop];

			// Filter out hops that connect to the removed step
			hops = hops.filter((h: any) => {
				return h.from !== stepName && h.to !== stepName;
			});

			// Update hops in transformation
			if (hops.length === 0) {
				delete transformation.transformation.order;
			} else {
				transformation.transformation.order.hop = hops;
			}
		}

		// Remove error handling references if they exist
		if (transformation.transformation.step_error_handling) {
			let errorHandlers = Array.isArray(transformation.transformation.step_error_handling)
				? transformation.transformation.step_error_handling
				: [transformation.transformation.step_error_handling];

			errorHandlers = errorHandlers.filter((eh: any) => eh.source_step !== stepName);

			if (errorHandlers.length === 0) {
				delete transformation.transformation.step_error_handling;
			} else {
				transformation.transformation.step_error_handling =
					errorHandlers.length === 1 ? errorHandlers[0] : errorHandlers;
			}
		}

		// Build and write XML
		const xmlContent = buildKettleXml(transformation);
		await atomicWrite(filePath, xmlContent);

		return { success: true, transformation, warnings: [] };
	} catch (error) {
		return { success: false, error: (error as Error).message };
	}
}

/**
 * Remove a hop between two steps in a transformation
 */
export async function removeTransformationHop(
	filePath: string,
	from: string,
	to: string
): Promise<{ success: boolean; transformation?: any; warnings?: string[]; error?: string; }> {
	try {
		// Validate file type
		ensureKettleFile(filePath, 'transformation');

		// Read and parse transformation XML
		const transformation = await parseKettleXml(filePath);

		if (!transformation.transformation) {
			return { success: false, error: 'Invalid transformation file structure' };
		}

		// Ensure hops exist
		if (!transformation.transformation.order?.hop) {
			return { success: false, error: 'No hops found in transformation' };
		}

		let hops = Array.isArray(transformation.transformation.order.hop)
			? transformation.transformation.order.hop
			: [transformation.transformation.order.hop];

		// Find and remove the hop
		const initialLength = hops.length;
		hops = hops.filter((h: any) => {
			return !(h.from === from && h.to === to);
		});

		if (hops.length === initialLength) {
			return { success: false, error: `Hop from "${from}" to "${to}" not found` };
		}

		// Update hops in transformation
		if (hops.length === 0) {
			delete transformation.transformation.order;
		} else {
			transformation.transformation.order.hop = hops;
		}

		// Build and write XML
		const xmlContent = buildKettleXml(transformation);
		await atomicWrite(filePath, xmlContent);

		return { success: true, transformation, warnings: [] };
	} catch (error) {
		return { success: false, error: (error as Error).message };
	}
}
