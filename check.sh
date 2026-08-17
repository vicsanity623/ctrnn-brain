#!/usr/bin/env bash
# Strict Repository Validation Pipeline (V3 - Jest Tests)

set -e 
set -u 

echo "=========================================="
echo " Starting Strict Quality Checks..."
echo "=========================================="

# 1. Verify necessary Web Files exist
echo "[1/4] Checking required web files..."
REQUIRED_FILES=("index.html" "game.js" "style.css" "package.json" "game.test.js")
for FILE in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$FILE" ]; then
        echo "❌ ERROR: Required file '$FILE' is missing."
        exit 1
    fi
done

# 2. Verify Internal Links 
echo "[2/4] Validating internal file references..."
links=$(grep -oE '(href|src)="([^"#]+)"' index.html | cut -d'"' -f2)
for link in $links; do
    if [[ $link == http* ]] || [[ $link == \$\{* ]]; then continue; fi 
    if [ ! -f "$link" ]; then
        echo "❌ ERROR: index.html references '$link', but the file does not exist."
        exit 1
    fi
done

# 3. HTML Integrity
echo "[3/4] Checking HTML/CSS Integrity..."
if ! grep -q "inventory-modal" index.html; then
    echo "❌ ERROR: Inventory Modal missing from index.html."
    exit 1
fi
if ! grep -q "stats-modal" index.html; then
    echo "❌ ERROR: Stats Modal missing from index.html."
    exit 1
fi

# 4. Strict JavaScript Logic & DOM Tests
echo "[4/4] Running Jest Game Logic Tests..."
# Install testing tools if they aren't downloaded yet
if [ ! -d "node_modules" ]; then
    echo "Installing test dependencies (Jest)..."
    npm install --silent
fi

# Run the test suite!
if npm test; then
    echo "✅ JavaScript Unit Tests passed perfectly."
else
    echo "❌ ERROR: Game Logic tests failed! Check test output above."
    exit 1
fi

echo "=========================================="
echo "🎉 ALL CHECKS PASSED. Code is completely stable!"
echo "=========================================="
