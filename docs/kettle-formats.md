# Pentaho Kettle File Formats

## Overview

Pentaho Kettle (also known as Pentaho Data Integration or PDI) uses XML-based file formats for storing ETL workflows. There are two primary file types:

- **Transformations (.ktr)**: Data transformation pipelines
- **Jobs (.kjb)**: Workflow orchestration and job scheduling

## Transformation Files (.ktr)

Transformation files define data flow pipelines with steps that process data.

### Basic Structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<transformation>
  <info>
    <name>transformation_name</name>
    <description>Description of what this transformation does</description>
    <!-- Metadata fields -->
  </info>
  
  <step>
    <name>Step Name</name>
    <type>StepType</type>
    <!-- Step-specific configuration -->
  </step>
  
  <order>
    <hop>
      <from>Source Step</from>
      <to>Target Step</to>
      <enabled>Y</enabled>
    </hop>
  </order>
</transformation>
```

### Key Elements

#### Info Section
- **name**: Transformation name
- **description**: Detailed description
- **parameters**: Input parameters
- **log**: Logging configuration
- **created_user/modified_user**: User tracking
- **created_date/modified_date**: Timestamp tracking

#### Steps
Each step represents a data processing operation:
- **name**: Unique step identifier
- **type**: Step type (e.g., TableInput, SelectValues, TextFileOutput)
- **description**: Optional description
- **distribute**: Whether to distribute data across copies
- **copies**: Number of parallel copies
- Step-specific configuration varies by type

#### Hops (Order)
Hops define the data flow between steps:
- **from**: Source step name
- **to**: Target step name
- **enabled**: Y/N to enable/disable the hop

### Common Step Types

- **TableInput**: Read data from database tables
- **TableOutput**: Write data to database tables
- **TextFileInput**: Read from text/CSV files
- **TextFileOutput**: Write to text/CSV files
- **SelectValues**: Select, rename, or reorder fields
- **FilterRows**: Filter rows based on conditions
- **SortRows**: Sort rows by field values
- **MergeJoin**: Join data from multiple streams
- **RowGenerator**: Generate test data
- **Sequence**: Add sequence numbers
- **Calculator**: Perform calculations
- **StringOperations**: String manipulation

## Job Files (.kjb)

Job files define workflow orchestration with job entries that execute tasks.

### Basic Structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<job>
  <name>job_name</name>
  <description>Description of what this job does</description>
  
  <entries>
    <entry>
      <name>Entry Name</name>
      <type>EntryType</type>
      <!-- Entry-specific configuration -->
    </entry>
  </entries>
  
  <hops>
    <hop>
      <from>Source Entry</from>
      <to>Target Entry</to>
      <enabled>Y</enabled>
      <evaluation>Y</evaluation>
      <unconditional>Y</unconditional>
    </hop>
  </hops>
</job>
```

### Key Elements

#### Job Entries
Each entry represents a task or workflow step:
- **name**: Unique entry identifier
- **type**: Entry type (e.g., TRANS, JOB, SUCCESS, ABORT)
- **description**: Optional description
- Entry-specific configuration

#### Hops
Hops define workflow execution order:
- **from**: Source entry name
- **to**: Target entry name
- **enabled**: Y/N to enable/disable
- **evaluation**: Y (success) / N (failure) - when to follow this hop
- **unconditional**: Y/N - always follow regardless of result

### Common Job Entry Types

- **START**: Starting point of the job
- **TRANS**: Execute a transformation
- **JOB**: Execute another job
- **SUCCESS**: Mark job as successful
- **ABORT**: Abort the job execution
- **WRITE_TO_LOG**: Write message to log
- **MAIL**: Send email
- **SQL**: Execute SQL statement
- **SHELL**: Execute shell script
- **FILE_EXISTS**: Check if file exists
- **DELETE_FILES**: Delete files
- **CREATE_FOLDER**: Create directory
- **COPY_FILES**: Copy files
- **MOVE_FILES**: Move files
- **HTTP**: Make HTTP request
- **FTP**: FTP operations
- **SFTP**: SFTP operations

## File Metadata

Both file types include metadata sections:

### Logging Configuration
- Transaction logging settings
- Log table configuration
- Performance capture settings

### Parameters
- Named parameters with default values
- Used for runtime configuration

### Slave Servers
- Remote execution configuration
- Clustering setup

### Shared Objects
- Shared connections
- Shared parameters

## XML Parsing Considerations

### Namespaces
Kettle files typically don't use XML namespaces.

### Encoding
Files are UTF-8 encoded.

### Special Characters
XML entities for special characters:
- `&lt;` for <
- `&gt;` for >
- `&amp;` for &
- `&quot;` for "
- `&apos;` for '

### CDATA Sections
Complex content (like SQL queries) may be wrapped in CDATA:
```xml
<sql><![CDATA[
  SELECT * FROM table WHERE column = 'value'
]]></sql>
```

## Version Compatibility

Kettle file formats have evolved over time:
- **Kettle 3.x-7.x**: Similar XML structure
- **Kettle 8.x+**: Minor additions, backward compatible
- **Kettle 9.x**: Latest format with additional features

When creating or updating files, consider:
- Target Kettle version
- Feature availability
- Deprecated elements

## Best Practices

1. **Preserve Structure**: Maintain XML hierarchy when editing
2. **Validate XML**: Ensure well-formed XML after modifications
3. **Version Control**: Track changes in git with meaningful commits
4. **Documentation**: Keep descriptions up-to-date
5. **Naming**: Use clear, descriptive names for steps/entries
6. **Parameters**: Use parameters for configurable values
7. **Error Handling**: Include proper error handling in jobs
8. **Testing**: Test transformations and jobs after modifications

## References

- [Pentaho Kettle GitHub](https://github.com/pentaho/pentaho-kettle)
- [Pentaho Documentation](https://help.hitachivantara.com/Documentation/Pentaho)
- [Community Forums](https://forums.pentaho.com/)
