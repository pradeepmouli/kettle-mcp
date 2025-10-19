#!/usr/bin/env node

/**
 * Kettle-MCP Server
 *
 * An MCP (Model Context Protocol) server that exposes tools for reading,
 * creating, and updating Pentaho Kettle jobs and transformations.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerTools } from './server.js';

/**
 * Main entry point for the Kettle-MCP server
 */
async function main(): Promise<void> {
	// Create MCP server instance
	const server = new Server(
		{
			name: 'kettle-mcp',
			version: '0.1.0',
		},
		{
			capabilities: {
				tools: {},
			},
		}
	);

	// Register all MCP tools
	registerTools(server);

	// Set up error handling
	server.onerror = (error): void => {
		console.error('[MCP Error]', error);
	};

	process.on('SIGINT', (): void => {
		void server.close();
		process.exit(0);
	});

	// Start the server using stdio transport
	const transport = new StdioServerTransport();
	await server.connect(transport);

	console.error('Kettle-MCP server running on stdio');
}

// Run the server
main().catch((error): void => {
	console.error('Fatal error in main():', error);
	process.exit(1);
});
