# Quick Export Reference

## Chat Log Export by Agent

### Claude Code
```bash
claude export --format markdown > session.md
```

### GitHub Copilot (VS Code)
1. Copilot Chat panel → `...` menu → Export Chat History
2. Save as markdown

### Cursor
1. Command Palette (`Ctrl/Cmd+Shift+P`)
2. "Cursor: Export Chat History"

### Aider
```bash
# Auto-logged to:
cat .aider.chat.history.md
```

### Continue
1. Panel → History icon → Export

### Windsurf
1. Cascade panel → History → Export

### Fallback
```bash
# Before starting session:
script -q session.log
```

---

## Spec Files Export

```bash
# Copy spec directory
WORKFLOW="bugfix"  # or: feature, modify, refactor, etc.
SPEC_NUM="001"
cp -r specs/${WORKFLOW}/${SPEC_NUM}-*/ feedback-data/specs/
```

---

## Git History Export

```bash
# Get branch name
BRANCH=$(git branch --show-current)

# Export commit log
git log --oneline main..${BRANCH} > feedback-data/commits.txt

# Export diff summary
git diff --stat main..${BRANCH} > feedback-data/changes.txt
```

---

## Test Results Export

```bash
# Node.js
npm test 2>&1 | tee feedback-data/tests.txt

# Python
pytest 2>&1 | tee feedback-data/tests.txt

# Go
go test ./... 2>&1 | tee feedback-data/tests.txt
```

---

## Bundle for Submission

```bash
# Create feedback bundle
mkdir -p feedback-data
cp session.md feedback-data/chat.md
cp -r specs/${WORKFLOW}/${SPEC_NUM}-*/ feedback-data/specs/
git log --oneline main..HEAD > feedback-data/commits.txt

# Zip it up
zip -r feedback-$(date +%Y%m%d).zip feedback-data/
```

---

## Privacy Checklist

Before sharing, remove:
- [ ] API keys and tokens
- [ ] Passwords and credentials
- [ ] Personal identifiable information
- [ ] Proprietary business logic
- [ ] Customer data

Keep:
- [x] Workflow steps and decisions
- [x] Friction points and clarifications
- [x] Template sections used/skipped
- [x] Error messages and retries
