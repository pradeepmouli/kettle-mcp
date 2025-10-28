import { describe, expect, it } from 'vitest';
import { listJobEntryTypes } from '../../src/kettle/schemas/jobs/entryTypes/index.js';
import { ALL_TAGS } from '../../src/kettle/schemas/tag-taxonomy.js';
import { listStepTypes } from '../../src/kettle/schemas/transformations/stepTypes/index.js';

/**
 * Code review tests - verify standardization and best practices
 */
describe('Code Review - Standards Compliance', () => {
	describe('Tag Taxonomy Compliance', () => {
		it('should use only standardized tags from taxonomy for step types', () => {
			const stepTypes = listStepTypes();
			const validTags = Object.values(ALL_TAGS) as string[];

			stepTypes.forEach((stepType) => {
				stepType.tags.forEach((tag) => {
					expect(
						validTags.includes(tag),
						`Step type "${stepType.typeId}" uses non-standard tag "${tag}". ` +
						`Valid tags: ${validTags.join(', ')}`
					).toBe(true);
				});
			});
		});

		it('should use only standardized tags from taxonomy for job entry types', () => {
			const entryTypes = listJobEntryTypes();
			const validTags = Object.values(ALL_TAGS) as string[];

			entryTypes.forEach((entryType) => {
				entryType.tags.forEach((tag) => {
					expect(
						validTags.includes(tag),
						`Job entry type "${entryType.typeId}" uses non-standard tag "${tag}". ` +
						`Valid tags: ${validTags.join(', ')}`
					).toBe(true);
				});
			});
		});

		it('should use lowercase tags consistently', () => {
			const stepTypes = listStepTypes();
			const entryTypes = listJobEntryTypes();

			[...stepTypes, ...entryTypes].forEach((type: any) => {
				type.tags.forEach((tag: string) => {
					expect(tag).toBe(tag.toLowerCase());
				});
			});
		});
	});

	describe('LLM-Friendly Descriptions', () => {
		it('should have meaningful descriptions for all step types (>50 chars)', () => {
			const stepTypes = listStepTypes();

			stepTypes.forEach((stepType) => {
				expect(
					stepType.description.length,
					`Step type "${stepType.typeId}" has too short description (${stepType.description.length} chars)`
				).toBeGreaterThan(50);
			});
		});

		it('should have meaningful descriptions for all job entry types (>50 chars)', () => {
			const entryTypes = listJobEntryTypes();

			entryTypes.forEach((entryType) => {
				expect(
					entryType.description.length,
					`Job entry type "${entryType.typeId}" has too short description (${entryType.description.length} chars)`
				).toBeGreaterThan(50);
			});
		});

		it('should have clear display names (2+ words or camelCase)', () => {
			const stepTypes = listStepTypes();
			const entryTypes = listJobEntryTypes();

			[...stepTypes, ...entryTypes].forEach((type: any) => {
				const hasSpaces = type.displayName.includes(' ');
				const isCamelCase = /[a-z][A-Z]/.test(type.displayName);

				expect(
					hasSpaces || isCamelCase || type.displayName.length < 15,
					`Type "${type.typeId}" has unclear display name: "${type.displayName}"`
				).toBe(true);
			});
		});

		it('should use action-oriented language in descriptions', () => {
			const stepTypes = listStepTypes();
			const entryTypes = listJobEntryTypes();

			// Common action verbs that should appear in descriptions
			const actionVerbs = [
				'read', 'write', 'execute', 'select', 'filter', 'transform',
				'sort', 'calculate', 'parse', 'extract', 'load', 'process',
				'call', 'fetch', 'create', 'update', 'delete', 'handle',
				'define', 'mark', 'establish', 'enable', 'allow', 'support'
			];

			[...stepTypes, ...entryTypes].forEach((type: any) => {
				const descLower = type.description.toLowerCase();
				const hasActionVerb = actionVerbs.some((verb) => descLower.includes(verb));

				expect(
					hasActionVerb,
					`Type "${type.typeId}" description should use action-oriented language. Description: "${type.description}"`
				).toBe(true);
			});
		});

		it('should have at least 3 tags per step type for discoverability', () => {
			const stepTypes = listStepTypes();

			stepTypes.forEach((stepType) => {
				expect(
					stepType.tags.length,
					`Step type "${stepType.typeId}" has insufficient tags (${stepType.tags.length}). Minimum: 3`
				).toBeGreaterThanOrEqual(3);
			});
		});

		it('should have at least 3 tags per job entry type for discoverability', () => {
			const entryTypes = listJobEntryTypes();

			entryTypes.forEach((entryType) => {
				expect(
					entryType.tags.length,
					`Job entry type "${entryType.typeId}" has insufficient tags (${entryType.tags.length}). Minimum: 3`
				).toBeGreaterThanOrEqual(3);
			});
		});
	});
});
