# Sample Kettle Files

This directory contains sample Pentaho Kettle files for testing the kettle-mcp server.

## Files

### sample_transformation.ktr

A simple transformation that demonstrates basic Kettle functionality:
- **Generate Rows**: Creates 10 rows with a "name" field set to "Test"
- **Add Sequence**: Adds a sequence ID (1, 2, 3, ...) to each row
- **Select Values**: Selects and orders the fields (id, name)

This transformation can be used to test:
- Reading transformation files
- Parsing step definitions
- Understanding hop connections between steps
- Extracting metadata (name, description, etc.)

### sample_job.kjb

A simple job that demonstrates basic job functionality:
- **START**: The starting point of the job
- **Write to log**: Writes "Job started" to the log
- **Success**: Marks the job as successful

This job can be used to test:
- Reading job files
- Parsing job entry definitions
- Understanding hop connections between entries
- Extracting job metadata

## File Format

Both files are XML-based:
- **Transformations (.ktr)**: Define data transformations with steps and hops
- **Jobs (.kjb)**: Define workflow orchestration with job entries and hops

## Using These Files

These files can be used in unit tests and integration tests for the kettle-mcp server:

```python
# Example usage in tests
from kettle_mcp.kettle import KettleParser

parser = KettleParser()
transformation = parser.parse_transformation("examples/sample_kettle_files/sample_transformation.ktr")
job = parser.parse_job("examples/sample_kettle_files/sample_job.kjb")
```

## Creating New Examples

To create new example files:
1. Use Pentaho Data Integration (Spoon) to design the workflow
2. Save as .ktr (transformation) or .kjb (job)
3. Copy the file to this directory
4. Update this README with a description
