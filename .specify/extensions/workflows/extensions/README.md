# Specify Extension System

The extension system provides additional workflow types beyond the core `/specify` workflow for feature development.

## Available Workflows

### Core Workflow (Built-in)
- **`/specify`** - Create new features from scratch (greenfield development)

### Extension Workflows
- **`/speckit.baseline`** - Establish project baseline and track all changes by workflow type
- **`/speckit.bugfix`** - Bug remediation with regression-test-first approach
- **`/speckit.modify`** - Extend or modify existing features with impact analysis
- **`/speckit.refactor`** - Improve code quality while preserving behavior with metrics
- **`/speckit.hotfix`** - Emergency production fixes with expedited checkpoint process
- **`/speckit.deprecate`** - Planned sunset of features with 3-phase migration

## Enabling Extensions

Extensions are enabled by default in this project. To disable an extension, edit `.specify/extensions/enabled.conf` and comment out the workflow.

## Workflow Selection Guide

| Scenario | Use This Workflow |
|----------|------------------|
| Establishing project context | `/speckit.baseline` |
| Building new feature | `/specify` |
| Fixing a bug | `/speckit.bugfix` |
| Adding fields to existing feature | `/speckit.modify` |
| Extracting duplicate code | `/speckit.refactor` |
| Production is down | `/speckit.hotfix` |
| Removing old feature | `/speckit.deprecate` |

## Extension Structure

Each workflow extension contains:
- **Template files** - Markdown templates for specs and documentation
- **Command definition** - `.claude/commands/speckit.{workflow}.md` for AI agents
- **Bash scripts** - `.specify/scripts/bash/create-{workflow}.sh` for automation
- **Checkpoint workflow** - Multi-phase approach with review points (plan → tasks → implement)

## Optional: Claude Code Skills

For Claude Code users, an optional feedback skill is available that helps capture workflow usage data:

### spec-kit-feedback Skill

Automatically tracks friction points and reminds to export chat logs for improving spec-kit.

**Install manually:**
```bash
cp -r .specify/extensions/skills/spec-kit-feedback .claude/skills/
```

**What it does:**
- Activates at workflow completion
- Notes friction points (clarifications, retries)
- Provides end-of-session summary
- Guides chat log export

See `extensions/skills/spec-kit-feedback/README.md` for details.

## Creating Custom Extensions

See `docs/extension-development.md` for guide on creating your own workflow extensions.

## Compatibility

These extensions are designed to be:
- **Agent-agnostic** - Work with Claude Code, GitHub Copilot, Gemini CLI, etc.
- **Non-breaking** - Don't modify core Specify functionality
- **Spec Kit compatible** - Follow GitHub Spec Kit conventions for future contribution

## Version

Extension Templates Version: v3.4.1
CLI Tool Version: v2.5.1
Compatible with Specify Core: v0.3.1+

## License

Same license as parent project (Specify/Spec Kit)
