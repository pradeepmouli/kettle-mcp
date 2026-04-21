# Spec-Kit 0.3.0 — Feature Opportunities for spec-kit-extensions

**Date**: 2026-03-14
**Spec-Kit Version**: 0.3.0 (released 2026-03-13)
**Current spec-kit-extensions**: CLI v2.2.1 / Templates v3.2.0

---

## 1. What's New in Spec-Kit 0.3.0

| Feature | Description |
|---------|-------------|
| **Pluggable Preset System** | `preset.yml` manifests, `PresetResolver`, `specify preset search\|add\|list\|remove\|resolve\|info` commands, template resolution stack (overrides → presets → extensions → core), multi-catalog support |
| **`specify doctor`** | Project health diagnostics command |
| **`/selftest.extension`** | Core extension for testing other extensions |
| **`init-options.json`** | `specify init` now persists chosen options to `.specify/init-options.json` |
| **AI Skills Propagation** | `--ai-skills` flag during init propagates skills to presets |
| **Qwen → Markdown** | Qwen Code CLI migrated from TOML to Markdown format |
| **`agy` Deprecated** | Antigravity explicit command support deprecated |
| **Bash Security Hardening** | Scripts hardened against shell injection |
| **RFC-Aligned Catalog** | Quality-of-life improvements for catalog integration |

---

## 2. Enhancement Opportunities

### 2.1 Preset System Integration (HIGH VALUE)

**The biggest opportunity.** Spec-kit 0.3.0's pluggable preset system introduces a template resolution stack:

```
overrides → presets → extensions → core
```

Today, spec-kit-extensions relies on monkey-patching `common.sh` to support extension branch patterns. The preset system could **eliminate this fragility entirely** by providing a first-class way to register:

- Custom branch validation patterns
- Workflow templates
- Creation scripts
- Constitution additions

**Proposed action**: Create a `preset.yml` manifest that packages our 7 workflows as a spec-kit preset:

```yaml
name: spec-kit-extensions
version: 3.2.0
description: 7 production workflows for the complete development lifecycle
author: pradeepmouli
requires: ">=0.3.0"

templates:
  - workflows/bugfix/
  - workflows/hotfix/
  - workflows/enhance/
  - workflows/refactor/
  - workflows/modify/
  - workflows/deprecate/
  - workflows/cleanup/
  - workflows/baseline/

scripts:
  bash:
    - scripts/bash/create-bugfix.sh
    - scripts/bash/create-hotfix.sh
    - scripts/bash/create-enhance.sh
    - scripts/bash/create-refactor.sh
    - scripts/bash/create-modification.sh
    - scripts/bash/create-hotfix.sh
    - scripts/bash/create-deprecate.sh
    - scripts/bash/create-cleanup.sh
    - scripts/bash/create-baseline.sh
    - scripts/bash/extension-utils.sh

branch_patterns:
  - "baseline/###-"
  - "bugfix/###-"
  - "enhance/###-"
  - "modify/###^###-"
  - "refactor/###-"
  - "hotfix/###-"
  - "deprecate/###-"
  - "cleanup/###-"
```

**Benefits**:
- Users install via `specify preset add spec-kit-extensions` instead of a separate CLI tool
- No more `common.sh` patching — branch patterns registered through preset system
- Automatic template resolution — spec-kit handles the plumbing
- Discoverable via `specify preset search`
- Survives `specify init --force` upgrades (presets are re-applied)

**Investigation needed**: Verify whether `branch_patterns` is a supported preset field, or if branch validation is still hardcoded. If the preset system doesn't support branch patterns yet, this could be proposed as a spec-kit enhancement.

---

### 2.2 `init-options.json` for Smarter Agent Detection (MEDIUM VALUE)

Spec-kit 0.3.0 persists the user's `specify init` options to `.specify/init-options.json`. This gives us a **reliable source of truth** for which agent the user chose, instead of our heuristic directory-scanning approach.

**Current approach** (`specify_extend.py:752-844`): Scans for `.claude/`, `.github/agents/`, `.cursor/` directories — fragile, can detect wrong agent if multiple directories exist.

**Enhancement**: Check `init-options.json` first, fall back to heuristic detection for pre-0.3.0 installations:

```python
def detect_agent_from_init_options(repo_root: Path) -> Optional[str]:
    """Read agent from spec-kit's init-options.json (0.3.0+)"""
    init_options = repo_root / ".specify" / "init-options.json"
    if init_options.exists():
        import json
        options = json.loads(init_options.read_text())
        return options.get("ai") or options.get("agent")
    return None
```

This should be tried first in `detect_agent()`, with the existing directory-scanning as fallback.

---

### 2.3 `specify doctor` Health Checks (MEDIUM VALUE)

`specify doctor` is a new diagnostics command. We can add extension-specific health checks that help users debug installation issues:

**Checks to add**:
1. Extension scripts installed and executable in `.specify/scripts/bash/`
2. `common.sh` patch applied and includes latest patterns
3. `enabled.conf` exists and has valid workflow entries
4. Constitution includes workflow quality gates
5. Extension commands installed for detected agent
6. Global numbering consistency (no collisions between workflow types)

**Implementation**: Investigate whether `specify doctor` supports plugin checks (e.g., a `.specify/doctor.d/` directory for custom check scripts), or whether we need to contribute upstream.

---

### 2.4 Self-Test Extension (MEDIUM VALUE)

The new `/selftest.extension` provides a framework for testing extensions. We should add self-tests that validate our installation:

**Tests to include**:
- All 8 `create-*.sh` scripts execute successfully with `--json` flag
- Branch patterns are accepted by patched `check_feature_branch()`
- Template placeholders (`{{BRANCH_NAME}}`, etc.) are properly substituted
- Global numbering produces correct sequential numbers
- Extension commands are valid markdown with expected structure

This would give users a way to verify their installation: `specify selftest spec-kit-extensions`

---

### 2.5 Qwen Markdown Migration (QUICK WIN)

Spec-kit 0.3.0 migrated Qwen from TOML to Markdown. Our `AGENT_CONFIG` still has `"file_extension": "toml"` for Qwen.

**Change needed** (`specify_extend.py:115-119`):
```python
"qwen": {
    "name": "Qwen Code",
    "folder": ".qwen/commands",
    "file_extension": "md",  # Changed from "toml" — spec-kit 0.3.0
    "requires_cli": True,
},
```

Also update Gemini, which is still set to TOML (`specify_extend.py:98-102`):
```python
"gemini": {
    "name": "Gemini CLI",
    "folder": ".gemini/commands",
    "file_extension": "toml",  # Verify against spec-kit 0.3.0
    "requires_cli": True,
},
```

The TOML fallback warning at line 1692 can be simplified once both agents use Markdown.

---

### 2.6 `agy` Deprecation Notice (QUICK WIN)

Spec-kit 0.3.0 deprecated explicit `agy` support. We should:
- Keep the agent config (backward compat)
- Emit a deprecation warning when `--ai agy` is used
- Update the `--ai` help text to note the deprecation

---

### 2.7 AI Skills Propagation Alignment (RESOLVED IN LATER CLI)

This note is now historical.

Later CLI work removed the local `--ai-skills` implementation and the repo-local skill fan-out installer. Skill registration is now delegated to native spec-kit handling.

What still matters:
- Verify repository skill sources in `.agents/skills/` remain compatible with current upstream spec-kit expectations
- Do not reintroduce repo-local `.github/skills/` or `.claude/skills/` fan-out unless upstream behavior requires it
- Prefer documenting observed upstream integration behavior over maintaining parallel local installers

---

### 2.8 Preset Catalog Registration (STRATEGIC)

Spec-kit 0.3.0 has multi-catalog support with `specify preset catalog list|add|remove`. We should:
1. Create a `catalog-entry.json` for the preset catalog (we already have one for extensions)
2. Register spec-kit-extensions in the community preset catalog
3. Enable `specify preset search spec-kit-extensions` discovery

This makes installation a one-liner: `specify preset add spec-kit-extensions`

---

## 3. Implementation Roadmap

### Phase 1: Quick Wins (This Release)

| Item | Effort | Impact |
|------|--------|--------|
| Update Qwen `file_extension` to `"md"` | 1 line | Fixes Qwen users |
| Add `agy` deprecation warning | ~10 lines | Clear communication |
| Add `init-options.json` agent detection | ~15 lines | Better detection reliability |
| Verify Gemini TOML status vs 0.3.0 | Research | Prevent same issue |

### Phase 2: Preset Integration (Next Release)

| Item | Effort | Impact |
|------|--------|--------|
| Create `preset.yml` manifest | Medium | First-class integration |
| Test preset installation flow | Medium | Validate approach |
| Register in preset catalog | Small | Discoverability |
| Evaluate dropping `common.sh` patching | Large | Eliminate #1 fragility |

### Phase 3: Ecosystem Integration (Future)

| Item | Effort | Impact |
|------|--------|--------|
| Add `specify doctor` health checks | Medium | Better debugging |
| Create self-test extension | Medium | Installation validation |
| AI skills propagation alignment | Small | Consistency |

---

## 4. Key Decisions Needed

1. **Preset vs. Extension**: Should we package as a preset (new in 0.3.0) or continue as an extension? The preset system has template resolution built in, which could replace our patching approach. Need to verify if the preset system supports custom branch validation patterns.

2. **Qwen/Gemini TOML removal**: Should we remove TOML support entirely, or keep backward compatibility for users on older spec-kit versions? Given our stated requirement of `v0.2.0+`, dropping TOML may be acceptable.

3. **Minimum version bump**: Should we bump minimum spec-kit version from `v0.2.0+` to `v0.3.0+`? This unlocks preset/doctor features but drops support for 0.2.x users who installed just days ago.

---

## 5. References

- [Spec-Kit Releases](https://github.com/github/spec-kit/releases)
- [Spec-Kit CHANGELOG](https://github.com/github/spec-kit/blob/main/CHANGELOG.md)
- [Spec-Kit Upgrade Guide](https://github.com/github/spec-kit/blob/main/docs/upgrade.md)
- [Existing Compatibility Report](./COMPATIBILITY-REPORT.md) (generated against v0.0.22, 2025-12-29)
