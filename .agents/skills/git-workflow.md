---
name: git-workflow
description: Git workflows including branching strategies, commits, changesets, and collaborative development patterns
---

# Git Workflow Guide

Use this skill for git operations, branching strategies, commit conventions, changeset workflows, and collaborative development.

## Branch Management

### Branch Naming Conventions

```bash
# Feature branches
feature/user-authentication
feature/add-dark-mode

# Bug fixes
fix/login-validation
fix/memory-leak

# Hotfixes (critical production issues)
hotfix/security-patch
hotfix/payment-failure

# Refactoring
refactor/user-service
refactor/database-layer

# Documentation
docs/api-reference
docs/contributing-guide

# Chores/maintenance
chore/update-dependencies
chore/cleanup-tests
```

### Creating and Switching Branches

```bash
# Create and switch to new branch
git checkout -b feature/new-feature

# Switch to existing branch
git checkout main

# Create branch from specific commit
git checkout -b fix/bug <commit-hash>

# Delete branch (local)
git branch -d feature/completed-feature

# Delete branch (force)
git branch -D feature/abandoned-feature

# Delete remote branch
git push origin --delete feature/old-feature

# List all branches
git branch -a

# List remote branches
git branch -r
```

### Branch Workflows

**Feature Branch Workflow**:
```bash
# 1. Create feature branch from main
git checkout main
git pull origin main
git checkout -b feature/new-feature

# 2. Make changes and commit
git add .
git commit -m "feat: add new feature"

# 3. Push to remote
git push -u origin feature/new-feature

# 4. Create PR, review, merge
# 5. Delete feature branch
git checkout main
git pull origin main
git branch -d feature/new-feature
```

**Gitflow Workflow**:
```bash
# Main branches: main (production) and develop (integration)

# Create feature from develop
git checkout develop
git checkout -b feature/new-feature

# Merge feature to develop
git checkout develop
git merge --no-ff feature/new-feature

# Create release branch
git checkout -b release/v1.2.0 develop

# Merge release to main and develop
git checkout main
git merge --no-ff release/v1.2.0
git tag -a v1.2.0 -m "Release v1.2.0"

git checkout develop
git merge --no-ff release/v1.2.0

# Hotfix from main
git checkout -b hotfix/critical-bug main
# ... fix bug ...
git checkout main
git merge --no-ff hotfix/critical-bug
git tag -a v1.2.1 -m "Hotfix v1.2.1"

git checkout develop
git merge --no-ff hotfix/critical-bug
```

## Commit Conventions

### Conventional Commits

Format: `<type>(<scope>): <subject>`

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, missing semi-colons, etc.
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvement
- `test`: Adding or updating tests
- `chore`: Maintenance tasks, dependencies
- `ci`: CI/CD changes
- `build`: Build system changes

**Examples**:
```bash
git commit -m "feat(auth): add OAuth2 login"
git commit -m "fix(api): handle null response from server"
git commit -m "docs(readme): update installation instructions"
git commit -m "refactor(user-service): extract validation logic"
git commit -m "test(calculator): add edge case tests"
git commit -m "chore(deps): upgrade react to v18"
```

### Breaking Changes

```bash
git commit -m "feat(api)!: change user endpoint response format

BREAKING CHANGE: User endpoint now returns array instead of object.
Migration guide: Update client code to handle array response."
```

### Multi-line Commits

```bash
git commit -m "feat(payment): add Stripe integration" -m "
- Add Stripe SDK dependency
- Create payment service
- Add webhook handler
- Add tests for payment flow
"
```

## Changesets Workflow

### Setup Changesets

```bash
pnpm add -D @changesets/cli
pnpm changeset init
```

This creates `.changeset/config.json`:
```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.0/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

### Creating Changesets

```bash
# 1. Make code changes

# 2. Create changeset
pnpm changeset

# You'll be prompted:
# - Select packages to bump
# - Choose bump type (major/minor/patch)
# - Write summary
```

This creates `.changeset/random-name.md`:
```markdown
---
"@myorg/package-a": minor
"@myorg/package-b": patch
---

Add new feature X and fix bug Y in package B
```

### Versioning Packages

```bash
# Apply changesets and bump versions
pnpm changeset version

# This:
# - Updates package.json versions
# - Updates CHANGELOG.md
# - Deletes changeset files
# - Updates dependencies
```

### Publishing

```bash
# Build packages
pnpm -r build

# Publish to npm
pnpm changeset publish

# Push tags to GitHub
git push --follow-tags
```

### Complete Changeset Workflow

```bash
# 1. Create feature branch
git checkout -b feature/new-api

# 2. Make changes
# ... code changes ...

# 3. Create changeset
pnpm changeset
# Select: @myorg/api (minor)
# Summary: "Add new endpoint for user profile"

# 4. Commit changeset
git add .changeset/
git commit -m "feat(api): add user profile endpoint"

# 5. Push and create PR
git push -u origin feature/new-api

# 6. After PR approval and merge to main
git checkout main
git pull origin main

# 7. Version packages (on main branch)
pnpm changeset version

# 8. Commit version changes
git add .
git commit -m "chore: version packages"

# 9. Build and publish
pnpm -r build
pnpm changeset publish

# 10. Push tags
git push --follow-tags
```

### Changeset Pre-releases

```bash
# Enter pre-release mode
pnpm changeset pre enter beta

# Create changesets as normal
pnpm changeset

# Version with pre-release tag
pnpm changeset version
# Creates versions like: 1.2.0-beta.0

# Publish
pnpm changeset publish --tag beta

# Exit pre-release mode
pnpm changeset pre exit
```

## Collaborative Development

### Syncing with Remote

```bash
# Fetch latest changes
git fetch origin

# Pull and merge
git pull origin main

# Pull and rebase
git pull --rebase origin main

# Update all remote branches
git fetch --all

# Show remote info
git remote -v
git remote show origin
```

### Resolving Conflicts

```bash
# During merge/rebase, conflicts occur
git status  # Shows conflicted files

# 1. Open conflicted files and resolve
# Look for conflict markers:
# <<<<<<< HEAD
# Your changes
# =======
# Their changes
# >>>>>>> branch-name

# 2. After resolving, mark as resolved
git add conflicted-file.ts

# 3. Continue merge/rebase
git merge --continue
# or
git rebase --continue

# Abort if needed
git merge --abort
git rebase --abort
```

### Stashing Changes

```bash
# Stash current changes
git stash

# Stash with message
git stash save "WIP: feature X"

# List stashes
git stash list

# Apply most recent stash
git stash apply

# Apply and remove stash
git stash pop

# Apply specific stash
git stash apply stash@{2}

# Show stash contents
git stash show -p stash@{0}

# Drop stash
git stash drop stash@{0}

# Clear all stashes
git stash clear
```

### Cherry-picking

```bash
# Apply specific commit to current branch
git cherry-pick <commit-hash>

# Cherry-pick multiple commits
git cherry-pick <hash1> <hash2>

# Cherry-pick range
git cherry-pick <hash1>^..<hash2>

# Cherry-pick without committing
git cherry-pick --no-commit <hash>
```

## Rewriting History

### Interactive Rebase

```bash
# Rebase last 3 commits
git rebase -i HEAD~3

# In editor, choose action:
# pick = use commit
# reword = change commit message
# edit = stop to amend commit
# squash = merge with previous commit
# fixup = like squash, but discard message
# drop = remove commit

# Example:
# pick abc1234 feat: add feature A
# squash def5678 fix: typo in feature A
# reword ghi9012 docs: update README
```

### Amending Commits

```bash
# Amend last commit
git commit --amend

# Amend without changing message
git commit --amend --no-edit

# Add files to last commit
git add forgotten-file.ts
git commit --amend --no-edit
```

### Resetting

```bash
# Soft reset (keep changes staged)
git reset --soft HEAD~1

# Mixed reset (keep changes unstaged)
git reset HEAD~1

# Hard reset (discard all changes)
git reset --hard HEAD~1

# Reset to specific commit
git reset --hard <commit-hash>

# Undo reset (if needed)
git reflog
git reset --hard HEAD@{1}
```

## Tags

### Creating Tags

```bash
# Lightweight tag
git tag v1.0.0

# Annotated tag (recommended)
git tag -a v1.0.0 -m "Release version 1.0.0"

# Tag specific commit
git tag -a v1.0.0 <commit-hash> -m "Release v1.0.0"

# List tags
git tag
git tag -l "v1.*"

# Show tag info
git show v1.0.0
```

### Pushing Tags

```bash
# Push single tag
git push origin v1.0.0

# Push all tags
git push origin --tags

# Push with commits
git push --follow-tags
```

### Deleting Tags

```bash
# Delete local tag
git tag -d v1.0.0

# Delete remote tag
git push origin --delete v1.0.0
```

## Advanced Workflows

### Worktrees

Work on multiple branches simultaneously:

```bash
# Create worktree
git worktree add ../my-feature feature/my-feature

# List worktrees
git worktree list

# Remove worktree
git worktree remove ../my-feature

# Prune deleted worktrees
git worktree prune
```

### Bisect (Find Bug Introduction)

```bash
# Start bisect
git bisect start

# Mark current commit as bad
git bisect bad

# Mark known good commit
git bisect good <commit-hash>

# Git will checkout commits for you to test
# After testing each:
git bisect good  # if bug not present
git bisect bad   # if bug present

# Once found:
git bisect reset
```

### Submodules

```bash
# Add submodule
git submodule add https://github.com/user/repo.git path/to/submodule

# Clone repo with submodules
git clone --recurse-submodules <repo-url>

# Initialize submodules in existing clone
git submodule init
git submodule update

# Update submodules
git submodule update --remote

# Remove submodule
git submodule deinit path/to/submodule
git rm path/to/submodule
rm -rf .git/modules/path/to/submodule
```

## Git Hooks

### Pre-commit Hook

Create `.git/hooks/pre-commit`:
```bash
#!/bin/bash

# Run linter
pnpm lint
if [ $? -ne 0 ]; then
  echo "Linting failed. Commit aborted."
  exit 1
fi

# Run tests
pnpm test
if [ $? -ne 0 ]; then
  echo "Tests failed. Commit aborted."
  exit 1
fi
```

### Using simple-git-hooks

```bash
pnpm add -D simple-git-hooks lint-staged
```

In `package.json`:
```json
{
  "simple-git-hooks": {
    "pre-commit": "pnpm lint-staged"
  },
  "lint-staged": {
    "*.ts": [
      "oxlint --fix",
      "oxfmt"
    ],
    "*.{json,md}": [
      "oxfmt"
    ]
  }
}
```

Install hooks:
```bash
pnpm exec simple-git-hooks
```

## Troubleshooting

### Undo Last Push (Dangerous!)

```bash
# Force push previous commit
git reset --hard HEAD~1
git push --force origin main

# Only do this if no one else has pulled!
```

### Recover Deleted Branch

```bash
# Find branch's last commit
git reflog

# Recreate branch
git checkout -b recovered-branch <commit-hash>
```

### Fix Detached HEAD

```bash
# Create new branch from detached HEAD
git checkout -b temp-branch

# Or go back to main
git checkout main
```

### Clean Untracked Files

```bash
# Show what would be deleted
git clean -n

# Delete untracked files
git clean -f

# Delete untracked files and directories
git clean -fd

# Include ignored files
git clean -fdx
```

## Git Configuration

### User Settings

```bash
# Set name and email
git config --global user.name "Your Name"
git config --global user.email "you@example.com"

# Set default editor
git config --global core.editor "code --wait"

# Set default branch name
git config --global init.defaultBranch main
```

### Aliases

```bash
# Create aliases
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
git config --global alias.lg "log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit"

# Use aliases
git st
git co -b new-branch
git lg
```

### .gitignore

```gitignore
# Dependencies
node_modules/
.pnp
.pnp.js

# Build output
dist/
build/
*.tsbuildinfo

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
logs/

# Test coverage
coverage/

# Temporary files
*.tmp
temp/
```

## Best Practices

1. **Commit Often**: Small, focused commits are easier to review and revert
2. **Write Clear Messages**: Follow conventional commits
3. **Pull Before Push**: Always sync with remote before pushing
4. **Use Branches**: Never commit directly to main
5. **Review Before Committing**: Use `git diff` to check changes
6. **Clean History**: Rebase feature branches to keep linear history
7. **Tag Releases**: Use semantic versioning for tags
8. **Protect Main**: Use branch protection rules on GitHub
9. **Document Workflows**: Keep team workflow documented
10. **Use Hooks**: Automate checks with pre-commit hooks

## Quick Reference

| Command | Description |
|---------|-------------|
| `git status` | Show working tree status |
| `git diff` | Show changes |
| `git add <file>` | Stage file |
| `git commit -m "msg"` | Commit staged changes |
| `git push` | Push to remote |
| `git pull` | Fetch and merge |
| `git checkout <branch>` | Switch branch |
| `git checkout -b <branch>` | Create and switch branch |
| `git merge <branch>` | Merge branch |
| `git rebase <branch>` | Rebase current branch |
| `git log` | Show commit history |
| `git reflog` | Show reference log |
| `git stash` | Stash changes |
| `git tag <name>` | Create tag |

## Resources

- Conventional Commits: https://www.conventionalcommits.org/
- Changesets: https://github.com/changesets/changesets
- Git Documentation: https://git-scm.com/doc
- Atlassian Git Tutorials: https://www.atlassian.com/git/tutorials
