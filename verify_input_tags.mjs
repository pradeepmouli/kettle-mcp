import { INPUT_STEPS } from './dist/kettle/schemas/transformations/stepTypes/input.js';
import { isValidTag } from './dist/utils/tag-taxonomy.js';

let invalidFound = false;
let invalidTags = new Set();
for (const [name, step] of Object.entries(INPUT_STEPS)) {
  for (const tag of step.tags) {
    if (!isValidTag(tag)) {
      invalidTags.add(tag);
      invalidFound = true;
    }
  }
}
if (invalidFound) {
  console.log('Invalid tags found in INPUT_STEPS:', Array.from(invalidTags).join(', '));
} else {
  console.log('All input tags are valid!');
}
