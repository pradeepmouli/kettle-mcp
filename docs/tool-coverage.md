# Kettle MCP Tools - Coverage and Carte Mapping

This document describes the MCP tools exposed by the Kettle server, their mapping to Carte REST API endpoints, and implementation status.

## Tool Categories

### Server Management
| Tool | Carte Endpoint | Local Support | Status |
|------|----------------|---------------|--------|
| `kettle_getServerStatus` | `GET /kettle/status` | ✅ | Planned |

### Transformation Management
| Tool | Carte Endpoint | Local Support | Status |
|------|----------------|---------------|--------|
| `kettle_getTransformation` | - | ✅ (local-only) | Planned |
| `kettle_getTransformationStatus` | `GET /kettle/transStatus` | ✅ | Planned |
| `kettle_addTransformation` | `POST /kettle/addTrans` | ✅ | Planned |
| `kettle_registerTransformation` | `GET /kettle/registerTrans` | ✅ | Planned |
| `kettle_executeTransformation` | `GET /kettle/executeTrans` | ✅ (opt-in) | Planned |
| `kettle_startTransformation` | `GET /kettle/startTrans` | ✅ (opt-in) | Planned |
| `kettle_stopTransformation` | `GET /kettle/stopTrans` | ✅ | Planned |
| `kettle_pauseTransformation` | `GET /kettle/pauseTrans` | ❌ (Carte-only) | Not supported |
| `kettle_removeTransformation` | `GET /kettle/removeTrans` | ✅ | Planned |
| `kettle_cleanupTransformation` | `GET /kettle/cleanupTrans` | ✅ | Planned |

**Not Mapped:**
- `GET /kettle/prepareExec` - Not needed (local execution flow differs)
- `GET /kettle/startExec` - Not needed (local execution flow differs)
- `GET /kettle/runTrans` - Covered by `executeTransformation`
- `GET /kettle/transImage` - Not supported (no rendering)

### Job Management
| Tool | Carte Endpoint | Local Support | Status |
|------|----------------|---------------|--------|
| `kettle_getJob` | - | ✅ (local-only) | Planned |
| `kettle_getJobStatus` | `GET /kettle/jobStatus` | ✅ | Planned |
| `kettle_addJob` | `POST /kettle/addJob` | ✅ | Planned |
| `kettle_registerJob` | `GET /kettle/registerJob` | ✅ | Planned |
| `kettle_executeJob` | `GET /kettle/executeJob` | ✅ (opt-in) | Planned |
| `kettle_startJob` | `GET /kettle/startJob` | ✅ (opt-in) | Planned |
| `kettle_stopJob` | `GET /kettle/stopJob` | ✅ | Planned |
| `kettle_removeJob` | `GET /kettle/removeJob` | ✅ | Planned |

**Not Mapped:**
- `GET /kettle/runJob` - Covered by `executeJob`
- `GET /kettle/jobImage` - Not supported (no rendering)

### Validation & Search
| Tool | Carte Endpoint | Local Support | Status |
|------|----------------|---------------|--------|
| `kettle_validateArtifact` | - | ✅ (local-only) | Planned |
| `kettle_searchArtifacts` | - | ✅ (local-only) | Planned |
| `kettle_listTransformations` | `GET /carte/transformations` | ✅ | Planned |
| `kettle_listJobs` | - | ✅ (local-only) | Planned |

### Edit
| Tool | Carte Endpoint | Local Support | Status |
|------|----------------|---------------|--------|
| `kettle_editArtifact` | - | ✅ (local-only) | Planned |

### Utility
| Tool | Carte Endpoint | Local Support | Status |
|------|----------------|---------------|--------|
| `kettle_getProperties` | `GET /kettle/properties` | ✅ | Planned |
| `kettle_sniffStep` | `GET /kettle/sniffStep` | Partial | Planned |

**Not Mapped:**
- `GET /kettle/nextSequence` - Not needed (local-only, no DB)
- `POST /kettle/addExport` - May add later
- Cluster/Socket endpoints - Out of scope (local-only)

## Carte REST API Coverage

### Fully Supported (Local Implementation)
- Server status and workspace summary
- Transformation/job parsing and status
- Add, register, remove transformations/jobs
- Execute transformations/jobs (opt-in, local-only)
- Validation and search (local-only extensions)
- Edit artifacts (local-only extension)

### Partially Supported
- `sniffStep` - Preview step output (limited to local execution)

### Not Supported
- `pauseTrans` - Requires runtime state management (Carte-only)
- `transImage`, `jobImage` - No rendering capability
- `prepareExec`, `startExec` - Different local execution model
- `nextSequence` - No database integration
- Cluster, socket, slave endpoints - Out of scope

## Differences from Carte

### Local-Only Features
1. **Validation**: Structural validation (orphan steps, unresolved references, disconnected graphs)
2. **Search**: Full-text search across transformations and jobs (name, step type, parameter)
3. **Edit**: Direct XML editing with diff preview and atomic writes

### Execution Differences
1. **Opt-in**: Execution disabled by default, requires environment variable and explicit confirmation
2. **Local-only**: No remote execution, no credential storage
3. **Guardrails**: Strict path constraints, timeouts, resource limits, sanitized logs

### Future Carte REST Support
- Tools are designed to support both local and remote (Carte REST) backends
- Authentication and endpoint configuration will be added in a future phase
- Safety constraints will be maintained for remote execution

## Schema Validation
All tool inputs and outputs are validated using Zod schemas:
- **Input validation**: Ensures correct arguments before tool execution
- **Output validation**: Ensures consistent response structure
- **Type safety**: TypeScript types inferred from Zod schemas

See `src/schemas/tool-io.ts` for complete schema definitions.
