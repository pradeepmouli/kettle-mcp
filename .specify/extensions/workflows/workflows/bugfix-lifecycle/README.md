# Bugfix Lifecycle

Runs the existing bugfix extension command as a full spec-kit workflow with explicit review gates.

## Prerequisites

- spec-kit `0.7.0+`
- this extension installed into the target project
- an installed integration CLI such as Copilot, Claude, or Gemini

## Inputs

- `request`: bug description
- `integration`: integration key used for command dispatch

## Flow

1. Verify `spec-kit-extensions` is installed in the project.
2. Run `speckit.workflows.bugfix` to initialize the bugfix branch and report.
3. Pause at a review gate for the generated bug report.
4. Run `speckit.plan`.
5. Pause at a review gate for the plan.
6. Run `speckit.tasks`.
7. Pause at a review gate for the task breakdown.
8. Optionally run `speckit.implement`.

## Usage

```bash
specify workflow run workflows/bugfix-lifecycle/workflow.yml --input request="login button broken on mobile" --input integration=copilot
```

Rejecting a review gate pauses the run so you can refine artifacts, then resume with:

```bash
specify workflow resume <run-id>
```