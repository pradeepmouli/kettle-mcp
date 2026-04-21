# Refactor Lifecycle

Runs the existing refactor extension command as a gated workflow with explicit safety checks.

## Prerequisites

- spec-kit `0.7.0+`
- this extension installed into the target project
- an installed integration CLI such as Copilot, Claude, or Gemini

## Inputs

- `request`: refactor description
- `integration`: integration key used for command dispatch

## Flow

1. Verify the extension is installed.
2. Run `speckit.workflows.refactor`.
3. Review the refactor spec, testing gaps, and behavioral snapshot.
4. Run `speckit.plan`.
5. Review the plan for test-first sequencing and safety checkpoints.
6. Run `speckit.tasks`.
7. Review the task breakdown.
8. Optionally run `speckit.implement`.

## Usage

```bash
specify workflow run workflows/refactor-lifecycle/workflow.yml --input request="split notification service into smaller modules" --input integration=copilot
```