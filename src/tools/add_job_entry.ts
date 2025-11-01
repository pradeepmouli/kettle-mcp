import { validateJobEntryConfiguration } from '../kettle/schemas/jobs/entryTypes/index.js';
import { buildKettleXml, ensureKettleFile, parseKettleXml } from '../kettle/xml-utils.js';
import { validateJobHop } from '../models/JobEntry.js';
import { atomicWrite, createBackup, generateDiff } from '../utils/file-utils.js';

/**
 * Add a new job entry to a Kettle job file
 */
export async function addJobEntry(
	filePath: string,
	entryName: string,
	entryType: string,
	configuration: Record<string, any>,
	options?: {
		description?: string;
		guiX?: number;
		guiY?: number;
		drawStep?: boolean;
		parallel?: boolean;
	}
): Promise<{ success: boolean; diff?: string; error?: string; }> {
	try {
		// Ensure the file is a valid job file
		await ensureKettleFile(filePath, 'job');

		// Parse the job file
		const jobData = await parseKettleXml(filePath);

		// Ensure job structure exists
		if (!jobData.job) {
			return { success: false, error: 'Invalid job file structure' };
		}

		// Check if entry with the same name already exists
		const entries = Array.isArray(jobData.job.entries?.entry)
			? jobData.job.entries.entry
			: jobData.job.entries?.entry
				? [jobData.job.entries.entry]
				: [];

		if (entries.some((e: any) => e.name === entryName)) {
			return {
				success: false,
				error: `Job entry with name "${entryName}" already exists`,
			};
		}

		// Validate the entry configuration against the schema
		const validation = validateJobEntryConfiguration(entryType, configuration);
		if (!validation.valid) {
			return {
				success: false,
				error: `Configuration validation failed: ${validation.errors.join(', ')}`,
			};
		}

		// Validate the job entry structure
		const jobEntry = {
			name: entryName,
			type: entryType,
			description: options?.description || '',
			configuration,
			guiCoordinates:
				options?.guiX !== undefined && options?.guiY !== undefined
					? { x: options.guiX, y: options.guiY }
					: { x: 100, y: 100 }, // Default coordinates
			drawStep: options?.drawStep ?? true,
			parallel: options?.parallel ?? false,
		};

		// Create the new entry XML structure
		const newEntry: any = {
			name: jobEntry.name,
			description: jobEntry.description || '',
			type: jobEntry.type,
			parallel: jobEntry.parallel ? 'Y' : 'N',
			draw: jobEntry.drawStep ? 'Y' : 'N',
			nr: 0, // Entry number
			xloc: jobEntry.guiCoordinates!.x,
			yloc: jobEntry.guiCoordinates!.y,
		};

		// Add configuration fields directly to the entry
		Object.entries(jobEntry.configuration).forEach(([key, value]) => {
			newEntry[key] = value;
		});

		// Add the new entry to the job data
		if (!jobData.job.entries) {
			jobData.job.entries = { entry: [] };
		}

		if (!jobData.job.entries.entry) {
			jobData.job.entries.entry = [];
		}

		if (!Array.isArray(jobData.job.entries.entry)) {
			jobData.job.entries.entry = [jobData.job.entries.entry];
		}

		jobData.job.entries.entry.push(newEntry);

		// Read original content for diff
		const originalContent = await parseKettleXml(filePath);
		const originalXml = buildKettleXml(originalContent);

		// Build new XML
		const newXml = buildKettleXml(jobData);

		// Create backup and write atomically
		await createBackup(filePath);
		await atomicWrite(filePath, newXml);

		// Generate diff
		const diff = generateDiff(originalXml, newXml, filePath);

		return {
			success: true,
			diff,
		};
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : String(error),
		};
	}
}

/**
 * Add a hop (connection) between two job entries
 */
export async function addJobHop(
	filePath: string,
	fromEntry: string,
	toEntry: string,
	options?: {
		enabled?: boolean;
		evaluation?: boolean;
		unconditional?: boolean;
	}
): Promise<{ success: boolean; diff?: string; error?: string; }> {
	try {
		// Ensure the file is a valid job file
		await ensureKettleFile(filePath, 'job');

		// Validate the hop structure
		const hop = validateJobHop({
			from: fromEntry,
			to: toEntry,
			enabled: options?.enabled ?? true,
			evaluation: options?.evaluation ?? true,
			unconditional: options?.unconditional ?? false,
		});

		// Parse the job file
		const jobData = await parseKettleXml(filePath);

		// Ensure job structure exists
		if (!jobData.job) {
			return { success: false, error: 'Invalid job file structure' };
		}

		// Verify both entries exist
		const entries = Array.isArray(jobData.job.entries?.entry)
			? jobData.job.entries.entry
			: jobData.job.entries?.entry
				? [jobData.job.entries.entry]
				: [];

		const fromExists = entries.some((e: any) => e.name === fromEntry);
		const toExists = entries.some((e: any) => e.name === toEntry);

		if (!fromExists) {
			throw new Error(`Source entry "${fromEntry}" does not exist`);
		}
		if (!toExists) {
			throw new Error(`Target entry "${toEntry}" does not exist`);
		}

		// Check if hop already exists
		const hops = Array.isArray(jobData.job.hops?.hop)
			? jobData.job.hops.hop
			: jobData.job.hops?.hop
				? [jobData.job.hops.hop]
				: [];

		if (hops.some((h: any) => h.from === fromEntry && h.to === toEntry)) {
			throw new Error(`Hop from "${fromEntry}" to "${toEntry}" already exists`);
		}

		// Create the new hop XML structure
		const newHop = {
			from: hop.from,
			to: hop.to,
			enabled: hop.enabled ? 'Y' : 'N',
			evaluation: hop.evaluation ? 'Y' : 'N',
			unconditional: hop.unconditional ? 'Y' : 'N',
		};

		// Add the new hop to the job data
		if (!jobData.job.hops) {
			jobData.job.hops = { hop: [] };
		}

		if (!jobData.job.hops.hop) {
			jobData.job.hops.hop = [];
		}

		if (!Array.isArray(jobData.job.hops.hop)) {
			jobData.job.hops.hop = [jobData.job.hops.hop];
		}

		jobData.job.hops.hop.push(newHop);

		// Read original content for diff
		const originalContent = await parseKettleXml(filePath);
		const originalXml = buildKettleXml(originalContent);

		// Build new XML
		const newXml = buildKettleXml(jobData);

		// Create backup and write atomically
		await createBackup(filePath);
		await atomicWrite(filePath, newXml);

		// Generate diff
		const diff = generateDiff(originalXml, newXml, filePath);

		return {
			success: true,
			diff,
		};
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : String(error),
		};
	}
}
