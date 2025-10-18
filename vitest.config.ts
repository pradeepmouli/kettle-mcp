import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		environment: 'node',
		include: [
			'src/**/*.{test,spec}.{js,ts}',
			'tests/**/*.{test,spec}.{js,ts}'
		],
		exclude: [
			'node_modules',
			'dist',
			'coverage',
			'**/*.d.ts'
		],
		coverage: {
			provider: 'v8',
			include: ['src/**/*.ts'],
			exclude: [
				'src/**/*.d.ts',
				'src/**/*.test.ts',
				'src/**/*.spec.ts'
			],
			thresholds: {
				branches: 80,
				functions: 80,
				lines: 80,
				statements: 80
			}
		}
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src')
		}
	}
});