#!/bin/bash
# Scans a client folder's _assets/ directory and writes _assets/manifest.json.
# Usage: ./scan-assets.sh r1

if [ -z "$1" ]; then
  echo "Usage: $0 <client-folder>"
  exit 1
fi

ASSETS_DIR="$1/_assets"

if [ ! -d "$ASSETS_DIR" ]; then
  echo "Error: $ASSETS_DIR not found"
  exit 1
fi

# Write manifest.json using python3 for proper JSON encoding
ls "$ASSETS_DIR" | sort -t_ -k2 -n | grep -v "^manifest\.json$" | \
  python3 -c "import sys, json; print(json.dumps(sys.stdin.read().splitlines(), indent=2))" \
  > "$ASSETS_DIR/manifest.json"

echo "✓ Written: $ASSETS_DIR/manifest.json"
