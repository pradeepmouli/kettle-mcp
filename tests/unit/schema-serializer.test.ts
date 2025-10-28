import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { serializeZodSchema, type SerializedSchema } from '../../src/utils/schema-serializer.js';

describe('Schema Serializer', () => {
	describe('serializeZodSchema', () => {
		it('should serialize a simple schema with required string field', () => {
			const schema = z.object({
				name: z.string().describe('User name'),
			});

			const result = serializeZodSchema(schema);

			expect(result.fields).toHaveLength(1);
			expect(result.fields[0]).toEqual({
				name: 'name',
				type: 'string',
				required: true,
				description: 'User name',
			});
		});

		it('should serialize schema with optional field', () => {
			const schema = z.object({
				email: z.string().optional().describe('User email'),
			});

			const result = serializeZodSchema(schema);

			expect(result.fields[0].required).toBe(false);
		});

		it('should serialize schema with multiple field types', () => {
			const schema = z.object({
				name: z.string().describe('Name'),
				age: z.number().describe('Age'),
				active: z.boolean().describe('Active status'),
			});

			const result = serializeZodSchema(schema);

			expect(result.fields).toHaveLength(3);
			expect(result.fields[0].type).toBe('string');
			expect(result.fields[1].type).toBe('number');
			expect(result.fields[2].type).toBe('boolean');
		});

		it('should extract default values', () => {
			const schema = z.object({
				status: z.string().default('active').describe('Status'),
				count: z.number().default(0).describe('Count'),
			});

			const result = serializeZodSchema(schema);

			expect(result.fields[0].default).toBe('active');
			expect(result.fields[1].default).toBe(0);
		});

		it('should handle fields without descriptions', () => {
			const schema = z.object({
				field: z.string(),
			});

			const result = serializeZodSchema(schema);

			expect(result.fields[0].description).toBe('');
		});

		it('should serialize array type', () => {
			const schema = z.object({
				tags: z.array(z.string()).describe('Tag list'),
			});

			const result = serializeZodSchema(schema);

			expect(result.fields[0].type).toBe('array');
		});

		it('should serialize object type', () => {
			const schema = z.object({
				config: z.object({ key: z.string() }).describe('Configuration'),
			});

			const result = serializeZodSchema(schema);

			expect(result.fields[0].type).toBe('object');
		});

		it('should serialize enum type', () => {
			const schema = z.object({
				level: z.enum(['Basic', 'Advanced']).describe('Level'),
			});

			const result = serializeZodSchema(schema);

			expect(result.fields[0].type).toBe('enum');
		});

		it('should handle complex Kettle step schema (TableInput)', () => {
			const tableInputSchema = z.object({
				connection: z.string().min(1).describe('Database connection name'),
				sql: z.string().min(1).describe('SQL query to execute'),
				limit: z.number().optional().describe('Maximum number of rows to return'),
				variables: z.boolean().optional().describe('Enable variable substitution'),
			});

			const result = serializeZodSchema(tableInputSchema);

			expect(result.fields).toHaveLength(4);

			const connectionField = result.fields.find(f => f.name === 'connection');
			expect(connectionField).toEqual({
				name: 'connection',
				type: 'string',
				required: true,
				description: 'Database connection name',
			});

			const limitField = result.fields.find(f => f.name === 'limit');
			expect(limitField?.required).toBe(false);
		});
	});
});
