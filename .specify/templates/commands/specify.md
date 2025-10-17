# /speckit.specify Command

**Purpose**: Create a feature specification that defines WHAT to build and WHY, without implementation details.

**When to use**: At the start of a new feature to capture requirements and user stories.

## Instructions

1. Create a new feature branch and spec directory using the create-new-feature.sh script
2. Fill out the spec.md template with:
   - User stories prioritized by importance (P1, P2, P3)
   - Each story must be independently testable
   - Functional requirements
   - Success criteria
3. Focus on WHAT and WHY, not HOW
4. Be explicit about requirements
5. Mark any unclear areas with [NEEDS CLARIFICATION]

## Template Location

`.specify/templates/spec-template.md`

## Output

Creates: `.specify/specs/[###-feature-name]/spec.md`
