# Hotfix Workflow

## Overview

The hotfix workflow handles emergency production issues that require immediate resolution. It's the **only workflow that bypasses Test-Driven Development** by allowing fixes to be deployed before comprehensive tests are written.

## When to Use

Use `/speckit.hotfix` when:

- Production service is down or severely degraded
- Data loss or corruption is actively occurring
- Security vulnerability needs immediate patching
- Critical functionality is completely broken
- Every minute of downtime costs money/reputation

**Do NOT use `/speckit.hotfix` for**:
- Non-urgent bugs → use `/speckit.bugfix` instead
- Planned changes → use `/speckit.modify` or `/speckit.specify` instead
- Known issues that can wait → use normal workflow
- Issues only affecting staging/dev → fix normally

## Severity Levels

- **P0 (Critical)**: Service down, data loss, security breach
  - Target resolution: < 1 hour
  - All hands on deck
  - Skip most process

- **P1 (Major)**: Key feature broken, many users affected
  - Target resolution: < 4 hours
  - Wake on-call if needed
  - Streamlined process

- **P2 (Significant)**: Important feature degraded, workaround available
  - Target resolution: < 8 hours
  - During business hours
  - Expedited but careful

## Process

### Phase 1: Immediate Response (URGENT)
1. **Assess** - How bad is it? How many users affected?
2. **Notify** - Alert incident commander, stakeholders
3. **Reproduce** - Confirm the issue exists
4. **Investigate** - Find root cause quickly

### Phase 2: Fix Implementation (FAST BUT SAFE)
1. **Strategy** - Quick fix? Rollback? Feature flag disable?
2. **Implement** - Minimal code changes to stop the bleeding
3. **Test locally** - Verify fix works, check for side effects
4. **Quick review** - 5-minute sanity check (skip if P0)

### Phase 3: Deployment (URGENT)
1. **Rollback plan** - Know how to undo if it makes things worse
2. **Deploy** - Get the fix live
3. **Verify** - Confirm issue resolved in production
4. **Monitor** - Watch error rates, be ready to rollback

### Phase 4: Monitoring (24-48 Hours)
1. **Active monitoring** - First 2 hours, watch closely
2. **Extended monitoring** - 24 hours, check regularly
3. **Stability confirmation** - Verify no related issues

### Phase 5: Post-Incident (Within 48 Hours)
1. **Regression test** - Write test NOW (was deferred during emergency)
2. **Full test suite** - Ensure no regressions
3. **Post-mortem** - Required within 48 hours
4. **Prevention tasks** - Create follow-up work
5. **Documentation** - Update runbooks, architecture docs

## Quality Gates

- ✅ Severity MUST be assessed (P0/P1/P2)
- ✅ Rollback plan MUST be prepared before deployment
- ✅ Fix MUST be deployed and verified before writing tests (exception to TDD)
- ✅ Post-mortem MUST be completed within 48 hours of resolution
- ✅ Regression test MUST be added post-deployment

## Files Created

```
specs/
└── hotfix/
    └── 001-database-connection-pool/
    ├── hotfix.md                    # Incident log
    ├── post-mortem.md               # Required within 48 hours
    ├── plan.md                      # Expedited fix plan (created by /speckit.plan)
    ├── tasks.md                     # Emergency tasks (created by /speckit.tasks)
    └── POST_MORTEM_REMINDER.txt     # Reminder file
```

## Command Usage

```bash
/speckit.hotfix "database connection pool exhausted causing 503 errors"
```

This will:
1. Create branch `hotfix/001-database-connection-pool`
2. Generate `hotfix.md` with incident timestamp
3. Generate `post-mortem.md` template
4. Create `POST_MORTEM_REMINDER.txt`
5. Set `SPECIFY_HOTFIX` environment variable
6. Show "Next Steps" for expedited emergency workflow

**Next steps after running the command (URGENT):**
1. Quick assessment - severity (P0/P1/P2), impact, affected users
2. Notify stakeholders - incident commander, on-call team
3. Run `/speckit.plan` to create fast-track fix plan (skip extensive analysis)
4. Quick review - is the approach safe? Do we have rollback?
5. Run `/speckit.tasks` to create immediate action tasks
6. Run `/speckit.implement` to deploy fix
7. **Post-deployment (within 24-48 hours)**: Write regression test, complete post-mortem

## Checkpoint-Based Workflow

The hotfix workflow uses an **expedited checkpoint approach** for emergencies while still providing critical review points:

### Phase 1: Incident Response
- **Command**: `/speckit.hotfix "incident description"`
- **Creates**: `hotfix.md` with incident timestamp and `post-mortem.md` template
- **Checkpoint**: Quick assessment - P0/P1/P2 severity? How many users affected? Notify stakeholders immediately.

### Phase 2: Emergency Planning (FAST)
- **Command**: `/speckit.plan`
- **Creates**: `plan.md` with fast-track fix approach
- **Checkpoint**: Quick review (2-5 minutes) - Is the fix safe? Do we have a rollback plan? For P0, this may be skipped.

### Phase 3: Task Creation (URGENT)
- **Command**: `/speckit.tasks`
- **Creates**: `tasks.md` with immediate action tasks
- **Checkpoint**: Quick sanity check - Are tasks in the right order? Critical steps covered?

### Phase 4: Emergency Deployment
- **Command**: `/speckit.implement`
- **Executes**: Fix deployment with monitoring
- **Result**: Issue resolved, service restored

### Phase 5: Post-Incident (Required within 48 hours)
- Write regression test (deferred from emergency)
- Complete post-mortem document
- Create prevention tasks
- Update documentation

**Why checkpoints matter for hotfixes**: Even in emergencies, a 2-minute review of the fix approach can prevent making the outage worse. The checkpoint before deployment ensures you have a rollback plan. Post-incident requirements ensure the issue is properly prevented from recurring.

## Example Hotfix Document

```markdown
# Hotfix: Database Connection Pool Exhausted

**Hotfix ID**: hotfix-001
**Branch**: `hotfix/001-database-connection-pool`
**Severity**: [X] P0 (Critical - Service Down)
**Status**: [X] Fix Deployed | [ ] Monitoring | [ ] Post-Mortem Complete

## Incident Timeline

**Incident Start**: 2025-10-01 14:32:18 UTC
**Detection**: 2025-10-01 14:33:05 UTC - Datadog alert triggered
**Investigation Start**: 2025-10-01 14:35:00 UTC
**Root Cause Identified**: 2025-10-01 14:48:00 UTC
**Fix Deployed**: 2025-10-01 15:12:00 UTC
**Incident End**: 2025-10-01 15:18:00 UTC
**Total Duration**: 46 minutes

## Immediate Fix Applied

### What Changed
**Files Modified**:
- app/db/connection.ts - lines 15-20: Increased max connections from 10 to 50
- app/db/connection.ts - lines 28-32: Added connection timeout of 30s

**Commit SHA**: a3b4c5d

### Why This Fix
Connection pool of 10 was insufficient for production traffic. During high load, all connections were held and new requests timed out causing 503 errors. Increasing pool size allows more concurrent database operations.

## Impact

### Users Affected
- **Estimated Users**: ~5,000 (all active users during incident)
- **Geographic Region**: Global
- **User Segments**: All user types

### Downtime
- **Total Downtime**: 46 minutes (service completely unavailable)

### Business Impact
- **Revenue Impact**: ~$1,200 estimated (based on avg revenue/minute)
- **Support Tickets**: 47 tickets created during incident
- **SLA Breach**: Yes (99.9% uptime SLA)

## Root Cause (Quick Analysis)

### What Happened
Database connection pool configured with max 10 connections. Under high load, all 10 connections were held by long-running queries. New requests couldn't acquire connections and timed out.

### Why It Happened
- Default configuration from development environment was used in production
- Load testing didn't simulate realistic concurrent user patterns
- No monitoring on connection pool utilization

### Why It Wasn't Caught Earlier
- [X] No monitoring for this scenario (connection pool metrics not tracked)
- [X] Load testing insufficient (didn't simulate production traffic)
```

## Post-Mortem Document

Required within 48 hours of resolution:

```markdown
# Post-Mortem: Database Connection Pool Exhausted

**Incident Date**: 2025-10-01
**Post-Mortem Date**: 2025-10-02
**Participants**: Alice (Incident Commander), Bob (Backend), Carol (DevOps)

## Executive Summary
Production database ran out of available connections during high traffic, causing complete service outage for 46 minutes affecting 5,000 users. Root cause was insufficient connection pool size carried over from dev config. Fixed by increasing pool size and adding timeout.

## Timeline
| Time | Event | Who | Notes |
|------|-------|-----|-------|
| 14:32 | Incident began | System | Traffic spike started |
| 14:33 | Detection | Datadog | Alert fired |
| 14:35 | Investigation | Alice | Checked error logs |
| 14:48 | Root cause found | Bob | Pool size too small |
| 15:12 | Fix deployed | Bob | Increased pool to 50 |
| 15:18 | Verified resolved | Alice | Error rate back to 0 |

## Root Cause Analysis

**Five Whys**:
1. Why did service go down? → Database connections exhausted
2. Why were connections exhausted? → Pool size only 10
3. Why was pool size only 10? → Dev config used in production
4. Why was dev config used? → No environment-specific review
5. Why no review? → Deploy checklist didn't include config review

**Root Cause**: Development configuration was deployed to production without capacity planning for production load.

## Action Items

### Immediate (This Week)
- [X] **AI-001**: Add connection pool metrics to monitoring
  - Owner: Carol
  - Due: 2025-10-03
  - Why: Prevents recurrence

- [ ] **AI-002**: Review all other config values (timeout, pool sizes, etc.)
  - Owner: Bob
  - Due: 2025-10-05
  - Why: Find similar issues proactively

### Short-Term (This Month)
- [ ] **AI-003**: Create environment config checklist for deployments
  - Owner: Alice
  - Due: 2025-10-15
  - Why: Prevents wrong config in production

### Long-Term (This Quarter)
- [ ] **AI-004**: Implement load testing as part of CI/CD
  - Owner: Carol
  - Due: 2025-12-01
  - Why: Catch capacity issues before production

## Lessons Learned
1. Development configs are never appropriate for production
2. Missing monitoring makes incidents harder to diagnose
3. Load testing scenarios need to match production patterns
```

## Constitution Bypass Justification

Hotfix is the **only workflow** that bypasses normal TDD process:

**Normal Process Skipped**:
- ✅ Tests before implementation (tests written AFTER fix deployed)
- ✅ Full planning phase (expedited due to emergency)
- ✅ Extended code review (5-minute sanity check only)
- ✅ Staging soak time (deploy directly to production if P0)

**Justification**: When the service is down, every minute matters. Writing comprehensive tests before fixing would cost too much time and money. The post-mortem and regression test ensure the issue is properly documented and won't recur.

**Post-Fix Compliance**:
- Regression test added within 24 hours
- Post-mortem completed within 48 hours
- Documentation updated
- Prevention tasks created

## Tips

### Fast Diagnosis

1. **Check monitoring first** - Error rates, response times, resource usage
2. **Recent changes?** - What deployed in last 24 hours?
3. **Error logs** - What's the actual error message?
4. **Reproduce** - Can you make it happen locally?

### Fix Strategy Decision Tree

```
Is issue caused by recent deployment?
├─ Yes → ROLLBACK (fastest resolution)
└─ No → Is it a feature-specific issue?
    ├─ Yes → DISABLE FEATURE FLAG (fast, safe)
    └─ No → Is fix obvious and small?
        ├─ Yes → QUICK CODE FIX
        └─ No → CONFIGURATION CHANGE or deeper investigation
```

### Rollback vs. Forward Fix

**Rollback when**:
- Recent deployment is the cause
- Previous version was stable
- Rollback is faster than fixing
- Risk of fix is high

**Forward fix when**:
- Issue existed before recent deployment
- No stable version to return to
- Fix is simple and obvious
- Rollback would cause data issues

### Communication During Incident

**Status Updates (every 15 minutes)**:
- What's happening right now
- What we're trying next
- ETA for resolution (if known)

**Final Update**:
- Issue resolved
- Root cause summary
- What we're doing to prevent recurrence

## Integration with Constitution

This workflow is **explicitly exempted** from:
- Section III: Test-Driven Development (tests after fix, not before)
- Quality Gates: Testing requirements relaxed during emergency

This is the ONLY workflow with this exception.

## Related Workflows

- **Bugfix** - For non-urgent bugs (tests before fix)
- **Modify** - For planned changes to features

## Metrics to Track

- **MTTR (Mean Time To Recovery)**: Target < 1 hour for P0
- **Detection Time**: How fast did we notice?
- **Fix Accuracy**: Did first fix work or need iteration?
- **Post-Mortem Completion**: Are we doing them within 48 hours?

---

*Hotfix Workflow Documentation - Part of Specify Extension System*
