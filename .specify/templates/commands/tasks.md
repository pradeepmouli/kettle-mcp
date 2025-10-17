# /speckit.tasks Command

**Purpose**: Generate an actionable task breakdown from the implementation plan.

**When to use**: After completing plan.md and validating the implementation approach.

## Prerequisites

- Completed spec.md
- Completed plan.md
- Completed research.md

## Instructions

1. Read all design documents (spec, plan, research)
2. Create tasks.md with:
   - Setup phase (project initialization)
   - Foundational phase (blocking prerequisites)
   - User story phases (one per story)
   - Polish phase (cross-cutting concerns)
3. Organize tasks by user story for independent implementation
4. Mark parallel tasks with [P]
5. Include exact file paths for each task
6. Add checkpoints after each user story phase

## Template Location

`.specify/templates/tasks-template.md`

## Output

Creates: `.specify/specs/[###-feature-name]/tasks.md`
