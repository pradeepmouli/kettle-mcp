# /speckit.plan Command

**Purpose**: Create a technical implementation plan based on the feature specification.

**When to use**: After completing and validating the spec.md file.

## Prerequisites

- Completed spec.md in the feature directory
- Constitution.md reviewed for project principles

## Instructions

1. Read the spec.md file
2. Review constitution.md for project principles
3. Create plan.md with:
   - Technical context (language, dependencies, platform)
   - Project structure
   - Constitution check results
4. Create research.md with:
   - Technology research
   - Best practices
   - Implementation approach
5. Create quickstart.md with:
   - Setup instructions
   - How to run the feature
6. If applicable, create contracts/ directory with:
   - API specifications
   - Data contracts

## Template Location

`.specify/templates/plan-template.md`

## Output

Creates:
- `.specify/specs/[###-feature-name]/plan.md`
- `.specify/specs/[###-feature-name]/research.md`
- `.specify/specs/[###-feature-name]/quickstart.md`
- `.specify/specs/[###-feature-name]/contracts/` (if applicable)
