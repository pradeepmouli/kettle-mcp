# Carte REST API Endpoint Mapping to MCP Tools

This document maps the Carte REST API endpoints to proposed MCP tool definitions for local (filesystem) implementation. It serves as the basis for tool coverage and future REST support.

## Server Management

- **GET /kettle/status**: Get server status (local: summarize workspace, running jobs/transforms)
- **GET /kettle/stopCarte**: Stop server (local: not applicable)

## Transformation Management

- **POST /kettle/addTrans**: Add transformation (local: import/upload .ktr)
- **GET /kettle/registerTrans**: Register transformation (local: scan/add .ktr from filesystem)
- **GET /kettle/transStatus**: Get transformation status (local: parse .ktr, report structure/validation)
- **GET /kettle/startTrans**: Start transformation (local: execute .ktr, opt-in)
- **GET /kettle/stopTrans**: Stop transformation (local: stop local execution, if running)
- **GET /kettle/pauseTrans**: Pause transformation (local: not applicable)
- **GET /kettle/removeTrans**: Remove transformation (local: delete .ktr or unregister)
- **GET /kettle/executeTrans**: Execute transformation synchronously (local: run .ktr, return result)
- **GET /kettle/runTrans**: Run transformation asynchronously (local: run .ktr in background)
- **GET /kettle/prepareExec**: Prepare transformation execution (local: dry-run/validate .ktr)
- **GET /kettle/startExec**: Start prepared transformation (local: not applicable)
- **GET /kettle/cleanupTrans**: Cleanup transformation (local: cleanup temp files/resources)
- **GET /kettle/transImage**: Get transformation image (local: not supported)

## Job Management

- **POST /kettle/addJob**: Add job (local: import/upload .kjb)
- **GET /kettle/registerJob**: Register job (local: scan/add .kjb from filesystem)
- **GET /kettle/jobStatus**: Get job status (local: parse .kjb, report structure/validation)
- **GET /kettle/startJob**: Start job (local: execute .kjb, opt-in)
- **GET /kettle/stopJob**: Stop job (local: stop local execution, if running)
- **GET /kettle/removeJob**: Remove job (local: delete .kjb or unregister)
- **GET /kettle/executeJob**: Execute job synchronously (local: run .kjb, return result)
- **GET /kettle/runJob**: Run job asynchronously (local: run .kjb in background)
- **GET /kettle/jobImage**: Get job image (local: not supported)

## Utility Endpoints

- **GET /kettle/properties**: Get properties (local: show config/settings)
- **GET /kettle/nextSequence**: Next sequence value (local: not supported)
- **GET /kettle/sniffStep**: Sniff step (local: preview step output, if possible)
- **POST /kettle/addExport**: Add export (local: export resources, if needed)

## Cluster/Socket Management

- Not applicable for local-only tools (cluster, socket endpoints skipped)

## JAX-RS REST Endpoints

- **GET /carte/systemInfo**: System info (local: show environment info)
- **GET /carte/configDetails**: Config details (local: show config)
- **GET /carte/transformations**: List transformations (local: list .ktr files)
- **GET /carte/transformations/detailed**: List transformations detailed (local: list .ktr files with metadata)

## Notes

- All execution endpoints are local-only, opt-in, and guarded.
- Image endpoints are not supported (no rendering planned).
- Cluster, socket, and slave endpoints are not mapped (out of scope for local tools).
- Some endpoints may be partially supported or have local-only semantics.

---

This mapping will be used to define the initial MCP tool set and guide Zod schema and contract design.
