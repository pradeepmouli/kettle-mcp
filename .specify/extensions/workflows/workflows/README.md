# Workflow Engine Assets

These workflows are standalone spec-kit workflow definitions for spec-kit `0.7.0+`.

They orchestrate the existing extension commands with explicit review gates and an optional implement step:

- `bugfix-lifecycle`
- `enhance-lifecycle`
- `modify-lifecycle`
- `refactor-lifecycle`
- `hotfix-lifecycle`
- `deprecate-lifecycle`

They are additive.

- They do not replace the existing `/speckit.workflows.*` commands.
- They are not installed automatically by `specify extension add` because spec-kit extensions do not currently install workflow assets.
- They assume this extension is already installed so the referenced commands are available to the selected integration.

Run a workflow directly from this repository:

```bash
specify workflow run workflows/bugfix-lifecycle/workflow.yml --input request="login button broken on mobile" --input integration=copilot
```

Inspect a workflow before running it:

```bash
specify workflow info workflows/bugfix-lifecycle/workflow.yml
```

Resume after a rejected review gate:

```bash
specify workflow resume <run-id>
```