# Deprecate Lifecycle

Runs the existing deprecate extension command as a phased workflow with explicit approval checkpoints.

## Prerequisites

- spec-kit `0.7.0+`
- this extension installed into the target project
- an installed integration CLI such as Copilot, Claude, or Gemini

## Inputs

- `request`: deprecation request, either `NNN reason` or just `reason`
- `integration`: integration key used for command dispatch

If the feature number is omitted, the underlying `speckit.workflows.deprecate` command can still run in interactive selection mode.

## Flow

1. Verify the extension is installed.
2. Run `speckit.workflows.deprecate`.
3. Review the deprecation plan and dependency scan.
4. Run `speckit.plan`.
5. Review the plan for stakeholder alignment, communication, and rollback.
6. Run `speckit.tasks`.
7. Review the task breakdown.
8. Optionally run `speckit.implement` for Phase 1.

## Usage

```bash
specify workflow run workflows/deprecate-lifecycle/workflow.yml --input request="014 low usage and high maintenance burden" --input integration=copilot
```