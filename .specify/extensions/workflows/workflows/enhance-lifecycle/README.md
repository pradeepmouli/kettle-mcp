# Enhance Lifecycle

Runs the existing enhance extension command as a lightweight workflow with a review checkpoint before implementation.

## Prerequisites

- spec-kit `0.7.0+`
- this extension installed into the target project
- an installed integration CLI such as Copilot, Claude, or Gemini

## Inputs

- `request`: enhancement description
- `integration`: integration key used for command dispatch

## Flow

1. Verify the extension is installed.
2. Run `speckit.workflows.enhance`.
3. Review the generated enhancement document for scope, acceptance criteria, and task count.
4. Optionally run `speckit.implement`.

## Usage

```bash
specify workflow run workflows/enhance-lifecycle/workflow.yml --input request="add inline avatar cropping after upload" --input integration=copilot
```