import { buildKettleXml, ensureKettleFile, parseKettleXml } from '../kettle/xml-utils.js';
import { atomicWrite, createBackup, generateDiff } from '../utils/file-utils.js';

/**
 * Remove a job entry from a Kettle job file
 * Also removes all hops connected to this entry
 */
export async function removeJobEntry(
	filePath: string,
	entryName: string
): Promise<{ success: boolean; diff?: string; error?: string; removedHops?: number; }> {
	try {
		// Ensure the file is a valid job file
		await ensureKettleFile(filePath, 'job');

		// Parse the job file
		const jobData = await parseKettleXml(filePath);

		// Ensure job structure exists
		if (!jobData.job) {
			return { success: false, error: 'Invalid job file structure' };
		}

		// Find and remove the entry
		const entries = Array.isArray(jobData.job.entries?.entry)
			? jobData.job.entries.entry
			: jobData.job.entries?.entry
				? [jobData.job.entries.entry]
				: [];

		const entryIndex = entries.findIndex((e: any) => e.name === entryName);

		if (entryIndex === -1) {
			throw new Error(`Job entry "${entryName}" not found`);
		}

		// Remove the entry
		entries.splice(entryIndex, 1);

		// Update the entries in the job data
		if (entries.length === 0) {
			jobData.job.entries.entry = [];
		} else if (entries.length === 1) {
			jobData.job.entries.entry = entries[0];
		} else {
			jobData.job.entries.entry = entries;
		}

		// Remove all hops connected to this entry
		let removedHops = 0;
		if (jobData.job.hops?.hop) {
			const hops = Array.isArray(jobData.job.hops.hop) ? jobData.job.hops.hop : [jobData.job.hops.hop];

			const filteredHops = hops.filter((h: any) => {
				if (h.from === entryName || h.to === entryName) {
					removedHops++;
					return false;
				}
				return true;
			});

			if (filteredHops.length === 0) {
				jobData.job.hops.hop = [];
			} else if (filteredHops.length === 1) {
				jobData.job.hops.hop = filteredHops[0];
			} else {
				jobData.job.hops.hop = filteredHops;
			}
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
			removedHops,
		};
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : String(error),
		};
	}
}

/**
 * Remove a specific hop between two job entries
 */
export async function removeJobHop(
	filePath: string,
	fromEntry: string,
	toEntry: string
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

		// Find and remove the hop
		if (!jobData.job.hops?.hop) {
			throw new Error('No hops found in the job file');
		}

		const hops = Array.isArray(jobData.job.hops.hop) ? jobData.job.hops.hop : [jobData.job.hops.hop];

		const hopIndex = hops.findIndex((h: any) => h.from === fromEntry && h.to === toEntry);

		if (hopIndex === -1) {
			throw new Error(`Hop from "${fromEntry}" to "${toEntry}" not found`);
		}

		// Remove the hop
		hops.splice(hopIndex, 1);

		// Update the hops in the job data
		if (hops.length === 0) {
			jobData.job.hops.hop = [];
		} else if (hops.length === 1) {
			jobData.job.hops.hop = hops[0];
		} else {
			jobData.job.hops.hop = hops;
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
