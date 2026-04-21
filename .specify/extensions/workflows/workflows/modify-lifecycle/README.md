# Modify Lifecycle

Runs the existing modify extension command as a gated workflow.

## Prerequisites

- spec-kit `0.7.0+`
- this extension installed into the target project
- an installed integration CLI such as Copilot, Claude, or Gemini

## Inputs

- `request`: modification request, either `NNN description` or just `description`
- `integration`: integration key used for command dispatch

If the feature number is omitted, the underlying `speckit.workflows.modify` command can still run in interactive selection mode.

## Flow

1. Verify the extension is installed.
2. Run `speckit.workflows.modify`.
3. Review the generated modification spec and impact analysis.
4. Run `speckit.plan`.
5. Review the plan for migration and compatibility details.
6. Run `speckit.tasks`.
7. Review the task breakdown.
8. Optionally run `speckit.implement`.

## Usage

```bash
specify workflow run workflows/modify-lifecycle/workflow.yml --input request="014 add avatar compression" --input integration=copilot
```