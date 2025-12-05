#!/bin/bash

# Automated Test Runner Wrapper
# Supports both Python and Node.js test runners

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=========================================="
echo "  Weather Dashboard Test Suite"
echo "=========================================="
echo ""

# Try Python first (most universally available)
if command -v python3 &> /dev/null; then
    echo "Running tests with Python..."
    echo ""
    python3 run_tests.py
    exit_code=$?
elif command -v python &> /dev/null; then
    echo "Running tests with Python..."
    echo ""
    python run_tests.py
    exit_code=$?
# Fall back to Node.js if available
elif command -v node &> /dev/null; then
    echo "Running tests with Node.js..."
    echo ""
    node run-tests.js
    exit_code=$?
else
    echo "ERROR: Neither Python 3 nor Node.js found."
    echo "Please install Python 3 or Node.js to run tests."
    exit 1
fi

exit $exit_code

