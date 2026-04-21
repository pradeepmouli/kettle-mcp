---
title: Introduction
---

# Introduction

kettle-mcp is an [MCP (Model Context Protocol)](https://modelcontextprotocol.io) server that exposes tools for reading, creating, modifying, validating, and executing [Pentaho Kettle](https://github.com/pentaho/pentaho-kettle) ETL transformations (`.ktr`) and jobs (`.kjb`).

> **Pre-1.0 software** — APIs are subject to change between minor versions. Pin to exact versions in production.

## What you can do

- **Read** `.ktr` and `.kjb` files and inspect their structure
- **Validate** step and job-entry configurations against built-in schemas
- **Add / update / remove** steps, job entries, and hops
- **Execute** transformations and jobs in guarded local mode
- **Discover** 132+ step types and job entry types with full schemas
- **Search** for Kettle artifacts across a directory tree

## Architecture

kettle-mcp runs as a stdio MCP server. Add it to any MCP-compatible client (Claude Desktop, Cursor, etc.) and it registers 25+ tools in the `kettle_*` / `read_kettle_*` namespaces.

```
MCP Client  <--stdio-->  kettle-mcp  <--fs-->  .ktr / .kjb files
```

## Next Steps

- [Installation](./installation)
- [Usage](./usage)
- [API Reference](/api/)
