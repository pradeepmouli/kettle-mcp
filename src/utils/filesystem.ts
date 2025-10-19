/**
 * Filesystem utilities for Kettle artifacts
 *
 * Provides safe read/write operations with backups and atomic writes.
 */

import { diffLines } from 'diff';
import { promises as fs } from 'fs';
import { basename, dirname, extname, join } from 'path';

// ============================================================================
// File Operations
// ============================================================================

/**
 * Read a file and return its contents
 */
export async function readFile(path: string): Promise<string> {
	try {
		return await fs.readFile(path, 'utf-8');
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
			throw new Error(`File not found: ${path}`);
		}
		throw error;
	}
}

/**
 * Write content to a file with optional backup
 */
export async function writeFile(
	path: string,
	content: string,
	options?: { backup?: boolean; }
): Promise<{ path: string; backupPath?: string; }> {
	const { backup = true } = options || {};

	let backupPath: string | undefined;

	// Create backup if file exists and backup is enabled
	if (backup) {
		try {
			await fs.access(path);
			backupPath = await createBackup(path);
		} catch (error) {
			// File doesn't exist, no backup needed
			if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
				throw error;
			}
		}
	}

	// Ensure directory exists
	await fs.mkdir(dirname(path), { recursive: true });

	// Write atomically using temp file + rename
	const tempPath = `${path}.tmp.${Date.now()}`;
	try {
		await fs.writeFile(tempPath, content, 'utf-8');
		await fs.rename(tempPath, path);
	} catch (error) {
		// Clean up temp file on error
		try {
			await fs.unlink(tempPath);
		} catch {
			// Ignore cleanup errors
		}
		throw error;
	}

	return { path, backupPath };
}

/**
 * Create a backup of a file
 */
export async function createBackup(path: string): Promise<string> {
	const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
	const ext = extname(path);
	const base = basename(path, ext);
	const dir = dirname(path);
	const backupPath = join(dir, `${base}.backup.${timestamp}${ext}`);

	await fs.copyFile(path, backupPath);
	return backupPath;
}

/**
 * Check if a file exists
 */
export async function fileExists(path: string): Promise<boolean> {
	try {
		await fs.access(path);
		return true;
	} catch {
		return false;
	}
}

/**
 * Get file stats
 */
export async function getFileStats(path: string): Promise<{
	size: number;
	mtime: Date;
	isFile: boolean;
	isDirectory: boolean;
}> {
	const stats = await fs.stat(path);
	return {
		size: stats.size,
		mtime: stats.mtime,
		isFile: stats.isFile(),
		isDirectory: stats.isDirectory(),
	};
}

// ============================================================================
// Diff Operations
// ============================================================================

/**
 * Create a unified diff between old and new content
 */
export function createUnifiedDiff(
	oldContent: string,
	newContent: string,
	_options?: { filename?: string; context?: number; }
): string {
	const parts = diffLines(oldContent, newContent);

	return parts
		.map((part: { added?: boolean; removed?: boolean; value: string; }) => {
			if (part.added) {
				return `+ ${part.value}`;
			} else if (part.removed) {
				return `- ${part.value}`;
			} else {
				return `  ${part.value}`;
			}
		})
		.join('\n');
}

// ============================================================================
// Directory Operations
// ============================================================================

/**
 * Find all Kettle artifacts (.ktr, .kjb) in a directory
 */
export async function findKettleArtifacts(
	directory: string,
	options?: { recursive?: boolean; type?: 'transformation' | 'job' | 'all'; }
): Promise<string[]> {
	const { recursive = true, type = 'all' } = options || {};
	const results: string[] = [];

	async function scan(dir: string): Promise<void> {
		const entries = await fs.readdir(dir, { withFileTypes: true });

		for (const entry of entries) {
			const fullPath = join(dir, entry.name);

			if (entry.isDirectory() && recursive) {
				await scan(fullPath);
			} else if (entry.isFile()) {
				const ext = extname(entry.name);
				if (
					(type === 'all' && (ext === '.ktr' || ext === '.kjb')) ||
					(type === 'transformation' && ext === '.ktr') ||
					(type === 'job' && ext === '.kjb')
				) {
					results.push(fullPath);
				}
			}
		}
	}

	await scan(directory);
	return results;
}

/**
 * Ensure a directory exists
 */
export async function ensureDirectory(path: string): Promise<void> {
	await fs.mkdir(path, { recursive: true });
}

// ============================================================================
// Path Utilities
// ============================================================================

/**
 * Normalize a path (resolve, absolute)
 */
export function normalizePath(path: string): string {
	// TODO: Add workspace root resolution if needed
	return path;
}

/**
 * Check if a path is within the workspace (security check)
 */
export function isWithinWorkspace(path: string, workspace: string): boolean {
	const normalizedPath = normalizePath(path);
	const normalizedWorkspace = normalizePath(workspace);
	return normalizedPath.startsWith(normalizedWorkspace);
}
