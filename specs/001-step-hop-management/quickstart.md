# Quickstart: Step and Hop Management Tools

This guide explains how to use the MCP tools for managing steps and hops in Pentaho Kettle transformations and jobs.

## Prerequisites
- Node.js >= 18
- Install dependencies: `npm install`
- MCP server running (see `src/server.ts`)

## Adding a Step to a Transformation
1. List available step types:
   - Call: `list_step_types`
2. Add a step:
   - Call: `add_transformation_step` with `name`, `type`, `configuration`, `xloc`, `yloc`
3. Connect steps with a hop:
   - Call: `add_transformation_hop` with `from`, `to`

## Updating a Step
- Call: `update_transformation_step` with `name` and new `configuration` or coordinates

## Removing a Step
- Call: `remove_transformation_step` with `name` (all connected hops are auto-removed)

## Managing Job Entries and Hops
- Use `add_job_entry`, `update_job_entry`, `remove_job_entry`, `add_job_hop`, `remove_job_hop` for job files

## Validating Step Configuration
- Call: `validate_step_configuration` before adding/updating a step to check for errors

## Example: Add and Connect Steps
```json
{
  "action": "add_transformation_step",
  "name": "TableInput1",
  "type": "TableInput",
  "configuration": { "connection": "mydb", "sql": "SELECT * FROM foo" },
  "xloc": 100, "yloc": 100
}
```

```json
{
  "action": "add_transformation_hop",
  "from": "TableInput1",
  "to": "SelectValues1"
}
```

## Error Handling
- All tools return structured JSON with `success` or `error` and details
- Validation errors include field names and messages

## References
- See `specs/001-step-hop-management/spec.md` for full requirements
- See `src/tools/` for tool implementations
- See `examples/sample_kettle_files/` for sample Kettle files
