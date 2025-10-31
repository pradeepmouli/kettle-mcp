/**
 * Tests for transformation handlers
 */

import { join } from 'path';
import { describe, expect, it } from 'vitest';
import {
  getTransformation,
  getTransformationStatus,
  validateTransformationFile,
} from '../handlers/transformation-handlers';

const SAMPLES_DIR = join(__dirname, '../../examples/sample_kettle_files');

describe('Transformation Handlers', () => {
  describe('getTransformation', () => {
    it('should read and parse a transformation file', async () => {
      const result = await getTransformation({
        path: join(SAMPLES_DIR, 'sample_transformation.ktr'),
      });

      expect(result).toBeDefined();
      expect(result.transformation).toBeDefined();
      expect(result.transformation.info.name).toBe('sample_transformation');
      expect(result.path).toContain('sample_transformation.ktr');
      expect(result.size).toBeGreaterThan(0);
    });

    it('should throw error for non-existent file', async () => {
      await expect(
        getTransformation({ path: join(SAMPLES_DIR, 'nonexistent.ktr') })
      ).rejects.toThrow('File not found');
    });
  });

  describe('getTransformationStatus', () => {
    it('should get transformation status with validation', async () => {
      const result = await getTransformationStatus({
        path: join(SAMPLES_DIR, 'sample_transformation.ktr'),
      });

      expect(result).toBeDefined();
      expect(result.name).toBe('sample_transformation');
      expect(result.status).toBe('waiting');
      expect(result.steps).toHaveLength(3); // Generate Rows, Add sequence, Select values
      expect(result.validation).toBeDefined();
      expect(result.validation?.valid).toBe(true); // Sample file should be valid
    });
  });

  describe('validateTransformationFile', () => {
    it('should validate a transformation file', async () => {
      const result = await validateTransformationFile({
        path: join(SAMPLES_DIR, 'sample_transformation.ktr'),
      });

      expect(result).toBeDefined();
      expect(result.type).toBe('transformation');
      expect(result.result.valid).toBe(true);
      expect(result.result.summary.errors).toBe(0);
    });
  });
});
