# Hotfix Lifecycle

Runs the existing hotfix extension command as an expedited workflow with incident review, planning, and deployment checkpoints.

## Prerequisites

- spec-kit `0.7.0+`
- this extension installed into the target project
- an installed integration CLI such as Copilot, Claude, or Gemini

## Inputs

- `request`: incident description
- `integration`: integration key used for command dispatch

## Flow

1. Verify the extension is installed.
2. Run `speckit.workflows.hotfix`.
3. Review the incident log and severity assessment.
4. Run `speckit.plan`.
5. Review the expedited plan and rollback assumptions.
6. Run `speckit.tasks`.
7. Review the minimal task breakdown.
8. Optionally run `speckit.implement`.

## Usage

```bash
specify workflow run workflows/hotfix-lifecycle/workflow.yml --input request="checkout service returns 500s for subscription renewals" --input integration=copilot
```