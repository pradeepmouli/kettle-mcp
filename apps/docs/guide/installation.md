---
title: Installation
---

# Installation

## Prerequisites

- Node.js 20 or higher
- An MCP-compatible client (Claude Desktop, Cursor, etc.)
- Pentaho Kettle `.ktr` / `.kjb` files you want to manage

## Install from npm

```bash
npm install -g kettle-mcp
# or with pnpm
pnpm add -g kettle-mcp
```

## Run directly with npx

```bash
npx kettle-mcp
```

## Add to Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "kettle": {
      "command": "npx",
      "args": ["-y", "kettle-mcp"]
    }
  }
}
```

Or if installed globally:

```json
{
  "mcpServers": {
    "kettle": {
      "command": "kettle-mcp"
    }
  }
}
```

## Build from source

```bash
git clone https://github.com/pradeepmouli/kettle-mcp.git
cd kettle-mcp
pnpm install
pnpm run build
node dist/index.js
```
