# Post-Mortem: [INCIDENT TITLE]

**Hotfix ID**: hotfix-###
**Incident Date**: [YYYY-MM-DD]
**Post-Mortem Date**: [YYYY-MM-DD] (within 48 hours of resolution)
**Participants**: [Names of people involved in incident and post-mortem]
**Incident Commander**: [Who led the response]

---

## Executive Summary
[2-3 paragraphs for non-technical stakeholders]
- What happened
- Impact (users, revenue, reputation)
- Root cause in simple terms
- What we're doing to prevent it

---

## Incident Details

### What Happened (Detailed)
[Comprehensive technical explanation of the incident]
- What functionality broke
- What error messages users saw
- What logs showed
- What monitoring detected

### Impact Analysis

#### Users
- **Total Affected**: [number]
- **User Segments**: [which types of users]
- **Geographic Distribution**: [if relevant]
- **Duration of Impact**: [how long users were affected]

#### Business
- **Revenue Loss**: [$amount or estimate]
- **Support Tickets**: [number created]
- **Cancellations**: [if any]
- **SLA Credits**: [$amount if applicable]
- **Reputation**: [media coverage, social sentiment]

#### Engineering
- **Teams Involved**: [which teams responded]
- **Engineer Hours**: [total time spent on incident]
- **Opportunity Cost**: [what work was delayed]

### Timeline (Detailed)
**All times in UTC**

| Time | Event | Who | Notes |
|------|-------|-----|-------|
| HH:MM | Incident began | System | [What triggered it] |
| HH:MM | First detection | [Alerting/User] | [How detected] |
| HH:MM | Investigation started | [Person] | [What they checked first] |
| HH:MM | Root cause identified | [Person] | [What was found] |
| HH:MM | Fix implemented | [Person] | [What change made] |
| HH:MM | Fix deployed | [Person] | [To which environment] |
| HH:MM | Verification complete | [Person] | [How verified] |
| HH:MM | Incident closed | [Person] | [Resolution confirmed] |
| HH:MM | Post-incident monitoring | Team | [Watching for recurrence] |

---

## Root Cause Analysis

### Technical Root Cause
[Deep technical explanation - code, architecture, deployment, etc.]

**Code Issue**:
[Specific code that caused the problem, with examples]

**Why It Existed**:
[How did this code/config/deployment get into production?]

**Why Tests Didn't Catch It**:
[What was the gap in test coverage?]

### Contributing Factors
[Factors that made the incident worse or more likely]

1. **Factor 1**: [e.g., Missing monitoring for this scenario]
   - **How it contributed**: [Made detection slower]
   - **Why it existed**: [Monitoring not prioritized]

2. **Factor 2**: [e.g., Tight coupling in code]
   - **How it contributed**: [Made fix more complex]
   - **Why it existed**: [Technical debt]

3. **Factor 3**: [e.g., Deployment at high-traffic time]
   - **How it contributed**: [Magnified user impact]
   - **Why it existed**: [No deployment policy]

### Five Whys Analysis
**Problem Statement**: [The incident in one sentence]

1. **Why did [problem] happen?**
   - [Answer]

2. **Why did [answer from #1] happen?**
   - [Answer]

3. **Why did [answer from #2] happen?**
   - [Answer]

4. **Why did [answer from #3] happen?**
   - [Answer]

5. **Why did [answer from #4] happen?**
   - [Root cause revealed]

---

## What Went Well

### Detection
[How we found out about the issue - what worked]

### Response
[What went smoothly during the incident response]

### Communication
[How internal/external communication worked]

### Remediation
[What made the fix process effective]

---

## What Went Wrong

### Detection Issues
[What delayed detection or made it harder to find]

### Response Issues
[What slowed down or complicated the response]

### Communication Issues
[Where communication broke down]

### Remediation Issues
[What made the fix harder than it should have been]

---

## Action Items

### Immediate Actions (This Week)
Priority actions to prevent immediate recurrence:

- [ ] **AI-001**: [Action item]
  - **Owner**: [Person responsible]
  - **Due**: [Date]
  - **Why**: [Prevents what]

- [ ] **AI-002**: [Action item]
  - **Owner**: [Person responsible]
  - **Due**: [Date]
  - **Why**: [Prevents what]

### Short-Term Actions (This Month)
Important but not urgent:

- [ ] **AI-003**: [Action item]
  - **Owner**: [Person responsible]
  - **Due**: [Date]
  - **Why**: [Improves what]

### Long-Term Actions (This Quarter)
Structural improvements:

- [ ] **AI-004**: [Action item]
  - **Owner**: [Person responsible]
  - **Due**: [Date]
  - **Why**: [Systemic improvement]

---

## Prevention Measures

### Tests Added
- [ ] **Test 1**: [Regression test for this specific bug]
  - **File**: [path to test]
  - **Covers**: [specific scenario]

- [ ] **Test 2**: [Related edge case]
  - **File**: [path to test]
  - **Covers**: [specific scenario]

### Monitoring Added
- [ ] **Alert 1**: [New alert to catch this earlier]
  - **Metric**: [what it watches]
  - **Threshold**: [when it fires]

- [ ] **Dashboard Update**: [New metrics visible]
  - **Purpose**: [what it helps identify]

### Process Changes
- [ ] **Process 1**: [e.g., deployment checklist updated]
  - **What changed**: [specific change]
  - **Why**: [prevents what]

- [ ] **Process 2**: [e.g., code review requirements]
  - **What changed**: [specific change]
  - **Why**: [catches what]

### Architecture Changes
- [ ] **Change 1**: [e.g., circuit breaker added]
  - **Where**: [system component]
  - **Why**: [limits blast radius]

### Documentation Updates
- [ ] **Doc 1**: [Runbook updated]
  - **What added**: [new troubleshooting steps]

- [ ] **Doc 2**: [Architecture doc updated]
  - **What added**: [failure mode documented]

---

## Lessons Learned

### Technical Lessons
[What we learned about our systems]
1. [Lesson 1]
2. [Lesson 2]

### Process Lessons
[What we learned about our processes]
1. [Lesson 1]
2. [Lesson 2]

### Communication Lessons
[What we learned about our communication]
1. [Lesson 1]
2. [Lesson 2]

---

## Acknowledgments
[Recognize people who helped resolve the incident]

---

## Appendix

### Related Incidents
[Link to similar past incidents if any]

### External References
[Links to relevant documentation, tickets, monitoring dashboards]

### Metrics and Logs
[Attach relevant data - error rates, response times, log samples]

---
*Post-mortem completed [date] - See hotfix-###/hotfix.md for incident log*
