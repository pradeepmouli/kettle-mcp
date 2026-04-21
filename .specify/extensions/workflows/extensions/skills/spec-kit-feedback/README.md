# Spec-Kit Feedback Skill

A Claude Code skill that helps capture workflow usage data for improving spec-kit-extensions.

## What It Does

This skill automatically activates during spec-kit workflows to:

1. **Track friction** - Notes when clarification or retries are needed
2. **Monitor compliance** - Observes which quality gates are followed
3. **Summarize sessions** - Provides end-of-workflow summary
4. **Guide export** - Reminds and helps export chat logs

## Installation

This skill is installed automatically by `specify-extend` when using Claude Code:

```bash
specify-extend --all
```

Or manually copy to your project:

```bash
cp -r .specify/extensions/skills/spec-kit-feedback .claude/skills/
```

## How It Works

The skill activates when it detects:
- Workflow completion (review passed, PR created)
- Friction patterns (clarifications, retries, confusion)
- Quality gate issues (skipped gates, problems)
- User mentions of prompt/template issues

## End-of-Session Summary

When a workflow completes, you'll see:

```
📊 Session Summary

Workflow: bugfix
Status: Complete
Duration: ~25 min

Observations:
- Clarifications needed: 2
- Retries/corrections: 1
- Gates followed: 4/4

Friction Points:
- Regression test timing was unclear

To contribute this feedback:
1. Export chat: claude export --format markdown > session.md
2. Share with spec-kit team
```

## Exporting Data

### Quick Export

```bash
claude export --format markdown > session.md
```

### Full Bundle

```bash
mkdir feedback
claude export --format markdown > feedback/chat.md
cp -r specs/bugfix/001-*/ feedback/specs/
git log --oneline main..HEAD > feedback/commits.txt
```

## Privacy

Before sharing feedback:
- Remove API keys and credentials
- Redact personal information
- Remove proprietary business logic
- Keep workflow structure and friction points

## Contributing Feedback

Your feedback helps improve spec-kit for everyone:

1. **GitHub Issue** - Open issue with exported session
2. **RL Intake** - Maintainers analyze with `/rl-intake`
3. **Discussion** - Share patterns in GitHub Discussions

## Files

```
spec-kit-feedback/
├── SKILL.md              # Core skill definition
├── README.md             # This file
└── references/
    └── quick-export.md   # Export command reference
```
