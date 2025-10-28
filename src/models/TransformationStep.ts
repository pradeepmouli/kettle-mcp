import { z } from 'zod';

/**
 * Transformation Step model representing a step in a Kettle transformation
 */
export interface TransformationStep {
	name: string;
	type: string;
	configuration: Record<string, any>;
	xloc: number;
	yloc: number;
	distribute?: boolean;
	copies?: number;
	partitioning?: Record<string, any>;
}

/**
 * Zod schema for TransformationStep validation
 */
export const TransformationStepSchema = z.object({
	name: z.string().min(1, 'Step name is required'),
	type: z.string().min(1, 'Step type is required'),
	configuration: z.record(z.any()),
	xloc: z.number().min(0).max(9999).default(100),
	yloc: z.number().min(0).max(9999).default(100),
	distribute: z.boolean().optional(),
	copies: z.number().optional(),
	partitioning: z.record(z.any()).optional(),
});

/**
 * Hop model representing a connection between two steps
 */
export interface Hop {
	from: string;
	to: string;
	enabled?: boolean;
}

/**
 * Zod schema for Hop validation
 */
export const HopSchema = z.object({
	from: z.string().min(1, 'Source step name is required'),
	to: z.string().min(1, 'Target step name is required'),
	enabled: z.boolean().optional().default(true),
});

/**
 * Validate TransformationStep
 */
export function validateTransformationStep(step: unknown): TransformationStep {
	return TransformationStepSchema.parse(step);
}

/**
 * Validate Hop
 */
export function validateHop(hop: unknown): Hop {
	return HopSchema.parse(hop);
}
