---
title: Usage
---

# Usage

## Reading Kettle files

Use `read_kettle_transformation` or `read_kettle_job` to load and inspect an existing file:

```json
{
  "name": "read_kettle_transformation",
  "arguments": { "path": "/etl/extract.ktr" }
}
```

## Discovering step types

```json
{
  "name": "list_kettle_steps",
  "arguments": { "category": "Input" }
}
```

Returns all Input step types (TableInput, CSVInput, KafkaConsumer, etc.) with their schemas.

## Saving a transformation

```json
{
  "name": "save_kettle_transformation",
  "arguments": {
    "path": "/etl/extract.ktr",
    "transformation": { ... },
    "createBackup": true
  }
}
```

## Validating a step configuration

```json
{
  "name": "validate_kettle_transformation",
  "arguments": { "path": "/etl/extract.ktr" }
}
```

## Executing a transformation

```json
{
  "name": "execute_kettle_transformation",
  "arguments": { "path": "/etl/extract.ktr", "timeoutMs": 30000 }
}
```

## Searching for artifacts

```json
{
  "name": "search_kettle_artifacts",
  "arguments": { "query": "customer", "directory": "/etl", "type": "transformation" }
}
```

## All available tools

| Tool | Description |
|------|-------------|
| `read_kettle_job` | Read and parse a `.kjb` file |
| `read_kettle_transformation` | Read and parse a `.ktr` file |
| `get_kettle_job_status` | Get job structure and validation summary |
| `get_kettle_transformation_status` | Get transformation structure and validation summary |
| `validate_kettle_job` | Validate a `.kjb` file |
| `validate_kettle_transformation` | Validate a `.ktr` file |
| `list_kettle_steps` | List step types (filterable by category/tag) |
| `list_kettle_job_entries` | List job entry types (filterable by category/tag) |
| `search_kettle_artifacts` | Search for `.ktr`/`.kjb` files |
| `list_kettle_artifacts` | List `.ktr`/`.kjb` files in a directory |
| `save_kettle_transformation` | Save/update a `.ktr` file |
| `save_kettle_job` | Save/update a `.kjb` file |
| `execute_kettle_transformation` | Execute a transformation (guarded) |
| `execute_kettle_job` | Execute a job (guarded) |
| `start_kettle_transformation` | Start a transformation |
| `stop_kettle_transformation` | Stop a running transformation |
| `start_kettle_job` | Start a job |
| `stop_kettle_job` | Stop a running job |
| `get_server_status` | Get server status and registered artifacts |
| `register_kettle_transformation` | Register a transformation path |
| `register_kettle_job` | Register a job path |
| `remove_kettle_transformation` | Unregister a transformation |
| `remove_kettle_job` | Unregister a job |
| `cleanup_kettle_transformation` | Clean temp/log files for a transformation |
