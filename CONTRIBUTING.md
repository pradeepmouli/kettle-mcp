# Contributing to Kettle-MCP

Thank you for your interest in contributing to Kettle-MCP! This project follows spec-driven development using GitHub Spec-Kit.

## Getting Started

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/<your-username>/kettle-mcp.git
   cd kettle-mcp
   ```

3. **Review the constitution**
   Read `.specify/memory/constitution.md` to understand project principles

## Development Workflow

We follow the Spec-Kit methodology for all contributions:

### 1. Create a Feature Specification

Before writing code, create a specification:

```bash
# Create a new feature branch and spec
.specify/scripts/create-new-feature.sh my-feature-name
```

This creates:
- A feature branch: `###-my-feature-name`
- A spec directory: `.specify/specs/###-my-feature-name/`
- An initial spec.md file

### 2. Define What to Build

Edit `spec.md` to define:
- **User Stories**: Prioritized scenarios (P1, P2, P3)
- **Requirements**: What the system must do
- **Success Criteria**: How to measure success

Focus on WHAT and WHY, not HOW.

### 3. Create Implementation Plan

Use an AI agent with `/speckit.plan` or manually create:
- `plan.md`: Technical approach and architecture
- `research.md`: Technology research and decisions
- `quickstart.md`: How to run and test

### 4. Break Down into Tasks

Create `tasks.md` with actionable tasks:
- Organized by user story
- Include file paths
- Mark parallel tasks with [P]

### 5. Implement

Follow the task breakdown:
- Write tests first (if included in tasks)
- Implement one task at a time
- Commit after each completed task or logical group
- Run tests frequently

## Code Standards

### Python Style

- Follow PEP 8
- Use type hints
- Maximum function length: ~50 lines
- Maximum file length: ~500 lines

### Testing

- Write unit tests for core functionality
- Write integration tests for MCP tools
- Aim for 80%+ test coverage
- Use pytest

### Documentation

- Update README if adding user-facing features
- Document all public APIs
- Include docstrings for classes and functions
- Update CLAUDE.md for new commands

## Pull Request Process

1. **Create from feature branch**
   ```bash
   git checkout ###-my-feature-name
   # Make your changes
   git add .
   git commit -m "Descriptive message"
   git push origin ###-my-feature-name
   ```

2. **Open Pull Request**
   - Title: Brief description of the feature
   - Description: Link to spec.md and summarize changes
   - Include test results

3. **Review Process**
   - Maintainers will review your spec and implementation
   - Address feedback
   - Ensure all tests pass

4. **Merge**
   - Once approved, your PR will be merged
   - Delete the feature branch

## Best Practices

### Spec-Driven Development

- ✅ **Do**: Write specs before code
- ✅ **Do**: Keep specs technology-agnostic
- ✅ **Do**: Break features into independent user stories
- ❌ **Don't**: Skip the specification phase
- ❌ **Don't**: Mix multiple features in one branch

### Code Quality

- ✅ **Do**: Write clear, self-documenting code
- ✅ **Do**: Add comments for complex logic (WHY, not WHAT)
- ✅ **Do**: Validate inputs at API boundaries
- ❌ **Don't**: Over-engineer solutions
- ❌ **Don't**: Add unnecessary dependencies

### Testing

- ✅ **Do**: Test error cases
- ✅ **Do**: Test edge cases
- ✅ **Do**: Write integration tests for MCP tools
- ❌ **Don't**: Test implementation details
- ❌ **Don't**: Skip tests for "simple" code

## Project Structure

```
kettle-mcp/
├── .specify/              # Spec-kit files
│   ├── memory/           # Constitution and project memory
│   ├── scripts/          # Helper scripts
│   ├── specs/            # Feature specifications
│   └── templates/        # Document templates
├── src/                  # Source code
│   └── kettle_mcp/      # Main package
├── tests/                # Test files
│   ├── unit/            # Unit tests
│   └── integration/     # Integration tests
├── docs/                 # Additional documentation
├── examples/             # Example files
└── README.md            # Project overview
```

## Questions?

- Open an issue for bugs or feature requests
- Tag maintainers in discussions
- Review existing specs for examples

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
