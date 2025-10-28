import { validateJobEntryConfiguration } from '../kettle/schemas/jobs/entryTypes/index.js';
import { buildKettleXml, ensureKettleFile, parseKettleXml } from '../kettle/xml-utils.js';
import { atomicWrite, createBackup, generateDiff } from '../utils/file-utils.js';

/**
 * Update an existing job entry in a Kettle job file
 */
export async function updateJobEntry(
	filePath: string,
	entryName: string,
	updates: {
		configuration?: Record<string, any>;
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

		// Find the entry to update
		const entries = Array.isArray(jobData.job.entries?.entry)
			? jobData.job.entries.entry
			: jobData.job.entries?.entry
				? [jobData.job.entries.entry]
				: [];

		const entryIndex = entries.findIndex((e: any) => e.name === entryName);

		if (entryIndex === -1) {
			throw new Error(`Job entry "${entryName}" not found`);
		}

		const entry = entries[entryIndex];

		// Validate configuration if provided
		if (updates.configuration) {
			validateJobEntryConfiguration(entry.type, updates.configuration);

			// Merge configuration updates directly into the entry
			Object.entries(updates.configuration).forEach(([key, value]) => {
				entry[key] = value;
			});
		}

		// Update description if provided
		if (updates.description !== undefined) {
			entry.description = updates.description;
		}

		// Update GUI coordinates if provided
		if (updates.guiX !== undefined) {
			entry.xloc = updates.guiX;
		}
		if (updates.guiY !== undefined) {
			entry.yloc = updates.guiY;
		}

		// Update drawStep if provided
		if (updates.drawStep !== undefined) {
			entry.draw = updates.drawStep ? 'Y' : 'N';
		}

		// Update parallel if provided
		if (updates.parallel !== undefined) {
			entry.parallel = updates.parallel ? 'Y' : 'N';
		}

		// Update the entry in the job data
		if (Array.isArray(jobData.job.entries.entry)) {
			jobData.job.entries.entry[entryIndex] = entry;
		} else {
			jobData.job.entries.entry = entry;
		}

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
