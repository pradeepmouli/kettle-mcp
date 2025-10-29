import { OUTPUT_STEPS } from './dist/kettle/schemas/transformations/stepTypes/output.js';
import { isValidTag } from './dist/utils/tag-taxonomy.js';

let invalidFound = false;
for (const [name, step] of Object.entries(OUTPUT_STEPS)) {
  for (const tag of step.tags) {
    if (!isValidTag(tag)) {
      console.log('Invalid tag:', tag, 'in step:', name);
      invalidFound = true;
    }
  }
}
if (!invalidFound) {
  console.log('All tags are valid!');
}
