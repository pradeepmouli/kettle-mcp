#!/usr/bin/env bash

set -e

MODE=""
REFACTOR_DIR=""

# Parse arguments
while [[ $# -gt 0 ]]; do
    case "$1" in
        --before)
            MODE="before"
            shift
            ;;
        --after)
            MODE="after"
            shift
            ;;
        --dir)
            REFACTOR_DIR="$2"
            shift 2
            ;;
        --help|-h)
            echo "Usage: $0 --before|--after [--dir <refactor-dir>]"
            echo ""
            echo "Captures code metrics for refactoring validation"
            echo ""
            echo "Options:"
            echo "  --before    Capture baseline metrics before refactoring"
            echo "  --after     Capture metrics after refactoring"
            echo "  --dir       Refactor directory (auto-detected if not provided)"
            exit 0
            ;;
        *)
            echo "Unknown option: $1" >&2
            exit 1
            ;;
    esac
done

if [ -z "$MODE" ]; then
    echo "Error: Must specify --before or --after" >&2
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
    echo "Error: Could not find repository root" >&2
    exit 1
fi

cd "$REPO_ROOT"

# Auto-detect refactor directory if not provided
if [ -z "$REFACTOR_DIR" ]; then
    # Look for most recent refactor directory
    REFACTOR_DIR=$(find "$REPO_ROOT/specs" -maxdepth 1 -type d -name "refactor-*" | sort -r | head -1)
    if [ -z "$REFACTOR_DIR" ]; then
        echo "Error: No refactor directory found. Use --dir to specify." >&2
        exit 1
    fi
fi

OUTPUT_FILE="$REFACTOR_DIR/metrics-${MODE}.md"

echo "Capturing ${MODE} metrics to: $OUTPUT_FILE"
echo ""

# Start output file
cat > "$OUTPUT_FILE" << EOF
# Metrics Captured ${MODE^} Refactoring

**Timestamp**: $(date)
**Git Commit**: $(git rev-parse --short HEAD 2>/dev/null || echo "N/A")
**Branch**: $(git branch --show-current 2>/dev/null || echo "N/A")

---

EOF

# Code Complexity Metrics
echo "## Code Complexity" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Lines of Code
echo "### Lines of Code" >> "$OUTPUT_FILE"
if command -v cloc &> /dev/null; then
    echo "Running cloc analysis..." >&2
    echo '```' >> "$OUTPUT_FILE"
    cloc app/ --quiet --csv --csv-delimiter='|' 2>/dev/null | head -20 >> "$OUTPUT_FILE" || echo "cloc failed" >> "$OUTPUT_FILE"
    echo '```' >> "$OUTPUT_FILE"
else
    echo "Manual count needed (cloc not installed):" >> "$OUTPUT_FILE"
    find app/ -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" 2>/dev/null | wc -l >> "$OUTPUT_FILE" || echo "0" >> "$OUTPUT_FILE"
fi
echo "" >> "$OUTPUT_FILE"

# Function/File sizes
echo "### File Sizes" >> "$OUTPUT_FILE"
echo '```' >> "$OUTPUT_FILE"
find app/ -type f \( -name "*.ts" -o -name "*.tsx" \) -exec wc -l {} \; 2>/dev/null | sort -rn | head -10 >> "$OUTPUT_FILE" || echo "No files found" >> "$OUTPUT_FILE"
echo '```' >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Test Coverage
echo "## Test Coverage" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

if [ -f "coverage/coverage-summary.json" ]; then
    echo "Reading coverage from coverage/coverage-summary.json..." >&2
    echo '```json' >> "$OUTPUT_FILE"
    cat coverage/coverage-summary.json >> "$OUTPUT_FILE"
    echo '```' >> "$OUTPUT_FILE"
else
    echo "Coverage data not found. Run tests with coverage:" >> "$OUTPUT_FILE"
    echo '```bash' >> "$OUTPUT_FILE"
    echo "npm run test:coverage  # or equivalent command" >> "$OUTPUT_FILE"
    echo '```' >> "$OUTPUT_FILE"
fi
echo "" >> "$OUTPUT_FILE"

# Performance Metrics
echo "## Performance" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

echo "### Build Time" >> "$OUTPUT_FILE"
if [ "$MODE" = "before" ]; then
    echo "Measuring build time (may take a minute)..." >&2
    BUILD_START=$(date +%s)
    npm run build > /dev/null 2>&1 || true
    BUILD_END=$(date +%s)
    BUILD_TIME=$((BUILD_END - BUILD_START))
    echo "- **Build Time**: ${BUILD_TIME} seconds" >> "$OUTPUT_FILE"
else
    echo "- **Build Time**: Run \`npm run build\` and time it" >> "$OUTPUT_FILE"
fi
echo "" >> "$OUTPUT_FILE"

echo "### Bundle Size" >> "$OUTPUT_FILE"
if [ -d "build/client" ] || [ -d "dist/client" ]; then
    BUILD_DIR=$(find . -type d -name "client" | grep -E "(build|dist)" | head -1)
    if [ -n "$BUILD_DIR" ]; then
        BUNDLE_SIZE=$(du -sh "$BUILD_DIR" | cut -f1)
        echo "- **Bundle Size**: $BUNDLE_SIZE" >> "$OUTPUT_FILE"
    else
        echo "- **Bundle Size**: Build directory not found" >> "$OUTPUT_FILE"
    fi
else
    echo "- **Bundle Size**: Build directory not found (run build first)" >> "$OUTPUT_FILE"
fi
echo "" >> "$OUTPUT_FILE"

# Dependencies
echo "## Dependencies" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

if [ -f "package.json" ]; then
    DIRECT_DEPS=$(jq '.dependencies | length' package.json 2>/dev/null || echo "unknown")
    DEV_DEPS=$(jq '.devDependencies | length' package.json 2>/dev/null || echo "unknown")
    echo "- **Direct Dependencies**: $DIRECT_DEPS" >> "$OUTPUT_FILE"
    echo "- **Dev Dependencies**: $DEV_DEPS" >> "$OUTPUT_FILE"

    if command -v npm &> /dev/null; then
        TOTAL_DEPS=$(npm list --depth=0 2>/dev/null | grep -c "^[├└]" || echo "unknown")
        echo "- **Total Installed**: $TOTAL_DEPS" >> "$OUTPUT_FILE"
    fi
else
    echo "- **Dependencies**: package.json not found" >> "$OUTPUT_FILE"
fi
echo "" >> "$OUTPUT_FILE"

# Test Suite Stats
echo "## Test Suite" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

TEST_FILES=$(find tests/ -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.spec.ts" 2>/dev/null | wc -l)
echo "- **Test Files**: $TEST_FILES" >> "$OUTPUT_FILE"

if [ "$MODE" = "before" ]; then
    echo "- **Test Pass Rate**: Run \`npm test\` to verify 100%" >> "$OUTPUT_FILE"
else
    echo "- **Test Pass Rate**: Should be 100% (verify with \`npm test\`)" >> "$OUTPUT_FILE"
fi
echo "" >> "$OUTPUT_FILE"

# Git Stats
echo "## Git Statistics" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

if git rev-parse --git-dir > /dev/null 2>&1; then
    FILES_CHANGED=$(git diff --name-only ${MODE} | wc -l 2>/dev/null || echo "0")
    echo "- **Files Modified**: $FILES_CHANGED (since start of refactoring)" >> "$OUTPUT_FILE"
else
    echo "- **Git**: Not a git repository" >> "$OUTPUT_FILE"
fi
echo "" >> "$OUTPUT_FILE"

# Summary
echo "## Summary" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "Metrics captured ${MODE} refactoring at $(date)." >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

if [ "$MODE" = "after" ]; then
    echo "**Next Steps**:" >> "$OUTPUT_FILE"
    echo "1. Compare with metrics-before.md" >> "$OUTPUT_FILE"
    echo "2. Verify improvements achieved" >> "$OUTPUT_FILE"
    echo "3. Check no unexpected regressions" >> "$OUTPUT_FILE"
    echo "4. Document improvements in refactor-spec.md" >> "$OUTPUT_FILE"
fi

echo "---" >> "$OUTPUT_FILE"
echo "*Metrics captured using measure-metrics.sh*" >> "$OUTPUT_FILE"

echo ""
echo "Metrics saved to: $OUTPUT_FILE"
echo "Done!"
