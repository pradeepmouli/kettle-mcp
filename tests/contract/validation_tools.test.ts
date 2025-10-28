
import { validateJobEntryConfigurationTool } from '../../src/tools/validate_job_entry_configuration';
import { validateStepConfigurationTool } from '../../src/tools/validate_step_configuration';

describe('Validation Tools Contract Tests', () => {
	describe('validateStepConfigurationTool', () => {
		it('should validate correct TableInput configuration', async () => {
			const result = await validateStepConfigurationTool('TableInput', {
				connection: 'my_db',
				sql: 'SELECT * FROM users',
				limit: 1000,
			});

			expect(result.valid).toBe(true);
			expect(result.errors.length).toBe(0);
		});

		it('should reject invalid TableInput configuration', async () => {
			const result = await validateStepConfigurationTool('TableInput', {
				// Missing required 'connection' field
				sql: 'SELECT * FROM users',
			});

			expect(result.valid).toBe(false);
			expect(result.errors.length).toBeGreaterThan(0);
		});

		it('should validate correct SelectValues configuration', async () => {
			const result = await validateStepConfigurationTool('SelectValues', {
				fields: [
					{ name: 'id', rename: 'user_id' },
					{ name: 'email' },
				],
			});

			expect(result.valid).toBe(true);
			expect(result.errors.length).toBe(0);
		});
	});

	describe('validateJobEntryConfigurationTool', () => {
		it('should validate correct START configuration', async () => {
			const result = await validateJobEntryConfigurationTool('START', {});

			expect(result.valid).toBe(true);
			expect(result.error).toBeUndefined();
		});

		it('should validate correct TRANS configuration', async () => {
			const result = await validateJobEntryConfigurationTool('TRANS', {
				filename: '/path/to/transformation.ktr',
			});

			expect(result.valid).toBe(true);
			expect(result.error).toBeUndefined();
		});

		it('should reject invalid TRANS configuration', async () => {
			const result = await validateJobEntryConfigurationTool('TRANS', {
				// Missing required 'filename' field
				runConfiguration: 'local',
			});

			expect(result.valid).toBe(false);
			expect(result.error).toBeDefined();
			expect(result.error).toContain('filename');
		});

		it('should validate correct WRITE_TO_LOG configuration', async () => {
			const result = await validateJobEntryConfigurationTool('WRITE_TO_LOG', {
				logmessage: 'Job started successfully',
				loglevel: 'Basic',
			});

			expect(result.valid).toBe(true);
			expect(result.error).toBeUndefined();
		});
	});
});
