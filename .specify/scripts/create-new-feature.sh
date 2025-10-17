#!/usr/bin/env bash
# Script to create a new feature branch and spec directory

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

REPO_ROOT=$(get_repo_root)

# Get next feature number
get_next_feature_number() {
    local specs_dir="$REPO_ROOT/.specify/specs"
    if [ ! -d "$specs_dir" ]; then
        echo "001"
        return
    fi
    
    local max_num=0
    for dir in "$specs_dir"/*; do
        if [ -d "$dir" ]; then
            local basename=$(basename "$dir")
            if [[ $basename =~ ^([0-9]+)- ]]; then
                local num=$((10#${BASH_REMATCH[1]}))
                if [ $num -gt $max_num ]; then
                    max_num=$num
                fi
            fi
        fi
    done
    
    printf "%03d" $((max_num + 1))
}

# Main
if [ $# -lt 1 ]; then
    error "Usage: $0 <feature-name>"
    exit 1
fi

FEATURE_NAME="$1"
FEATURE_NUM=$(get_next_feature_number)
BRANCH_NAME="${FEATURE_NUM}-${FEATURE_NAME}"
SPEC_DIR="$REPO_ROOT/.specify/specs/${BRANCH_NAME}"

info "Creating feature: $BRANCH_NAME"

# Create branch
git checkout -b "$BRANCH_NAME" 2>/dev/null || {
    warning "Branch $BRANCH_NAME already exists, switching to it"
    git checkout "$BRANCH_NAME"
}

# Create spec directory
mkdir -p "$SPEC_DIR"

# Copy spec template
cp "$REPO_ROOT/.specify/templates/spec-template.md" "$SPEC_DIR/spec.md"

# Update template with feature info
sed -i "s/\[FEATURE NAME\]/$FEATURE_NAME/g" "$SPEC_DIR/spec.md" 2>/dev/null || \
    sed -i '' "s/\[FEATURE NAME\]/$FEATURE_NAME/g" "$SPEC_DIR/spec.md" 2>/dev/null || true
sed -i "s/\[###-feature-name\]/$BRANCH_NAME/g" "$SPEC_DIR/spec.md" 2>/dev/null || \
    sed -i '' "s/\[###-feature-name\]/$BRANCH_NAME/g" "$SPEC_DIR/spec.md" 2>/dev/null || true
sed -i "s/\[DATE\]/$(date +%Y-%m-%d)/g" "$SPEC_DIR/spec.md" 2>/dev/null || \
    sed -i '' "s/\[DATE\]/$(date +%Y-%m-%d)/g" "$SPEC_DIR/spec.md" 2>/dev/null || true

success "✓ Created feature branch: $BRANCH_NAME"
success "✓ Created spec directory: $SPEC_DIR"
info "Next steps:"
info "  1. Edit $SPEC_DIR/spec.md to define your feature"
info "  2. Run /speckit.plan to create implementation plan"
