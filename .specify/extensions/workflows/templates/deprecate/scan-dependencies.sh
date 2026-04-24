#!/usr/bin/env bash

set -e

FEATURE_NUM="$1"
OUTPUT_FILE="$2"

if [ -z "$FEATURE_NUM" ] || [ -z "$OUTPUT_FILE" ]; then
    echo "Usage: $0 <feature_number> <output_file>" >&2
    echo "Example: $0 014 /path/to/dependencies.md" >&2
    exit 1
fi

# Find repository root
find_repo_root() {
    local dir="$1"
    while [ "$dir" != "/" ]; do
        if [ -d "$dir/.git" ] || [ -d "$dir/.specify" ]; then
            echo "$dir"
            return 0
        fi
        dir="$(dirname "$dir")"
    done
    return 1
}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(find_repo_root "$SCRIPT_DIR")"

if [ -z "$REPO_ROOT" ]; then
    echo "Error: Could not determine repository root" >&2
    exit 1
fi

cd "$REPO_ROOT"

# Find the feature directory
FEATURE_DIR=$(find "$REPO_ROOT/specs" -maxdepth 1 -type d -name "${FEATURE_NUM}-*" | head -1)

if [ -z "$FEATURE_DIR" ] || [ ! -d "$FEATURE_DIR" ]; then
    echo "Error: Feature directory not found for feature number ${FEATURE_NUM}" >&2
    echo "Looked in: $REPO_ROOT/specs/${FEATURE_NUM}-*" >&2
    exit 1
fi

FEATURE_NAME=$(basename "$FEATURE_DIR")

echo "# Dependency Scan Results" > "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "**Feature**: $FEATURE_NAME" >> "$OUTPUT_FILE"
echo "**Scan Date**: $(date -u +"%Y-%m-%d %H:%M:%S UTC")" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "---" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Extract files from the feature's tasks.md or plan.md
TASKS_FILE="$FEATURE_DIR/tasks.md"
PLAN_FILE="$FEATURE_DIR/plan.md"

FEATURE_FILES=()

if [ -f "$TASKS_FILE" ]; then
    echo "Scanning tasks.md for feature files..." >&2
    while IFS= read -r line; do
        FEATURE_FILES+=("$line")
    done < <(grep -oE '(app/|tests/|src/|lib/)[^ ]*\.(ts|tsx|js|jsx|py|go|rs|java|rb|php)' "$TASKS_FILE" 2>/dev/null | sort -u || true)
fi

if [ -f "$PLAN_FILE" ] && [ ${#FEATURE_FILES[@]} -eq 0 ]; then
    echo "Scanning plan.md for feature files..." >&2
    while IFS= read -r line; do
        FEATURE_FILES+=("$line")
    done < <(grep -oE '(app/|tests/|src/|lib/)[^ ]*\.(ts|tsx|js|jsx|py|go|rs|java|rb|php)' "$PLAN_FILE" 2>/dev/null | sort -u || true)
fi

if [ ${#FEATURE_FILES[@]} -eq 0 ]; then
    echo "## ⚠️ Warning: No Feature Files Found" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    echo "Could not automatically detect files created by this feature." >> "$OUTPUT_FILE"
    echo "Please manually list the files in this section." >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    exit 0
fi

echo "## Feature Files (Created by This Feature)" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "These files were created as part of feature $FEATURE_NAME:" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

for file in "${FEATURE_FILES[@]}"; do
    if [ -f "$REPO_ROOT/$file" ]; then
        LOC=$(wc -l < "$REPO_ROOT/$file" 2>/dev/null || echo "?")
        echo "- \`$file\` ($LOC lines)" >> "$OUTPUT_FILE"
    else
        echo "- \`$file\` (file not found - may have been moved/renamed)" >> "$OUTPUT_FILE"
    fi
done

echo "" >> "$OUTPUT_FILE"
echo "---" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Scan for code dependencies (imports/usage)
echo "## Code Dependencies (Other Files Importing Feature Files)" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "Other parts of the codebase that import or reference this feature's files:" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

DEPENDENCIES_FOUND=false

for feature_file in "${FEATURE_FILES[@]}"; do
    # Remove file extension and path to get module name
    MODULE_PATH="${feature_file%.tsx}"
    MODULE_PATH="${MODULE_PATH%.ts}"
    MODULE_PATH="${MODULE_PATH%.jsx}"
    MODULE_PATH="${MODULE_PATH%.js}"

    # Search for imports of this module
    IMPORTING_FILES=$(grep -r "from ['\"].*$MODULE_PATH['\"]" "$REPO_ROOT/app" "$REPO_ROOT/src" "$REPO_ROOT/lib" 2>/dev/null | cut -d: -f1 | sort -u || true)

    if [ -n "$IMPORTING_FILES" ]; then
        DEPENDENCIES_FOUND=true
        echo "### Files importing \`$feature_file\`:" >> "$OUTPUT_FILE"
        echo "" >> "$OUTPUT_FILE"
        echo "$IMPORTING_FILES" | while read -r importing_file; do
            # Don't list the feature file itself
            if [[ "$importing_file" != *"$feature_file"* ]]; then
                # Check if importing file is also a feature file
                IS_FEATURE_FILE=false
                for ff in "${FEATURE_FILES[@]}"; do
                    if [[ "$importing_file" == *"$ff"* ]]; then
                        IS_FEATURE_FILE=true
                        break
                    fi
                done

                if [ "$IS_FEATURE_FILE" = false ]; then
                    RELATIVE_PATH="${importing_file#$REPO_ROOT/}"
                    echo "- \`$RELATIVE_PATH\`" >> "$OUTPUT_FILE"
                fi
            fi
        done
        echo "" >> "$OUTPUT_FILE"
    fi
done

if [ "$DEPENDENCIES_FOUND" = false ]; then
    echo "✅ No external dependencies found. This feature appears to be isolated." >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
fi

echo "---" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Scan for route dependencies
echo "## Route Dependencies" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

ROUTE_FILES=$(find "$REPO_ROOT/app/routes" -type f -name "*.tsx" -o -name "*.ts" 2>/dev/null || true)
ROUTE_DEPS_FOUND=false

if [ -n "$ROUTE_FILES" ]; then
    for feature_file in "${FEATURE_FILES[@]}"; do
        MODULE_PATH="${feature_file%.tsx}"
        MODULE_PATH="${MODULE_PATH%.ts}"

        ROUTE_MATCHES=$(echo "$ROUTE_FILES" | xargs grep -l "from ['\"].*$MODULE_PATH['\"]" 2>/dev/null || true)

        if [ -n "$ROUTE_MATCHES" ]; then
            ROUTE_DEPS_FOUND=true
            echo "Routes importing \`$feature_file\`:" >> "$OUTPUT_FILE"
            echo "" >> "$OUTPUT_FILE"
            echo "$ROUTE_MATCHES" | while read -r route_file; do
                RELATIVE_PATH="${route_file#$REPO_ROOT/}"
                echo "- \`$RELATIVE_PATH\`" >> "$OUTPUT_FILE"
            done
            echo "" >> "$OUTPUT_FILE"
        fi
    done
fi

if [ "$ROUTE_DEPS_FOUND" = false ]; then
    echo "✅ No route dependencies found." >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
fi

echo "---" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Scan for test dependencies
echo "## Test Dependencies" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

TEST_FILES=$(find "$REPO_ROOT/tests" "$REPO_ROOT/app" -type f \( -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.spec.ts" -o -name "*.spec.tsx" \) 2>/dev/null || true)
TEST_DEPS_FOUND=false

if [ -n "$TEST_FILES" ]; then
    for feature_file in "${FEATURE_FILES[@]}"; do
        MODULE_PATH="${feature_file%.tsx}"
        MODULE_PATH="${MODULE_PATH%.ts}"

        TEST_MATCHES=$(echo "$TEST_FILES" | xargs grep -l "$MODULE_PATH" 2>/dev/null || true)

        if [ -n "$TEST_MATCHES" ]; then
            TEST_DEPS_FOUND=true
            echo "Tests referencing \`$feature_file\`:" >> "$OUTPUT_FILE"
            echo "" >> "$OUTPUT_FILE"
            echo "$TEST_MATCHES" | while read -r test_file; do
                RELATIVE_PATH="${test_file#$REPO_ROOT/}"
                # Exclude tests that are part of the feature itself
                IS_FEATURE_TEST=false
                for ff in "${FEATURE_FILES[@]}"; do
                    if [[ "$test_file" == *"$ff"* ]]; then
                        IS_FEATURE_TEST=true
                        break
                    fi
                done

                if [ "$IS_FEATURE_TEST" = false ]; then
                    echo "- \`$RELATIVE_PATH\`" >> "$OUTPUT_FILE"
                fi
            done
            echo "" >> "$OUTPUT_FILE"
        fi
    done
fi

if [ "$TEST_DEPS_FOUND" = false ]; then
    echo "✅ No external test dependencies found." >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
fi

echo "---" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Database dependencies (look for schema references)
echo "## Database Dependencies" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

SCHEMA_FILES=$(find "$REPO_ROOT" -type f \( -name "schema.ts" -o -name "schema.js" -o -name "*migration*" \) 2>/dev/null | grep -v node_modules || true)

if [ -n "$SCHEMA_FILES" ]; then
    # Look for table/model names in feature files
    TABLES=()
    for feature_file in "${FEATURE_FILES[@]}"; do
        if [ -f "$REPO_ROOT/$feature_file" ]; then
            # Look for Drizzle table definitions
            while IFS= read -r line; do
                TABLES+=("$line")
            done < <(grep -oE 'export const [a-zA-Z_]+ = (pgTable|sqliteTable|mysqlTable)' "$REPO_ROOT/$feature_file" 2>/dev/null | cut -d' ' -f3 || true)
        fi
    done

    if [ ${#TABLES[@]} -gt 0 ]; then
        echo "Tables/schemas defined by this feature:" >> "$OUTPUT_FILE"
        echo "" >> "$OUTPUT_FILE"
        for table in "${TABLES[@]}"; do
            echo "- \`$table\` table" >> "$OUTPUT_FILE"
        done
        echo "" >> "$OUTPUT_FILE"
        echo "**⚠️ Important**: Before removing these tables, ensure:" >> "$OUTPUT_FILE"
        echo "- Data is backed up (if needed for compliance)" >> "$OUTPUT_FILE"
        echo "- No foreign key references from other tables" >> "$OUTPUT_FILE"
        echo "- Migration is tested in staging" >> "$OUTPUT_FILE"
        echo "" >> "$OUTPUT_FILE"
    else
        echo "✅ No database tables detected." >> "$OUTPUT_FILE"
        echo "" >> "$OUTPUT_FILE"
    fi
else
    echo "✅ No schema files found in project." >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
fi

echo "---" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Summary
echo "## Summary" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "- **Feature Files**: ${#FEATURE_FILES[@]}" >> "$OUTPUT_FILE"

TOTAL_DEPS=0
if [ "$DEPENDENCIES_FOUND" = true ]; then
    TOTAL_DEPS=$((TOTAL_DEPS + 1))
fi
if [ "$ROUTE_DEPS_FOUND" = true ]; then
    TOTAL_DEPS=$((TOTAL_DEPS + 1))
fi
if [ "$TEST_DEPS_FOUND" = true ]; then
    TOTAL_DEPS=$((TOTAL_DEPS + 1))
fi

echo "- **Dependency Categories**: $TOTAL_DEPS" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

if [ $TOTAL_DEPS -eq 0 ]; then
    echo "✅ **Low Risk**: This feature appears isolated with no external dependencies. Deprecation should be straightforward." >> "$OUTPUT_FILE"
elif [ $TOTAL_DEPS -eq 1 ]; then
    echo "⚠️ **Medium Risk**: Some dependencies detected. Review and update dependent code before removal." >> "$OUTPUT_FILE"
else
    echo "🚨 **High Risk**: Multiple dependency categories detected. Careful planning required for deprecation." >> "$OUTPUT_FILE"
fi

echo "" >> "$OUTPUT_FILE"
echo "---" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "*Scan completed: $(date -u +"%Y-%m-%d %H:%M:%S UTC")*" >> "$OUTPUT_FILE"

echo "✅ Dependency scan complete. Results written to: $OUTPUT_FILE" >&2
