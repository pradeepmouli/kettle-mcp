/**
 * Tests for job handlers
 */

import { join } from 'path';
import { describe, expect, it } from 'vitest';
import { getJob, getJobStatus, validateJobFile } from '../handlers/job-handlers';

const SAMPLES_DIR = join(__dirname, '../../examples/sample_kettle_files');

describe('Job Handlers', () => {
  describe('getJob', () => {
    it('should read and parse a job file', async () => {
      const result = await getJob({
        path: join(SAMPLES_DIR, 'sample_job.kjb'),
      });

      expect(result).toBeDefined();
      expect(result.job).toBeDefined();
      expect(result.job.name).toBe('sample_job');
      expect(result.path).toContain('sample_job.kjb');
      expect(result.size).toBeGreaterThan(0);
    });

    it('should throw error for non-existent file', async () => {
      await expect(getJob({ path: join(SAMPLES_DIR, 'nonexistent.kjb') })).rejects.toThrow(
        'File not found'
      );
    });
  });

  describe('getJobStatus', () => {
    it('should get job status with validation', async () => {
      const result = await getJobStatus({
        path: join(SAMPLES_DIR, 'sample_job.kjb'),
      });

      expect(result).toBeDefined();
      expect(result.name).toBe('sample_job');
      expect(result.status).toBe('waiting');
      expect(result.entries).toHaveLength(3); // START, Write to log, Success
      expect(result.validation).toBeDefined();
      expect(result.validation?.valid).toBe(true); // Sample file should be valid
    });
  });

  describe('validateJobFile', () => {
    it('should validate a job file', async () => {
      const result = await validateJobFile({
        path: join(SAMPLES_DIR, 'sample_job.kjb'),
      });

      expect(result).toBeDefined();
      expect(result.type).toBe('job');
      expect(result.result.valid).toBe(true);
      expect(result.result.summary.errors).toBe(0);
    });
  });
});
