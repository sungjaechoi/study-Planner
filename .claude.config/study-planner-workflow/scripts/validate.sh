#!/bin/bash

# Workflow Validation Script
# Validates workflow structure and configuration

set -e

echo "🔍 Validating workflow structure..."
echo ""

ERRORS=0

# Check required files
check_file() {
  if [ -f "$1" ]; then
    echo "✓ $1"
  else
    echo "✗ $1 (missing)"
    ERRORS=$((ERRORS + 1))
  fi
}

check_dir() {
  if [ -d "$1" ]; then
    echo "✓ $1/"
  else
    echo "✗ $1/ (missing)"
    ERRORS=$((ERRORS + 1))
  fi
}

echo "📁 Checking required directories..."
check_dir ".claude"
check_dir ".claude/commands"
check_dir ".claude/agents"

echo ""
echo "📄 Checking required files..."
check_file ".claude/commands/study-planner-workflow.md"
check_file ".claude/CLAUDE.md"

echo ""
echo "📊 Checking config directories..."
check_dir ".claude.config/study-planner-workflow"
check_dir ".claude.config/structured-development:-fullstack/states"
check_dir ".claude.config/study-planner-workflow/docs/workflow-execution.log"

echo ""
if [ $ERRORS -eq 0 ]; then
  echo "✅ All checks passed!"
  exit 0
else
  echo "❌ $ERRORS error(s) found"
  exit 1
fi
