/**
 * @deprecated This file is deprecated. Use the modular imports instead:
 * 
 * import { StepCategory, StepType } from './transformations/stepTypes/types.js';
 * import { INPUT_STEPS } from './transformations/stepTypes/input.js';
 * import { OUTPUT_STEPS } from './transformations/stepTypes/output.js';
 * import { TRANSFORM_STEPS } from './transformations/stepTypes/transform.js';
 * 
 * Or use the barrel export:
 * import { STEP_TYPE_REGISTRY, listStepTypes, getStepTypeSchema } from './transformations/stepTypes/index.js';
 * 
 * This re-export is provided for backward compatibility and will be removed in a future version.
 */

export * from './transformations/stepTypes/index.js';
