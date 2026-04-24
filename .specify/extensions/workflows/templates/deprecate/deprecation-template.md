# Deprecation Plan: [FEATURE NAME]

**Deprecation ID**: deprecate-###
**Branch**: `deprecate/###-feature-name`
**Original Feature**: [Link to original feature spec, e.g., specs/014-edit-profile-form/]
**Status**: [ ] Planning | [ ] Phase 1 (Warnings) | [ ] Phase 2 (Disabled) | [ ] Phase 3 (Removed)

## Deprecation Timeline

**Deprecation Announced**: [YYYY-MM-DD]
**Phase 1 Start (Warnings)**: [YYYY-MM-DD] - Add deprecation warnings, no functionality removed
**Phase 2 Start (Disabled by Default)**: [YYYY-MM-DD] - Feature disabled by default, opt-in available
**Phase 3 Start (Removal)**: [YYYY-MM-DD] - Complete removal from codebase
**Total Sunset Period**: [X months]

## Rationale

### Why Deprecate?
[Explain the business/technical reasons for deprecation]
- [ ] Feature no longer aligns with product vision
- [ ] Replaced by better alternative
- [ ] Low/no usage
- [ ] High maintenance burden
- [ ] Security concerns
- [ ] Performance issues
- [ ] Technical debt reduction
- [ ] Other: [explain]

### Supporting Data
**Usage Statistics**:
- Active users (last 30 days): [number or %]
- API calls (last 30 days): [number]
- Feature engagement: [metrics]

**Maintenance Cost**:
- LOC maintained: [number]
- Bug tickets: [number in last 6 months]
- Support tickets: [number in last 6 months]
- Engineering hours/month: [estimate]

**Business Impact**:
- Revenue: [$X/month or "negligible"]
- Strategic value: [low/medium/high]

## Affected Users

### User Segments
**Internal Users**:
- [Team/department]: [how they use it]
- [Team/department]: [how they use it]

**External Users**:
- [User type]: [usage pattern]
- Estimated total: [number]

### Migration Path

**Recommended Alternative**: [Feature name or product]
- **Why better**: [advantages over deprecated feature]
- **Migration complexity**: [ ] Easy (< 1 hour) | [ ] Medium (< 1 day) | [ ] Hard (> 1 day)
- **Migration guide**: [Link to migration documentation]

**For users with no alternative**:
[What should they do if no replacement exists?]

## Dependencies

**Code Dependencies** (auto-scanned):
```
[Output from scan-dependencies.sh]
- app/routes/feature.tsx (direct import)
- app/services/other-service.ts (indirect usage)
- tests/feature.test.ts (test dependencies)
```

**Feature Dependencies**:
- [Feature A] depends on this feature: [how]
- [Feature B] depends on this feature: [how]

**API Dependencies**:
- External API consumers: [list]
- Internal microservices: [list]
- Webhooks: [list]

**Data Dependencies**:
- Database tables: [list]
- Data retention requirements: [how long to keep data]
- Migration needs: [data transformation required?]

## Deprecation Strategy

### Phase 1: Warnings & Communication (Duration: X months)

**Goals**:
- Inform all users of deprecation
- Provide migration resources
- No functionality removed yet

**Technical Changes**:
- [ ] Add deprecation warnings to UI
- [ ] Add console warnings/logs
- [ ] Update API responses with deprecation headers
- [ ] Add deprecation notices to documentation

**Communication Plan**:
- [ ] Email to active users
- [ ] In-app notifications
- [ ] Blog post announcement
- [ ] Documentation updates
- [ ] API changelog entry
- [ ] Support team briefing

**Success Metrics**:
- [ ] All users notified
- [ ] Migration guide published
- [ ] Support team prepared
- [ ] Usage reduction: [target %]

### Phase 2: Disabled by Default (Duration: X months)

**Goals**:
- Feature disabled for new users
- Existing users can opt-in if needed
- Encourage migration

**Technical Changes**:
- [ ] Add feature flag (disabled by default)
- [ ] Allow opt-in via settings/config
- [ ] Stronger warnings when enabled
- [ ] Log usage for monitoring

**Communication Plan**:
- [ ] Email reminder to remaining users
- [ ] In-app modal for opt-in users
- [ ] Support outreach to high-usage accounts

**Success Metrics**:
- [ ] < X% of users still opted-in
- [ ] Critical users migrated
- [ ] No major blockers reported

### Phase 3: Complete Removal (Final)

**Goals**:
- Remove all code
- Clean up data
- Archive documentation

**Technical Changes**:
- [ ] Remove feature code
- [ ] Remove database tables/columns
- [ ] Remove API endpoints
- [ ] Remove tests
- [ ] Remove documentation
- [ ] Update dependencies

**Communication Plan**:
- [ ] Final notice to any remaining users
- [ ] Public changelog entry
- [ ] Archive migration guides

**Success Metrics**:
- [ ] Code removed
- [ ] No regressions in remaining features
- [ ] Documentation archived
- [ ] Zero active usage

## Risk Assessment

### User Impact
**Risk Level**: [ ] Low | [ ] Medium | [ ] High

**Mitigation**:
- [Strategy to minimize user disruption]

### Technical Debt Risk
**Risk**: Removal may break other features

**Mitigation**:
- Comprehensive dependency scan (scan-dependencies.sh)
- Extensive testing during each phase
- Feature flags for gradual rollout

### Business Risk
**Risk**: [e.g., Revenue loss, customer churn]

**Mitigation**:
- [Strategy to address business concerns]

## Rollback Plan

### If Phase 1 Fails
[How to remove warnings and continue supporting feature]

### If Phase 2 Fails
[How to re-enable by default]

### If Phase 3 Fails
[How to restore from git history if needed]

## Communication Templates

### User Notification Email
```
Subject: [Feature Name] will be deprecated on [Date]

Dear [User],

We're writing to inform you that [Feature Name] will be deprecated
starting [Date].

Why: [Brief reason]

What this means:
- Phase 1 ([Date]): Feature remains available with warnings
- Phase 2 ([Date]): Feature disabled by default
- Phase 3 ([Date]): Feature completely removed

Recommended Action:
Please migrate to [Alternative] by [Date]. See our migration guide: [Link]

Questions? Contact [support email]

Thank you,
[Team Name]
```

### API Deprecation Header
```
Deprecation: version="1.0"
Sunset: "[Date in RFC3339]"
Link: <[migration guide URL]>; rel="deprecation"
```

## Testing Strategy

### Phase 1 Testing
- [ ] Warnings appear correctly
- [ ] Feature still works normally
- [ ] No performance degradation

### Phase 2 Testing
- [ ] Feature disabled for new users
- [ ] Opt-in mechanism works
- [ ] Other features unaffected

### Phase 3 Testing
- [ ] All code removed cleanly
- [ ] No broken imports
- [ ] All tests pass
- [ ] No console errors
- [ ] Dependent features still work

## Documentation Updates

**During Phase 1**:
- [ ] Add deprecation notice to feature docs
- [ ] Create migration guide
- [ ] Update API documentation
- [ ] Add to CHANGELOG

**During Phase 2**:
- [ ] Update docs to show "legacy" status
- [ ] Emphasize alternative solution

**During Phase 3**:
- [ ] Archive deprecated feature docs
- [ ] Remove from main navigation
- [ ] Keep migration guide accessible
- [ ] Update architecture diagrams

## Metrics & Monitoring

**Track Throughout Deprecation**:
- Active users of deprecated feature (daily)
- Migration completion rate
- Support tickets related to deprecation
- Opt-in rate (Phase 2)
- Errors/issues caused by deprecation

**Dashboard**: [Link to deprecation metrics dashboard]

## Post-Removal

### Cleanup Checklist
- [ ] Code removed from all branches
- [ ] Database tables dropped
- [ ] API endpoints removed
- [ ] Feature flags removed
- [ ] Documentation archived
- [ ] Tests removed
- [ ] Dependencies updated
- [ ] Build artifacts cleaned

### Lessons Learned
[Complete after Phase 3]
- What went well?
- What could be improved?
- How long did migration take?
- What unexpected issues arose?

## Related Work

### Follow-up Tasks
- [ ] Monitor for regressions: [timeframe]
- [ ] Archive data: [where to store]
- [ ] Update training materials
- [ ] Refactor dependent code to remove workarounds

---

## Approval & Sign-off

**Product Owner**: [ ] Approved | Name: __________ | Date: __________
**Engineering Lead**: [ ] Approved | Name: __________ | Date: __________
**Support Lead**: [ ] Approved | Name: __________ | Date: __________

---

*Deprecation plan created using `/deprecate` workflow - See .specify/extensions/workflows/deprecate/*
