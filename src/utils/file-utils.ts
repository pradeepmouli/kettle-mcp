import { createPatch } from 'diff';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Create a backup of a file before modifying it
 */
export async function createBackup(filePath: string): Promise<string> {
	const backupPath = `${filePath}.backup`;
	await fs.copyFile(filePath, backupPath);
	return backupPath;
}

/**
 * Atomic file write operation with backup
 * Returns the backup file path if created
 */
export async function atomicWrite(
	filePath: string,
	content: string
): Promise<{ success: boolean; backupPath?: string; }> {
	let backupPath: string | undefined;

	try {
		// Check if file exists
		const fileExists = await fs
			.access(filePath)
			.then(() => true)
			.catch(() => false);

		// Create backup if file exists
		if (fileExists) {
			backupPath = await createBackup(filePath);
		}

		// Write to temporary file first
		const tempPath = `${filePath}.tmp`;
		await fs.writeFile(tempPath, content, 'utf-8');

		// Atomic rename (or as close as possible on the platform)
		await fs.rename(tempPath, filePath);

		return { success: true, backupPath };
	} catch (error) {
		// Restore from backup if write failed and backup exists
		if (backupPath) {
			try {
				await fs.copyFile(backupPath, filePath);
			} catch (restoreError) {
				console.error('Failed to restore from backup:', restoreError);
			}
		}
		throw error;
	}
}

/**
 * Generate unified diff preview between original and new content
 */
export function generateDiff(
	originalContent: string,
	newContent: string,
	filePath: string
): string {
	return createPatch(
		path.basename(filePath),
		originalContent,
		newContent,
		'Original',
		'Modified'
	);
}

/**
 * Read file with error handling
 */
export async function safeReadFile(filePath: string): Promise<string> {
	try {
		return await fs.readFile(filePath, 'utf-8');
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
			throw new Error(`File not found: ${filePath}`);
		}
		throw error;
	}
}

/**
 * Ensure directory exists for a file path
 */
export async function ensureDirectoryExists(filePath: string): Promise<void> {
	const dir = path.dirname(filePath);
	await fs.mkdir(dir, { recursive: true });
}

/**
 * Clean up backup files
 */
export async function cleanupBackup(backupPath: string): Promise<void> {
	try {
		await fs.unlink(backupPath);
	} catch (error) {
		// Ignore errors if backup doesn't exist
	}
}
