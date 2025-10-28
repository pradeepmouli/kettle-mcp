import { validateStepConfiguration } from '../kettle/schemas/transformations/stepTypes/index.js';
import { buildKettleXml, ensureKettleFile, parseKettleXml } from '../kettle/xml-utils.js';
import { TransformationStep, validateTransformationStep } from '../models/TransformationStep.js';
import { atomicWrite } from '../utils/file-utils.js';

/**
 * Add a step to a transformation (.ktr file)
 */
export async function addTransformationStep(
	filePath: string,
	step: TransformationStep
): Promise<{ success: boolean; transformation?: any; warnings?: string[]; error?: string; }> {
	try {
		// Validate file type
		ensureKettleFile(filePath, 'transformation');

		// Validate step
		const validatedStep = validateTransformationStep(step);

		// Validate step configuration against type schema
		const configValidation = validateStepConfiguration(validatedStep.type, validatedStep.configuration);
		if (!configValidation.valid) {
			return {
				success: false,
				error: `Invalid step configuration: ${configValidation.errors.join(', ')}`,
			};
		}

		// Read and parse transformation XML
		const transformation = await parseKettleXml(filePath);

		// Ensure transformation structure exists
		if (!transformation.transformation) {
			return { success: false, error: 'Invalid transformation file structure' };
		}

		// Initialize steps array if it doesn't exist
		if (!transformation.transformation.step) {
			transformation.transformation.step = [];
		}

		// Ensure steps is an array
		if (!Array.isArray(transformation.transformation.step)) {
			transformation.transformation.step = [transformation.transformation.step];
		}

		// Check for duplicate step name
		const existingStep = transformation.transformation.step.find(
			(s: any) => s.name === validatedStep.name
		);
		if (existingStep) {
			return { success: false, error: `Step with name "${validatedStep.name}" already exists` };
		}

		// Build step XML object
		const stepXml: any = {
			name: validatedStep.name,
			type: validatedStep.type,
			...validatedStep.configuration,
			GUI: {
				xloc: validatedStep.xloc,
				yloc: validatedStep.yloc,
			},
		};

		if (validatedStep.distribute !== undefined) {
			stepXml.distribute = validatedStep.distribute ? 'Y' : 'N';
		}
		if (validatedStep.copies !== undefined) {
			stepXml.copies = validatedStep.copies;
		}
		if (validatedStep.partitioning) {
			stepXml.partitioning = validatedStep.partitioning;
		}

		// Add step to transformation
		transformation.transformation.step.push(stepXml);

		// Build and write XML
		const xmlContent = buildKettleXml(transformation);
		await atomicWrite(filePath, xmlContent);

		return { success: true, transformation, warnings: [] };
	} catch (error) {
		return { success: false, error: (error as Error).message };
	}
}

/**
 * Add a hop between two steps in a transformation
 */
export async function addTransformationHop(
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

		// Ensure steps exist
		const steps = Array.isArray(transformation.transformation.step)
			? transformation.transformation.step
			: transformation.transformation.step
				? [transformation.transformation.step]
				: [];

		const fromExists = steps.some((s: any) => s.name === from);
		const toExists = steps.some((s: any) => s.name === to);

		if (!fromExists) {
			return { success: false, error: `Source step "${from}" not found` };
		}
		if (!toExists) {
			return { success: false, error: `Target step "${to}" not found` };
		}

		// Initialize order structure if it doesn't exist
		if (!transformation.transformation.order) {
			transformation.transformation.order = { hop: [] };
		}

		// Ensure hop array exists
		if (!transformation.transformation.order.hop) {
			transformation.transformation.order.hop = [];
		}

		// Normalize hop to array if it's a single object
		if (!Array.isArray(transformation.transformation.order.hop)) {
			transformation.transformation.order.hop = [transformation.transformation.order.hop];
		}

		// Check for duplicate hop
		const existingHop = transformation.transformation.order.hop.find(
			(h: any) => h.from === from && h.to === to
		);
		if (existingHop) {
			return { success: false, error: `Hop from "${from}" to "${to}" already exists` };
		}

		// Add hop to transformation
		transformation.transformation.order.hop.push({
			from,
			to,
			enabled: 'Y',
		});

		// Build and write XML
		const xmlContent = buildKettleXml(transformation);
		await atomicWrite(filePath, xmlContent);

		return { success: true, transformation, warnings: [] };
	} catch (error) {
		return { success: false, error: (error as Error).message };
	}
}
