import fs from 'fs';
import { join } from 'path';
import { beforeAll, describe, expect, it } from 'vitest';
import { saveTransformation } from '../../handlers/edit-handlers';
import {
  getTransformation,
  validateTransformationFile,
} from '../../handlers/transformation-handlers';

const SAMPLES_DIR = join(__dirname, '../../../examples/sample_kettle_files');
const SRC_TRANS = join(SAMPLES_DIR, 'sample_transformation.ktr');
const TEMP_TRANS = '/tmp/e2e_transformation_edit_flow.ktr';

function ensureTempCopy() {
  fs.copyFileSync(SRC_TRANS, TEMP_TRANS);
}

describe('E2E: transformation read → validate → edit → validate', () => {
  beforeAll(() => {
    ensureTempCopy();
  });

  it('reads and validates, edits with backup+diff, and re-validates', async () => {
    // Read
    const read1 = await getTransformation({ path: TEMP_TRANS });
    expect(read1.transformation).toBeDefined();
    expect(read1.path).toBe(TEMP_TRANS);
    expect(read1.size).toBeGreaterThan(0);

    // Validate
    const v1 = await validateTransformationFile({ path: TEMP_TRANS });
    expect(v1.result.valid).toBe(true);

    // Edit: update description
    const updated = {
      ...read1.transformation,
      info: {
        ...read1.transformation.info,
        description: 'E2E updated description',
      },
    } as typeof read1.transformation;

    const saved = await saveTransformation({
      path: TEMP_TRANS,
      transformation: updated,
      createBackup: true,
    });
    expect(saved.success).toBe(true);
    expect(saved.backupPath).toBeDefined();
    expect(saved.backupPath!).toMatch(/\.backup\.\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z\.ktr$/);
    // Diff should show added description line
    if (saved.diff) {
      expect(saved.diff).toMatch(/^\+.*<description>E2E updated description<\/description>/m);
    }

    // Re-validate
    const v2 = await validateTransformationFile({ path: TEMP_TRANS });
    expect(v2.result.valid).toBe(true);
  });
});
