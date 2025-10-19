import { describe, expect, it } from 'vitest';

// Test TypeScript features and types
interface TestInterface {
	id: number;
	name: string;
	optional?: boolean;
}

class TestClass {
	constructor (private data: TestInterface) {}

	getData(): TestInterface {
		return this.data;
	}

	getName(): string {
		return this.data.name;
	}
}

describe('TypeScript Integration Tests', () => {
	it('should handle TypeScript interfaces', () => {
		const testData: TestInterface = {
			id: 1,
			name: 'test'
		};

		expect(testData.id).toBe(1);
		expect(testData.name).toBe('test');
		expect(testData.optional).toBeUndefined();
	});

	it('should handle TypeScript classes', () => {
		const testData: TestInterface = {
			id: 2,
			name: 'class test',
			optional: true
		};

		const testInstance = new TestClass(testData);

		expect(testInstance.getData()).toEqual(testData);
		expect(testInstance.getName()).toBe('class test');
	});

	it('should support generics', () => {
		function identity<T>(arg: T): T {
			return arg;
		}

		const stringResult = identity('hello');
		const numberResult = identity(42);

		expect(stringResult).toBe('hello');
		expect(numberResult).toBe(42);
	});

	it('should handle async/await with types', async () => {
		async function fetchData(): Promise<TestInterface> {
			return Promise.resolve({
				id: 3,
				name: 'async test'
			});
		}

		const result = await fetchData();
		expect(result.id).toBe(3);
		expect(result.name).toBe('async test');
	});
});