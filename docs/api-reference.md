# Kettle-MCP API Reference

Complete reference for all 16 MCP tools provided by Kettle-MCP.

## Table of Contents

- [Discovery Tools](#discovery-tools)
- [Validation Tools](#validation-tools)
- [Transformation Tools](#transformation-tools)
- [Job Tools](#job-tools)
- [Common Patterns](#common-patterns)
- [Error Handling](#error-handling)

## Discovery Tools

### kettle_list_step_types

List all available transformation step types with their metadata.

**Parameters:**
- `category` (optional): Filter by category (Input, Output, Transform, etc.)

**Returns:**
```typescript
{
  stepTypes: Array<{
    typeId: string;
    category: string;
    displayName: string;
    description: string;
    tags: string[];
  }>
}
```

**Example:**
```typescript
// List all step types
await kettle_list_step_types();

// Filter by category
await kettle_list_step_types({ category: "Input" });
```

---

### kettle_get_step_type_schema

Get detailed configuration schema for a specific step type.

**Parameters:**
- `typeId` (required): The step type identifier (e.g., "TableInput", "SelectValues")

**Returns:**
```typescript
{
  stepType: {
    typeId: string;
    category: string;
    displayName: string;
    description: string;
    tags: string[];
    configurationSchema: object; // Zod schema definition
  }
}
```

**Example:**
```typescript
await kettle_get_step_type_schema({ typeId: "TableInput" });
```

---

### kettle_list_job_entry_types

List all available job entry types with their metadata.

**Parameters:**
- `category` (optional): Filter by category

**Returns:**
```typescript
{
  entryTypes: Array<{
    typeId: string;
    category: string;
    displayName: string;
    description: string;
    tags: string[];
  }>
}
```

**Example:**
```typescript
await kettle_list_job_entry_types();
```

---

### kettle_get_job_entry_type_schema

Get detailed configuration schema for a specific job entry type.

**Parameters:**
- `typeId` (required): The job entry type identifier (e.g., "TRANS", "WRITE_TO_LOG")

**Returns:**
```typescript
{
  entryType: {
    typeId: string;
    category: string;
    displayName: string;
    description: string;
    tags: string[];
    configurationSchema: object; // Zod schema definition
  }
}
```

**Example:**
```typescript
await kettle_get_job_entry_type_schema({ typeId: "TRANS" });
```

---

## Validation Tools

### kettle_validate_step_configuration

Validate a step configuration against its type schema before creating/updating.

**Parameters:**
- `typeId` (required): The step type identifier
- `configuration` (required): The configuration object to validate

**Returns:**
```typescript
{
  valid: boolean;
  errors?: string[]; // Present if valid is false
}
```

**Example:**
```typescript
const result = await kettle_validate_step_configuration({
  typeId: "TableInput",
  configuration: {
    connection: "MyDB",
    sql: "SELECT * FROM users"
  }
});

if (result.valid) {
  // Configuration is valid
} else {
  console.error("Validation errors:", result.errors);
}
```

---

### kettle_validate_job_entry_configuration

Validate a job entry configuration against its type schema.

**Parameters:**
- `typeId` (required): The job entry type identifier
- `configuration` (required): The configuration object to validate

**Returns:**
```typescript
{
  valid: boolean;
  errors?: string[]; // Present if valid is false
}
```

**Example:**
```typescript
const result = await kettle_validate_job_entry_configuration({
  typeId: "WRITE_TO_LOG",
  configuration: {
    logmessage: "Process completed",
    loglevel: "Basic"
  }
});
```

---

## Transformation Tools

### kettle_add_transformation_step

Add a new step to a transformation file.

**Parameters:**
- `filePath` (required): Absolute path to the .ktr file
- `step` (required): Step object containing:
  - `name` (required): Unique step name
  - `type` (required): Step type ID
  - `configuration` (required): Type-specific configuration
  - `xloc` (optional): X coordinate for GUI (default: 100)
  - `yloc` (optional): Y coordinate for GUI (default: 100)

**Returns:**
```typescript
{
  success: boolean;
  diff?: string; // Unified diff of changes
  error?: string; // Present if success is false
}
```

**Example:**
```typescript
await kettle_add_transformation_step({
  filePath: "/path/to/transformation.ktr",
  step: {
    name: "Read Customer Data",
    type: "TableInput",
    configuration: {
      connection: "ProductionDB",
      sql: "SELECT * FROM customers WHERE active = 1",
      limit: 1000
    },
    xloc: 100,
    yloc: 200
  }
});
```

**Notes:**
- Automatically creates a backup file (.ktr.backup)
- Returns a diff showing the changes
- Validates configuration before adding
- Fails if step name already exists

---

### kettle_add_transformation_hop

Add a hop (connection) between two steps in a transformation.

**Parameters:**
- `filePath` (required): Absolute path to the .ktr file
- `from` (required): Source step name
- `to` (required): Target step name

**Returns:**
```typescript
{
  success: boolean;
  diff?: string;
  error?: string;
}
```

**Example:**
```typescript
await kettle_add_transformation_hop({
  filePath: "/path/to/transformation.ktr",
  from: "Read Customer Data",
  to: "Select Columns"
});
```

**Notes:**
- Both steps must exist before creating the hop
- Duplicate hops are not allowed
- Creates backup and returns diff

---

### kettle_update_transformation_step

Update an existing step's configuration or GUI coordinates.

**Parameters:**
- `filePath` (required): Absolute path to the .ktr file
- `stepName` (required): Name of the step to update
- `configuration` (optional): Partial configuration update (merged with existing)
- `xloc` (optional): New X coordinate
- `yloc` (optional): New Y coordinate

**Returns:**
```typescript
{
  success: boolean;
  diff?: string;
  error?: string;
}
```

**Example:**
```typescript
// Update configuration only
await kettle_update_transformation_step({
  filePath: "/path/to/transformation.ktr",
  stepName: "Read Customer Data",
  configuration: {
    sql: "SELECT * FROM customers WHERE status = 'active'"
  }
});

// Update GUI position only
await kettle_update_transformation_step({
  filePath: "/path/to/transformation.ktr",
  stepName: "Read Customer Data",
  xloc: 300,
  yloc: 250
});

// Update both
await kettle_update_transformation_step({
  filePath: "/path/to/transformation.ktr",
  stepName: "Read Customer Data",
  configuration: {
    limit: 5000
  },
  xloc: 350
});
```

**Notes:**
- Configuration updates are partial - existing values are preserved
- Validates merged configuration before applying
- Creates backup and returns diff

---

### kettle_remove_transformation_step

Remove a step from a transformation and automatically remove all connected hops.

**Parameters:**
- `filePath` (required): Absolute path to the .ktr file
- `stepName` (required): Name of the step to remove

**Returns:**
```typescript
{
  success: boolean;
  diff?: string;
  error?: string;
}
```

**Example:**
```typescript
await kettle_remove_transformation_step({
  filePath: "/path/to/transformation.ktr",
  stepName: "Read Customer Data"
});
```

**Notes:**
- Automatically removes all hops connected to this step
- Creates backup before removal
- Returns diff showing all changes

---

### kettle_remove_transformation_hop

Remove a specific hop between two steps.

**Parameters:**
- `filePath` (required): Absolute path to the .ktr file
- `from` (required): Source step name
- `to` (required): Target step name

**Returns:**
```typescript
{
  success: boolean;
  diff?: string;
  error?: string;
}
```

**Example:**
```typescript
await kettle_remove_transformation_hop({
  filePath: "/path/to/transformation.ktr",
  from: "Read Customer Data",
  to: "Select Columns"
});
```

---

## Job Tools

### kettle_add_job_entry

Add a new entry to a job file.

**Parameters:**
- `filePath` (required): Absolute path to the .kjb file
- `entryName` (required): Unique entry name
- `entryType` (required): Job entry type ID (e.g., "TRANS", "WRITE_TO_LOG")
- `configuration` (required): Type-specific configuration
- `options` (optional): Additional options:
  - `description` (optional): Entry description
  - `guiX` (optional): X coordinate (default: 100)
  - `guiY` (optional): Y coordinate (default: 100)
  - `drawStep` (optional): Whether to draw in GUI (default: true)
  - `parallel` (optional): Execute in parallel (default: false)

**Returns:**
```typescript
{
  success: boolean;
  diff?: string;
  error?: string;
}
```

**Example:**
```typescript
// Add a transformation execution entry
await kettle_add_job_entry({
  filePath: "/path/to/job.kjb",
  entryName: "Run Customer ETL",
  entryType: "TRANS",
  configuration: {
    filename: "/etl/transformations/customer_extract.ktr"
  },
  options: {
    description: "Extract customer data from source",
    guiX: 200,
    guiY: 100,
    parallel: false
  }
});

// Add a logging entry
await kettle_add_job_entry({
  filePath: "/path/to/job.kjb",
  entryName: "Log Completion",
  entryType: "WRITE_TO_LOG",
  configuration: {
    logmessage: "Customer ETL completed successfully",
    loglevel: "Basic"
  },
  options: {
    guiX: 400,
    guiY: 100
  }
});
```

**Notes:**
- Creates backup and returns diff
- Validates configuration before adding
- Entry names must be unique within the job

---

### kettle_add_job_hop

Add a hop (connection) between two job entries.

**Parameters:**
- `filePath` (required): Absolute path to the .kjb file
- `fromEntry` (required): Source entry name
- `toEntry` (required): Target entry name
- `options` (optional):
  - `enabled` (optional): Whether hop is enabled (default: true)
  - `evaluation` (optional): Execute on success (true) or failure (false) (default: true)
  - `unconditional` (optional): Execute unconditionally (default: false)

**Returns:**
```typescript
{
  success: boolean;
  diff?: string;
  error?: string;
}
```

**Example:**
```typescript
// Success hop
await kettle_add_job_hop({
  filePath: "/path/to/job.kjb",
  fromEntry: "Run Customer ETL",
  toEntry: "Log Completion",
  options: {
    evaluation: true  // Run on success
  }
});

// Failure hop
await kettle_add_job_hop({
  filePath: "/path/to/job.kjb",
  fromEntry: "Run Customer ETL",
  toEntry: "Log Error",
  options: {
    evaluation: false  // Run on failure
  }
});

// Unconditional hop
await kettle_add_job_hop({
  filePath: "/path/to/job.kjb",
  fromEntry: "Data Validation",
  toEntry: "Cleanup",
  options: {
    unconditional: true  // Always run
  }
});
```

**Notes:**
- Both entries must exist
- Creates backup and returns diff
- Use evaluation flag to control success/failure paths

---

### kettle_update_job_entry

Update an existing job entry's configuration or GUI coordinates.

**Parameters:**
- `filePath` (required): Absolute path to the .kjb file
- `entryName` (required): Name of the entry to update
- `configuration` (optional): Partial configuration update
- `guiX` (optional): New X coordinate
- `guiY` (optional): New Y coordinate

**Returns:**
```typescript
{
  success: boolean;
  diff?: string;
  error?: string;
}
```

**Example:**
```typescript
await kettle_update_job_entry({
  filePath: "/path/to/job.kjb",
  entryName: "Run Customer ETL",
  configuration: {
    filename: "/etl/transformations/customer_extract_v2.ktr"
  },
  guiX: 250
});
```

**Notes:**
- Configuration updates are partial
- Validates merged configuration
- Creates backup and returns diff

---

### kettle_remove_job_entry

Remove a job entry and automatically remove all connected hops.

**Parameters:**
- `filePath` (required): Absolute path to the .kjb file
- `entryName` (required): Name of the entry to remove

**Returns:**
```typescript
{
  success: boolean;
  diff?: string;
  error?: string;
}
```

**Example:**
```typescript
await kettle_remove_job_entry({
  filePath: "/path/to/job.kjb",
  entryName: "Run Customer ETL"
});
```

**Notes:**
- Automatically removes all connected hops
- Creates backup before removal
- Cannot remove the START entry

---

### kettle_remove_job_hop

Remove a specific hop between two job entries.

**Parameters:**
- `filePath` (required): Absolute path to the .kjb file
- `fromEntry` (required): Source entry name
- `toEntry` (required): Target entry name

**Returns:**
```typescript
{
  success: boolean;
  diff?: string;
  error?: string;
}
```

**Example:**
```typescript
await kettle_remove_job_hop({
  filePath: "/path/to/job.kjb",
  fromEntry: "Run Customer ETL",
  toEntry: "Log Completion"
});
```

---

## Common Patterns

### Pattern 1: Validate Before Create

```typescript
// 1. Validate configuration
const validation = await kettle_validate_step_configuration({
  typeId: "TableInput",
  configuration: {
    connection: "MyDB",
    sql: "SELECT * FROM users"
  }
});

if (!validation.valid) {
  console.error("Invalid configuration:", validation.errors);
  return;
}

// 2. Create the step
await kettle_add_transformation_step({
  filePath: "/path/to/transformation.ktr",
  step: {
    name: "Read Users",
    type: "TableInput",
    configuration: {
      connection: "MyDB",
      sql: "SELECT * FROM users"
    }
  }
});
```

### Pattern 2: Build Complete Pipeline

```typescript
const filePath = "/path/to/transformation.ktr";

// Add steps
await kettle_add_transformation_step({
  filePath,
  step: { name: "Input", type: "TableInput", configuration: {...}, xloc: 100, yloc: 100 }
});

await kettle_add_transformation_step({
  filePath,
  step: { name: "Transform", type: "SelectValues", configuration: {...}, xloc: 300, yloc: 100 }
});

await kettle_add_transformation_step({
  filePath,
  step: { name: "Output", type: "TextFileOutput", configuration: {...}, xloc: 500, yloc: 100 }
});

// Connect with hops
await kettle_add_transformation_hop({ filePath, from: "Input", to: "Transform" });
await kettle_add_transformation_hop({ filePath, from: "Transform", to: "Output" });
```

### Pattern 3: Conditional Job Flow

```typescript
const jobFile = "/path/to/job.kjb";

// Add entries
await kettle_add_job_entry({
  filePath: jobFile,
  entryName: "Validate Data",
  entryType: "TRANS",
  configuration: { filename: "/etl/validate.ktr" }
});

await kettle_add_job_entry({
  filePath: jobFile,
  entryName: "Process Success",
  entryType: "TRANS",
  configuration: { filename: "/etl/process.ktr" }
});

await kettle_add_job_entry({
  filePath: jobFile,
  entryName: "Handle Error",
  entryType: "WRITE_TO_LOG",
  configuration: { logmessage: "Validation failed", loglevel: "Error" }
});

// Success path
await kettle_add_job_hop({
  filePath: jobFile,
  fromEntry: "Validate Data",
  toEntry: "Process Success",
  options: { evaluation: true }
});

// Error path
await kettle_add_job_hop({
  filePath: jobFile,
  fromEntry: "Validate Data",
  toEntry: "Handle Error",
  options: { evaluation: false }
});
```

---

## Error Handling

All tools return a structured response with `success` boolean:

```typescript
{
  success: true,
  diff: "..." // On success
}

// Or

{
  success: false,
  error: "Error message explaining what went wrong"
}
```

Common error scenarios:

- **File not found**: Invalid file path or file doesn't exist
- **Duplicate name**: Step/entry name already exists
- **Invalid configuration**: Configuration doesn't match schema
- **Missing dependency**: Referenced step/entry doesn't exist (for hops)
- **Invalid file structure**: Malformed XML or missing required elements

Always check the `success` field before proceeding:

```typescript
const result = await kettle_add_transformation_step({...});

if (!result.success) {
  console.error("Failed to add step:", result.error);
  return;
}

console.log("Step added successfully");
console.log("Changes:", result.diff);
```

---

## Safety Features

All modification tools include:

1. **Automatic Backups**: Original file saved as `.backup` before changes
2. **Atomic Writes**: Changes written atomically to prevent corruption
3. **Diff Generation**: Unified diff showing exactly what changed
4. **Configuration Validation**: Schema validation before applying changes
5. **Dependency Checking**: Verify referenced steps/entries exist

Example of accessing the diff:

```typescript
const result = await kettle_update_transformation_step({...});

if (result.success && result.diff) {
  console.log("Changes made:");
  console.log(result.diff);
}
```
