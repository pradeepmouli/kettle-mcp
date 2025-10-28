import { z } from 'zod';

/**
 * Represents a job entry in a Kettle job
 */
export interface JobEntry {
	name: string;
	type: string;
	description?: string;
	configuration: Record<string, any>;
	guiCoordinates?: {
		x: number;
		y: number;
	};
	drawStep?: boolean;
	parallel?: boolean;
}

/**
 * Represents a hop (connection) between job entries
 */
export interface JobHop {
	from: string;
	to: string;
	enabled?: boolean;
	evaluation?: boolean;
	unconditional?: boolean;
}

/**
 * Zod schema for job entry validation
 */
export const JobEntrySchema = z.object({
	name: z.string().min(1, 'Job entry name is required'),
	type: z.string().min(1, 'Job entry type is required'),
	description: z.string().optional(),
	configuration: z.record(z.any()),
	guiCoordinates: z
		.object({
			x: z.number(),
			y: z.number(),
		})
		.optional(),
	drawStep: z.boolean().optional(),
	parallel: z.boolean().optional(),
});

/**
 * Zod schema for job hop validation
 */
export const JobHopSchema = z.object({
	from: z.string().min(1, 'From entry name is required'),
	to: z.string().min(1, 'To entry name is required'),
	enabled: z.boolean().optional().default(true),
	evaluation: z.boolean().optional().default(true),
	unconditional: z.boolean().optional().default(false),
});

/**
 * Validate a job entry object
 */
export function validateJobEntry(entry: unknown): JobEntry {
	return JobEntrySchema.parse(entry) as JobEntry;
}

/**
 * Validate a job hop object
 */
export function validateJobHop(hop: unknown): JobHop {
	return JobHopSchema.parse(hop) as JobHop;
}
