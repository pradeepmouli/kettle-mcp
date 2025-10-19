/**
 * Validation utilities for Kettle artifacts
 *
 * Provides structural validation for transformations and jobs.
 */

import type {
	Job,
	JobEntry,
	JobHop,
	Transformation,
	TransformationHop,
	TransformationStep,
	ValidationIssue,
	ValidationResult,
} from '../schemas/index.js';

// ============================================================================
// Validation Entry Points
// ============================================================================

/**
 * Validate a transformation
 */
export function validateTransformation(transformation: Transformation): ValidationResult {
	const issues: ValidationIssue[] = [];

	// Extract steps and hops
	const steps = Array.isArray(transformation.steps) ? transformation.steps : [];
	const hops = Array.isArray(transformation.order) ? transformation.order : [];

	// Validate steps
	issues.push(...validateSteps(steps));

	// Validate hops and connectivity
	issues.push(...validateTransformationHops(hops, steps));

	// Validate graph connectivity
	issues.push(...validateTransformationGraph(steps, hops));

	return summarizeValidation(issues);
}

/**
 * Validate a job
 */
export function validateJob(job: Job): ValidationResult {
	const issues: ValidationIssue[] = [];

	// Extract entries and hops
	const entries = Array.isArray(job.entries) ? job.entries : [];
	const hops = Array.isArray(job.hops) ? job.hops : [];

	// Validate entries
	issues.push(...validateEntries(entries));

	// Validate hops and connectivity
	issues.push(...validateJobHops(hops, entries));

	// Validate graph connectivity
	issues.push(...validateJobGraph(entries, hops));

	return summarizeValidation(issues);
}

// ============================================================================
// Step Validation
// ============================================================================

function validateSteps(steps: TransformationStep[]): ValidationIssue[] {
	const issues: ValidationIssue[] = [];
	const stepNames = new Set<string>();

	for (const step of steps) {
		// Check for duplicate names
		if (stepNames.has(step.name)) {
			issues.push({
				severity: 'error',
				code: 'DUPLICATE_STEP',
				message: `Duplicate step name: ${step.name}`,
				element: step.name,
				suggestion: 'Rename one of the steps to ensure unique names',
			});
		}
		stepNames.add(step.name);

		// Check for missing required fields
		if (!step.name) {
			issues.push({
				severity: 'error',
				code: 'MISSING_STEP_NAME',
				message: 'Step is missing a name',
				suggestion: 'Add a name to the step',
			});
		}

		if (!step.type) {
			issues.push({
				severity: 'error',
				code: 'MISSING_STEP_TYPE',
				message: `Step ${step.name} is missing a type`,
				element: step.name,
				suggestion: 'Specify a step type (e.g., RowGenerator, SelectValues)',
			});
		}
	}

	return issues;
}

// ============================================================================
// Entry Validation
// ============================================================================

function validateEntries(entries: JobEntry[]): ValidationIssue[] {
	const issues: ValidationIssue[] = [];
	const entryNames = new Set<string>();
	let hasStart = false;

	for (const entry of entries) {
		// Check for duplicate names
		if (entryNames.has(entry.name)) {
			issues.push({
				severity: 'error',
				code: 'DUPLICATE_ENTRY',
				message: `Duplicate entry name: ${entry.name}`,
				element: entry.name,
				suggestion: 'Rename one of the entries to ensure unique names',
			});
		}
		entryNames.add(entry.name);

		// Check for START entry
		if (entry.start === 'Y' || entry.type === 'SPECIAL') {
			hasStart = true;
		}

		// Check for missing required fields
		if (!entry.name) {
			issues.push({
				severity: 'error',
				code: 'MISSING_ENTRY_NAME',
				message: 'Entry is missing a name',
				suggestion: 'Add a name to the entry',
			});
		}

		if (!entry.type) {
			issues.push({
				severity: 'error',
				code: 'MISSING_ENTRY_TYPE',
				message: `Entry ${entry.name} is missing a type`,
				element: entry.name,
				suggestion: 'Specify an entry type (e.g., SPECIAL, WRITE_TO_LOG, SUCCESS)',
			});
		}
	}

	// Check for missing START entry
	if (!hasStart && entries.length > 0) {
		issues.push({
			severity: 'warning',
			code: 'MISSING_START',
			message: 'Job is missing a START entry',
			suggestion: 'Add a SPECIAL entry with start=Y',
		});
	}

	return issues;
}

// ============================================================================
// Hop Validation
// ============================================================================

function validateTransformationHops(
	hops: TransformationHop[],
	steps: TransformationStep[]
): ValidationIssue[] {
	const issues: ValidationIssue[] = [];
	const stepNames = new Set(steps.map((s) => s.name));

	for (const hop of hops) {
		// Check if source step exists
		if (!stepNames.has(hop.from)) {
			issues.push({
				severity: 'error',
				code: 'UNRESOLVED_HOP_SOURCE',
				message: `Hop references non-existent source step: ${hop.from}`,
				element: hop.from,
				suggestion: `Check that step ${hop.from} exists or remove the hop`,
			});
		}

		// Check if target step exists
		if (!stepNames.has(hop.to)) {
			issues.push({
				severity: 'error',
				code: 'UNRESOLVED_HOP_TARGET',
				message: `Hop references non-existent target step: ${hop.to}`,
				element: hop.to,
				suggestion: `Check that step ${hop.to} exists or remove the hop`,
			});
		}
	}

	return issues;
}

function validateJobHops(hops: JobHop[], entries: JobEntry[]): ValidationIssue[] {
	const issues: ValidationIssue[] = [];
	const entryNames = new Set(entries.map((e) => e.name));

	for (const hop of hops) {
		// Check if source entry exists
		if (!entryNames.has(hop.from)) {
			issues.push({
				severity: 'error',
				code: 'UNRESOLVED_HOP_SOURCE',
				message: `Hop references non-existent source entry: ${hop.from}`,
				element: hop.from,
				suggestion: `Check that entry ${hop.from} exists or remove the hop`,
			});
		}

		// Check if target entry exists
		if (!entryNames.has(hop.to)) {
			issues.push({
				severity: 'error',
				code: 'UNRESOLVED_HOP_TARGET',
				message: `Hop references non-existent target entry: ${hop.to}`,
				element: hop.to,
				suggestion: `Check that entry ${hop.to} exists or remove the hop`,
			});
		}
	}

	return issues;
}

// ============================================================================
// Graph Validation
// ============================================================================

function validateTransformationGraph(
	steps: TransformationStep[],
	hops: TransformationHop[]
): ValidationIssue[] {
	const issues: ValidationIssue[] = [];

	// Build adjacency map
	const outgoing = new Map<string, string[]>();
	const incoming = new Map<string, string[]>();

	for (const hop of hops) {
		if (!outgoing.has(hop.from)) outgoing.set(hop.from, []);
		if (!incoming.has(hop.to)) incoming.set(hop.to, []);
		outgoing.get(hop.from)!.push(hop.to);
		incoming.get(hop.to)!.push(hop.from);
	}

	// Check for orphan steps (no incoming or outgoing hops)
	for (const step of steps) {
		const hasIncoming = incoming.has(step.name);
		const hasOutgoing = outgoing.has(step.name);

		if (!hasIncoming && !hasOutgoing && steps.length > 1) {
			issues.push({
				severity: 'warning',
				code: 'ORPHAN_STEP',
				message: `Step ${step.name} has no connections (orphan)`,
				element: step.name,
				suggestion: 'Connect the step to other steps or remove it',
			});
		}
	}

	return issues;
}

function validateJobGraph(entries: JobEntry[], hops: JobHop[]): ValidationIssue[] {
	const issues: ValidationIssue[] = [];

	// Build adjacency map
	const outgoing = new Map<string, string[]>();
	const incoming = new Map<string, string[]>();

	for (const hop of hops) {
		if (!outgoing.has(hop.from)) outgoing.set(hop.from, []);
		if (!incoming.has(hop.to)) incoming.set(hop.to, []);
		outgoing.get(hop.from)!.push(hop.to);
		incoming.get(hop.to)!.push(hop.from);
	}

	// Check for orphan entries (no incoming or outgoing hops, except START)
	for (const entry of entries) {
		const isStart = entry.start === 'Y' || entry.type === 'SPECIAL';
		const hasIncoming = incoming.has(entry.name);
		const hasOutgoing = outgoing.has(entry.name);

		if (!hasIncoming && !hasOutgoing && !isStart && entries.length > 1) {
			issues.push({
				severity: 'warning',
				code: 'ORPHAN_ENTRY',
				message: `Entry ${entry.name} has no connections (orphan)`,
				element: entry.name,
				suggestion: 'Connect the entry to other entries or remove it',
			});
		}
	}

	return issues;
}

// ============================================================================
// Summary
// ============================================================================

function summarizeValidation(issues: ValidationIssue[]): ValidationResult {
	const summary = {
		errors: issues.filter((i) => i.severity === 'error').length,
		warnings: issues.filter((i) => i.severity === 'warning').length,
		info: issues.filter((i) => i.severity === 'info').length,
	};

	return {
		valid: summary.errors === 0,
		issues,
		summary,
	};
}
