#!/bin/bash
# Scans a client folder's _assets/ directory and prints a JS array of filenames.
# Usage: ./scan-assets.sh r1
#   Output can be pasted into the CONFIG.assets array in index.html.

if [ -z "$1" ]; then
  echo "Usage: $0 <client-folder>"
  exit 1
fi

ASSETS_DIR="$1/_assets"

if [ ! -d "$ASSETS_DIR" ]; then
  echo "Error: $ASSETS_DIR not found"
  exit 1
fi

echo "["
ls "$ASSETS_DIR" | sort -t_ -k2 -n | while IFS= read -r file; do
  echo "  \"$file\","
done
echo "]"
