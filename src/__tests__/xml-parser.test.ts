/**
 * Tests for XML parser using fast-xml-parser
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { describe, expect, it } from 'vitest';
import {
  buildJob,
  buildTransformation,
  normalizeKettleJson,
  parseJob,
  parseTransformation,
} from '../parser/xml-parser';

const SAMPLES_DIR = join(__dirname, '../../examples/sample_kettle_files');

describe('XML Parser', () => {
  describe('parseTransformation', () => {
    it('should parse sample transformation file', () => {
      const xmlContent = readFileSync(join(SAMPLES_DIR, 'sample_transformation.ktr'), 'utf-8');
      const transformation = parseTransformation(xmlContent);

      expect(transformation).toBeDefined();
      expect(transformation).toHaveProperty('info');
    });

    it('should throw error for invalid transformation XML', () => {
      const invalidXml = '<?xml version="1.0"?><notransformation></notransformation>';
      expect(() => parseTransformation(invalidXml)).toThrow('Invalid transformation XML');
    });
  });

  describe('parseJob', () => {
    it('should parse sample job file', () => {
      const xmlContent = readFileSync(join(SAMPLES_DIR, 'sample_job.kjb'), 'utf-8');
      const job = parseJob(xmlContent);

      expect(job).toBeDefined();
      expect(job).toHaveProperty('name');
    });

    it('should throw error for invalid job XML', () => {
      const invalidXml = '<?xml version="1.0"?><nojob></nojob>';
      expect(() => parseJob(invalidXml)).toThrow('Invalid job XML');
    });
  });

  describe('Round-trip: transformation', () => {
    it('should preserve transformation structure on parse->build', () => {
      const xmlContent = readFileSync(join(SAMPLES_DIR, 'sample_transformation.ktr'), 'utf-8');
      const transformation = parseTransformation(xmlContent);
      const rebuilt = buildTransformation(transformation);

      // Parse rebuilt to verify structure
      const reparsed = parseTransformation(rebuilt);

      // Compare key structural elements (ignoring whitespace in #text nodes)
      expect(reparsed).toHaveProperty('info');
      expect(reparsed).toHaveProperty('order');
      expect(reparsed).toHaveProperty('step');
    });
  });

  describe('Round-trip: job', () => {
    it('should preserve job structure on parse->build', () => {
      const xmlContent = readFileSync(join(SAMPLES_DIR, 'sample_job.kjb'), 'utf-8');
      const job = parseJob(xmlContent);
      const rebuilt = buildJob(job);

      // Parse rebuilt to verify structure
      const reparsed = parseJob(rebuilt);

      // Compare key structural elements (ignoring whitespace in #text nodes)
      expect(reparsed).toHaveProperty('name');
      expect(reparsed).toHaveProperty('entries');
      expect(reparsed).toHaveProperty('hops');
    });
  });

  describe('normalizeKettleJson', () => {
    it('should extract text nodes', () => {
      const input = {
        name: { '#text': 'test_name' },
        value: 123,
      };

      const normalized = normalizeKettleJson(input);
      expect(normalized).toEqual({
        name: 'test_name',
        value: 123,
      });
    });

    it('should normalize step → steps for transformation', () => {
      const input = {
        step: [{ name: 'step1', type: 'RowGenerator' }],
      };

      const normalized = normalizeKettleJson(input);
      expect(normalized).toMatchObject({
        steps: [{ name: 'step1', type: 'RowGenerator' }],
      });
    });

    it('should normalize order.hop → order array for transformation', () => {
      const input = {
        order: {
          hop: [
            { from: 'step1', to: 'step2' },
            { from: 'step2', to: 'step3' },
          ],
        },
      };

      const normalized = normalizeKettleJson(input);
      expect(normalized).toMatchObject({
        order: [
          { from: 'step1', to: 'step2' },
          { from: 'step2', to: 'step3' },
        ],
      });
    });
  });
});
