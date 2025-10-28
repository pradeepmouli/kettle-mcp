/**
 * @deprecated This file is deprecated. Use the modular imports instead:
 * 
 * import { JobEntryCategory, JobEntryType } from './jobs/entryTypes/types.js';
 * import { GENERAL_JOB_ENTRIES } from './jobs/entryTypes/general.js';
 * 
 * Or use the barrel export:
 * import { JOB_ENTRY_TYPE_REGISTRY, listJobEntryTypes, getJobEntryTypeSchema } from './jobs/entryTypes/index.js';
 * 
 * This re-export is provided for backward compatibility and will be removed in a future version.
 */

export * from './jobs/entryTypes/index.js';
