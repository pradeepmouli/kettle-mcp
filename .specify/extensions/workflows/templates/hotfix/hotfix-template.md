# Hotfix: [INCIDENT TITLE]

**Hotfix ID**: hotfix-###
**Branch**: `hotfix/###-short-description`
**Severity**: [ ] P0 (Critical - Service Down) | [ ] P1 (Major - Key Feature Broken) | [ ] P2 (Significant - Workaround Available)
**Status**: [ ] Investigating | [ ] Fix Deployed | [ ] Monitoring | [ ] Post-Mortem Complete

## Incident Timeline

**Incident Start**: [YYYY-MM-DD HH:MM:SS UTC]
**Detection**: [YYYY-MM-DD HH:MM:SS UTC] - [How was it detected? Monitoring alert, user report, etc.]
**Investigation Start**: [YYYY-MM-DD HH:MM:SS UTC]
**Root Cause Identified**: [YYYY-MM-DD HH:MM:SS UTC]
**Fix Deployed**: [YYYY-MM-DD HH:MM:SS UTC]
**Incident End**: [YYYY-MM-DD HH:MM:SS UTC]
**Total Duration**: [X hours Y minutes]

## Input
User description: "$ARGUMENTS"

## Immediate Fix Applied

### What Changed
**Files Modified**:
- [file1.ts - lines XX-YY: description of change]
- [file2.tsx - lines AA-BB: description of change]

**Change Summary**:
[1-2 sentences describing the code change made]

**Commit SHA**: [git commit hash]

### Why This Fix
[Quick explanation of why this specific change resolves the issue]

## Impact

### Users Affected
- **Estimated Users**: [number or percentage]
- **Geographic Region**: [if location-specific]
- **User Segments**: [which types of users hit this]

### Downtime
- **Total Downtime**: [duration if service was completely down]
- **Partial Outage**: [duration if degraded service]
- **No Downtime**: [if fix applied without outage]

### Data Loss/Corruption
- [ ] No data loss
- [ ] Data loss occurred: [describe scope and recovery plan]
- [ ] Data corruption: [describe and remediation]

### Business Impact
- **Revenue Impact**: [estimated $ loss or "none"]
- **Customer Impact**: [number of tickets, complaints, cancellations]
- **SLA Breach**: [ ] Yes | [ ] No
- **Reputation**: [media coverage, social media, etc.]

## Root Cause (Quick Analysis)

### What Happened
[1-3 sentences explaining what went wrong technically]

### Why It Happened
[1-2 sentences on why the bug/issue existed - regression, edge case, deployment issue, etc.]

### Why It Wasn't Caught Earlier
- [ ] No test coverage for this scenario
- [ ] Test existed but was disabled/skipped
- [ ] Edge case not anticipated
- [ ] Deployment process issue
- [ ] Monitoring gap
- [ ] Other: [explain]

## Rollback Plan

### How to Undo This Fix
```bash
# Commands to rollback if this hotfix causes worse problems
git revert [commit-sha]
# OR
git reset --hard [previous-commit]
# Then deploy previous version
```

### Rollback Testing
- [ ] Rollback tested in staging: [ ] Yes | [ ] No | [ ] N/A
- [ ] Rollback time estimate: [X minutes]
- [ ] Rollback triggers: [when to rollback - specific metrics/conditions]

## Deployment Log

### Pre-Deployment Checks
- [ ] Fix tested locally (reproduced issue, verified fix)
- [ ] Code review completed (if time permitted) OR [ ] Skip review (emergency)
- [ ] Staging deployment successful (if applicable)
- [ ] Rollback plan prepared

### Deployment Steps Taken
1. [Step 1: e.g., created hotfix branch from main]
2. [Step 2: e.g., applied fix and committed]
3. [Step 3: e.g., deployed to production]
4. [Step 4: e.g., verified fix working]

### Post-Deployment Monitoring
**Metrics Being Watched**:
- [Metric 1: error rate - expected < 0.1%]
- [Metric 2: response time - expected < 200ms]
- [Metric 3: user reports - expected: none]

**Monitoring Duration**: [24-48 hours typical]

## Constitution Bypass Justification
*Hotfix workflow bypasses normal TDD process due to emergency*

**Normal Process Skipped**:
- [ ] Tests before implementation (regression test added AFTER fix)
- [ ] Full planning phase
- [ ] Extended code review
- [ ] Staging soak time

**Justification**:
[Why the urgency required bypassing normal process - service down, data loss risk, security vulnerability, etc.]

**Post-Fix Compliance**:
- [ ] Regression test added: [file path]
- [ ] Post-mortem scheduled within 48 hours
- [ ] Documentation updated
- [ ] Monitoring gaps addressed

---

## Post-Mortem (Complete within 48 hours)

**Post-Mortem Document**: [Link to detailed post-mortem.md]

**Required within 48 hours**:
1. Detailed technical analysis
2. Timeline of events
3. Contributing factors
4. Action items to prevent recurrence
5. Process improvements

---

## Related Work

### Prevention Tasks
[List follow-up work to prevent this class of issue]:
- [ ] Add test coverage: [specific test needed]
- [ ] Add monitoring: [specific metric/alert]
- [ ] Refactor code: [technical debt to address]
- [ ] Update documentation: [doc gap]
- [ ] Process improvement: [what process failed]

### Related Features/Bugs
[Link to features or bugs this hotfix relates to]

---

## Verification Checklist

- [ ] Incident resolved (service restored)
- [ ] Users can access affected functionality
- [ ] Monitoring shows normal metrics
- [ ] No new issues introduced by fix
- [ ] Rollback plan prepared and tested
- [ ] Post-deployment monitoring active (24-48 hrs)
- [ ] Communication sent to affected users (if needed)
- [ ] Internal stakeholders notified
- [ ] Post-mortem scheduled

---
*Hotfix created using `/hotfix` workflow - See .specify/extensions/workflows/hotfix/*
