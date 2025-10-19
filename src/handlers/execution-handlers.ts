// Execution Handlers for Kettle MCP
// Implements: executeTransformation, startTransformation, stopTransformation, executeJob, startJob, stopJob
// Includes: environment variable guards, confirmation prompts, timeouts, and path constraints

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

// Utility: Check if execution is allowed by environment variable
function isExecutionAllowed(): boolean {
	return process.env.KETTLE_MCP_ALLOW_EXECUTION === '1';
}

// Utility: Path constraint (only allow execution in allowed directory)
function isPathAllowed(targetPath: string): boolean {
	const allowedRoot = process.env.KETTLE_MCP_EXEC_ROOT || process.cwd();
	return path.resolve(targetPath).startsWith(path.resolve(allowedRoot));
}

// Utility: Confirmation prompt (stub for now, replace with real prompt in CLI/server)
async function confirmExecution(action: string, target: string): Promise<boolean> {
	// In production, replace with real prompt or API confirmation
	if (process.env.KETTLE_MCP_AUTO_CONFIRM === '1') return true;
	throw new Error(`Confirmation required for ${action} on ${target}`);
}

// Utility: Timeout wrapper
async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
	return new Promise<T>((resolve, reject) => {
		const timer = setTimeout(() => reject(new Error('Execution timed out')), ms);
		promise.then(
			(val) => {
				clearTimeout(timer);
				resolve(val);
			},
			(err) => {
				clearTimeout(timer);
				reject(err);
			}
		);
	});
}

// Handler: Execute Transformation
export async function executeTransformation({ path: transformationPath, timeoutMs = 60000 }: { path: string; timeoutMs?: number; }) {
	if (!isExecutionAllowed()) throw new Error('Execution is not allowed by environment variable.');
	if (!isPathAllowed(transformationPath)) throw new Error('Path is not allowed for execution.');
	if (!existsSync(transformationPath)) throw new Error('Transformation file does not exist.');
	await confirmExecution('executeTransformation', transformationPath);

	// Example: spawn kitchen.sh or pan.sh (stubbed)
	const proc = spawn('echo', ['Executing transformation', transformationPath]);
	return await withTimeout(
		new Promise((resolve, reject) => {
			let output = '';
			proc.stdout.on('data', (data) => (output += data.toString()));
			proc.stderr.on('data', (data) => (output += data.toString()));
			proc.on('close', (code) => {
				if (code === 0) resolve({ success: true, output });
				else reject(new Error(`Execution failed: ${output}`));
			});
		}),
		timeoutMs
	);
}

// Handler: Start Transformation (stub)
export async function startTransformation(args: { path: string; timeoutMs?: number; }) {
	// Could implement as background process
	return executeTransformation(args);
}

// Handler: Stop Transformation (stub)
export async function stopTransformation(args: { path: string; }) {
	// Would require process tracking (not implemented)
	void args;
	throw new Error('Stop transformation not implemented.');
}

// Handler: Execute Job
export async function executeJob({ path: jobPath, timeoutMs = 60000 }: { path: string; timeoutMs?: number; }) {
	if (!isExecutionAllowed()) throw new Error('Execution is not allowed by environment variable.');
	if (!isPathAllowed(jobPath)) throw new Error('Path is not allowed for execution.');
	if (!existsSync(jobPath)) throw new Error('Job file does not exist.');
	await confirmExecution('executeJob', jobPath);

	// Example: spawn kitchen.sh or pan.sh (stubbed)
	const proc = spawn('echo', ['Executing job', jobPath]);
	return await withTimeout(
		new Promise((resolve, reject) => {
			let output = '';
			proc.stdout.on('data', (data) => (output += data.toString()));
			proc.stderr.on('data', (data) => (output += data.toString()));
			proc.on('close', (code) => {
				if (code === 0) resolve({ success: true, output });
				else reject(new Error(`Execution failed: ${output}`));
			});
		}),
		timeoutMs
	);
}

// Handler: Start Job (stub)
export async function startJob(args: { path: string; timeoutMs?: number; }) {
	// Could implement as background process
	return executeJob(args);
}

// Handler: Stop Job (stub)
export async function stopJob(args: { path: string; }) {
	// Would require process tracking (not implemented)
	void args;
	throw new Error('Stop job not implemented.');
}
