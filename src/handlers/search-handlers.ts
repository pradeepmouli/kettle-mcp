/**
 * Tool handlers for search and listing operations
 */

import { extname } from 'path';
import type {
	ListArtifactsInput,
	ListArtifactsOutput,
	SearchArtifactsInput,
	SearchArtifactsOutput,
	SearchIndexEntry,
} from '../schemas/index.js';
import { findKettleArtifacts } from '../utils/filesystem.js';
import { getJob } from './job-handlers.js';
import { getTransformation } from './transformation-handlers.js';

// ============================================================================
// Search Artifacts
// ============================================================================

/**
 * Search for Kettle artifacts by name, step type, parameter, etc.
 */
export async function searchArtifacts(
	input: SearchArtifactsInput
): Promise<SearchArtifactsOutput> {
	const { query, type = 'all', directory = process.cwd(), maxResults = 100 } = input;

	// Find all artifacts
	const artifactType =
		type === 'all' ? 'all' : type === 'transformation' ? 'transformation' : 'job';
	const paths = await findKettleArtifacts(directory, {
		recursive: true,
		type: artifactType,
	});

	// Build index and filter by query
	const results: SearchIndexEntry[] = [];
	const lowerQuery = query.toLowerCase();

	for (const path of paths) {
		if (results.length >= maxResults) break;

		try {
			const entry = await buildSearchIndexEntry(path);

			// Check if entry matches query
			if (matchesQuery(entry, lowerQuery)) {
				results.push(entry);
			}
		} catch (error) {
			// Skip files that can't be parsed
			console.error(`Error indexing ${path}:`, error);
		}
	}

	return {
		results,
		total: results.length,
		query,
	};
}

// ============================================================================
// List Artifacts
// ============================================================================

/**
 * List all Kettle artifacts in a directory
 */
export async function listArtifacts(
	input: ListArtifactsInput
): Promise<ListArtifactsOutput> {
	const { type, directory = process.cwd(), detailed = false } = input;

	// Find all artifacts
	const artifactType =
		type === 'all' ? 'all' : type === 'transformation' ? 'transformation' : 'job';
	const paths = await findKettleArtifacts(directory, {
		recursive: true,
		type: artifactType,
	});

	// Build index entries
	const artifacts: SearchIndexEntry[] = [];

	for (const path of paths) {
		try {
			const entry = await buildSearchIndexEntry(path, { detailed });
			artifacts.push(entry);
		} catch (error) {
			// Skip files that can't be parsed
			console.error(`Error indexing ${path}:`, error);
		}
	}

	return {
		artifacts,
		total: artifacts.length,
	};
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Build a search index entry for a Kettle artifact
 */
async function buildSearchIndexEntry(
	path: string,
	options?: { detailed?: boolean; }
): Promise<SearchIndexEntry> {
	const { detailed = true } = options || {};
	const ext = extname(path);

	if (ext === '.ktr') {
		const { transformation } = await getTransformation({ path });

		const entry: SearchIndexEntry = {
			path,
			type: 'transformation',
			name: transformation.info.name,
			description: transformation.info.description,
			modified_date: transformation.info.modified_date,
		};

		if (detailed) {
			entry.steps = transformation.steps?.map((s) => s.name) || [];
			entry.stepTypes = [
				...new Set(transformation.steps?.map((s) => s.type) || []),
			];
			entry.parameters =
				transformation.info.parameters?.map((p) => p.name) || [];
		}

		return entry;
	} else {
		const { job } = await getJob({ path });

		const entry: SearchIndexEntry = {
			path,
			type: 'job',
			name: job.name,
			description: job.description,
			modified_date: job.modified_date,
		};

		if (detailed) {
			entry.entries = job.entries?.map((e) => e.name) || [];
			entry.entryTypes = [...new Set(job.entries?.map((e) => e.type) || [])];
			entry.parameters = job.parameters?.map((p) => p.name) || [];
		}

		return entry;
	}
}

/**
 * Check if a search index entry matches a query
 */
function matchesQuery(entry: SearchIndexEntry, lowerQuery: string): boolean {
	// Check name
	if (entry.name.toLowerCase().includes(lowerQuery)) {
		return true;
	}

	// Check description
	if (entry.description?.toLowerCase().includes(lowerQuery)) {
		return true;
	}

	// Check steps/entries
	if (entry.steps?.some((s) => s.toLowerCase().includes(lowerQuery))) {
		return true;
	}

	if (entry.entries?.some((e) => e.toLowerCase().includes(lowerQuery))) {
		return true;
	}

	// Check types
	if (entry.stepTypes?.some((t) => t.toLowerCase().includes(lowerQuery))) {
		return true;
	}

	if (entry.entryTypes?.some((t) => t.toLowerCase().includes(lowerQuery))) {
		return true;
	}

	// Check parameters
	if (entry.parameters?.some((p) => p.toLowerCase().includes(lowerQuery))) {
		return true;
	}

	return false;
}
