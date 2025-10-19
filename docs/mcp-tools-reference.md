# MCP Tools Reference

Complete reference for all available MCP tools in Kettle-MCP.

## Table of Contents

- [Read Operations](#read-operations)
- [Validation Operations](#validation-operations)
- [Search & List Operations](#search--list-operations)
- [Edit Operations](#edit-operations)
- [Execution Operations](#execution-operations)
- [Server Status & Lifecycle](#server-status--lifecycle)

---

## Read Operations

### read_kettle_transformation

Read and parse a Pentaho Kettle transformation file (.ktr).

**Input:**
```json
{
  "path": "/path/to/transformation.ktr"
}
```

**Output:**
```json
{
  "transformation": {
    "info": {
      "name": "MyTransformation",
      "description": "Sample transformation",
      "extended_description": "",
      "trans_version": "1.0",
      "trans_type": "Normal",
      "directory": "/",
      "parameters": []
    },
    "steps": [],
    "order": [],
    "connections": []
  },
  "path": "/path/to/transformation.ktr",
  "size": 12345
}
```

### read_kettle_job

Read and parse a Pentaho Kettle job file (.kjb).

**Input:**
```json
{
  "path": "/path/to/job.kjb"
}
```

**Output:**
```json
{
  "job": {
    "name": "MyJob",
    "description": "Sample job",
    "extended_description": "",
    "job_version": "1.0",
    "directory": "/",
    "entries": [],
    "hops": [],
    "parameters": []
  },
  "path": "/path/to/job.kjb",
  "size": 8192
}
```

---

## Validation Operations

### validate_kettle_transformation

Validate a Kettle transformation file structure and content.

**Input:**
```json
{
  "path": "/path/to/transformation.ktr"
}
```

**Output:**
```json
{
  "path": "/path/to/transformation.ktr",
  "type": "transformation",
  "result": {
    "valid": true,
    "issues": [],
    "summary": {
      "errors": 0,
      "warnings": 0,
      "info": 0
    }
  }
}
```

### validate_kettle_job

Validate a Kettle job file structure and content.

**Input:**
```json
{
  "path": "/path/to/job.kjb"
}
```

**Output:**
```json
{
  "path": "/path/to/job.kjb",
  "type": "job",
  "result": {
    "valid": true,
    "issues": [],
    "summary": {
      "errors": 0,
      "warnings": 0,
      "info": 0
    }
  }
}
```

---

## Search & List Operations

### search_kettle_artifacts

Search for Kettle artifacts (transformations and jobs) by name, step type, parameter, etc.

**Input:**
```json
{
  "query": "customer",
  "type": "all",
  "directory": "/path/to/kettle/files",
  "maxResults": 10
}
```

**Output:**
```json
{
  "results": [
    {
      "path": "/path/to/customer_import.ktr",
      "type": "transformation",
      "name": "customer_import",
      "description": "Import customer data",
      "modified_date": "2025-10-18",
      "steps": ["TableInput", "SelectValues", "TableOutput"],
      "stepTypes": ["TableInput", "SelectValues", "TableOutput"],
      "parameters": ["DB_HOST", "DB_NAME"]
    }
  ],
  "total": 1,
  "query": "customer"
}
```

### list_kettle_artifacts

List all Kettle artifacts in a directory.

**Input:**
```json
{
  "type": "transformation",
  "directory": "/path/to/kettle/files",
  "detailed": true
}
```

**Output:**
```json
{
  "artifacts": [
    {
      "path": "/path/to/transform1.ktr",
      "type": "transformation",
      "name": "transform1",
      "description": "First transformation"
    }
  ],
  "total": 1
}
```

---

## Edit Operations

### save_kettle_transformation

Save or update a Kettle transformation file with atomic writes, backups, and diff preview.

**Input:**
```json
{
  "path": "/path/to/transformation.ktr",
  "transformation": {
    "info": {
      "name": "UpdatedTransformation",
      "description": "Updated description"
    },
    "steps": [],
    "order": []
  },
  "createBackup": true
}
```

**Output:**
```json
{
  "path": "/path/to/transformation.ktr",
  "success": true,
  "backupPath": "/path/to/transformation.backup.2025-10-18T12-34-56-789Z.ktr",
  "diff": "--- a/transformation.ktr\n+++ b/transformation.ktr\n@@ -2,1 +2,1 @@\n-<description>Old description</description>\n+<description>Updated description</description>",
  "validation": {
    "valid": true,
    "issues": [],
    "summary": { "errors": 0, "warnings": 0, "info": 0 }
  }
}
```

### save_kettle_job

Save or update a Kettle job file with atomic writes, backups, and diff preview.

**Input:**
```json
{
  "path": "/path/to/job.kjb",
  "job": {
    "name": "UpdatedJob",
    "description": "Updated job description",
    "entries": [],
    "hops": []
  },
  "createBackup": true
}
```

**Output:**
```json
{
  "path": "/path/to/job.kjb",
  "success": true,
  "backupPath": "/path/to/job.backup.2025-10-18T12-34-56-789Z.kjb",
  "diff": "...",
  "validation": {
    "valid": true,
    "issues": [],
    "summary": { "errors": 0, "warnings": 0, "info": 0 }
  }
}
```

---

## Execution Operations

> **⚠️ Security Note:** Execution operations require explicit opt-in via environment variables for safety.

### Environment Variables

- `KETTLE_MCP_ALLOW_EXECUTION=1` - Enable execution (required)
- `KETTLE_MCP_EXEC_ROOT=/path` - Restrict execution to directory
- `KETTLE_MCP_AUTO_CONFIRM=1` - Skip confirmation prompts (for automation)

### execute_kettle_transformation

Execute a Kettle transformation (local mode, currently stubbed with echo).

**Input:**
```json
{
  "path": "/path/to/transformation.ktr",
  "timeoutMs": 60000
}
```

**Output:**
```json
{
  "success": true,
  "output": "Executing transformation /path/to/transformation.ktr\n"
}
```

### execute_kettle_job

Execute a Kettle job (local mode, currently stubbed with echo).

**Input:**
```json
{
  "path": "/path/to/job.kjb",
  "timeoutMs": 60000
}
```

**Output:**
```json
{
  "success": true,
  "output": "Executing job /path/to/job.kjb\n"
}
```

### start_kettle_transformation / start_kettle_job

Start a transformation or job (currently delegates to execute).

### stop_kettle_transformation / stop_kettle_job

Stop a running transformation or job (not yet implemented - requires process tracking).

**Output:**
```json
{
  "error": "Stop transformation not implemented."
}
```

---

## Server Status & Lifecycle

### get_server_status

Get server status and registered artifacts (local mode only).

**Input:**
```json
{}
```

**Output:**
```json
{
  "status": "running",
  "uptime": 12345.678,
  "registeredTransformations": [],
  "registeredJobs": [],
  "mode": "local"
}
```

### register_kettle_transformation

Register a transformation file path (local registry, not persistent).

**Input:**
```json
{
  "filePath": "/path/to/transformation.ktr"
}
```

**Output:**
```json
{
  "success": true,
  "registered": "/path/to/transformation.ktr"
}
```

### register_kettle_job

Register a job file path (local registry, not persistent).

**Input:**
```json
{
  "filePath": "/path/to/job.kjb"
}
```

**Output:**
```json
{
  "success": true,
  "registered": "/path/to/job.kjb"
}
```

### remove_kettle_transformation / remove_kettle_job

Remove a registered transformation or job from the local registry.

**Output:**
```json
{
  "success": true,
  "removed": "/path/to/transformation.ktr"
}
```

### cleanup_kettle_transformation

Cleanup temporary files and logs for a transformation (stub).

**Output:**
```json
{
  "success": true,
  "cleaned": "/path/to/transformation.ktr"
}
```

---

## Error Handling

All tools return structured JSON errors when operations fail:

```json
{
  "error": "File not found: /path/to/missing.ktr"
}
```

Common error scenarios:
- File not found
- Invalid XML structure
- Validation failures (missing required fields)
- Permission denied (filesystem access)
- Execution not allowed (missing env vars)
- Path not allowed (outside EXEC_ROOT)

---

## Local-Only vs REST API Differences

| Feature | Local Mode | Carte REST API |
|---------|-----------|----------------|
| File reading | ✅ Direct filesystem access | ❌ N/A (server manages) |
| File writing | ✅ Atomic with backup | ❌ N/A (use addTrans/addJob) |
| Validation | ✅ Schema + structural | ⚠️ Basic XML validation |
| Execution | ⚠️ Stubbed (echo) | ✅ Full Pan/Kitchen |
| Status tracking | ❌ Not persistent | ✅ Real-time status |
| Process control | ❌ Stop not implemented | ✅ Start/stop/pause |
| Registration | ⚠️ Local registry only | ✅ Server registry |

---

## Tool Categories Summary

| Category | Tools | Status |
|----------|-------|--------|
| **Read** | 2 tools | ✅ Fully implemented |
| **Validate** | 2 tools | ✅ Fully implemented |
| **Search/List** | 2 tools | ✅ Fully implemented |
| **Edit** | 2 tools | ✅ Fully implemented |
| **Execute** | 6 tools | ⚠️ Stubbed (echo), guards active |
| **Lifecycle** | 6 tools | ⚠️ Local mode only |

**Total: 20 MCP tools available**
