#!/bin/bash

# Script to estimate Vercel serverless function size for Python API routes

echo "Estimating unzipped deployment size..."

# Create a temporary directory for the mock build
TEMP_DIR=$(mktemp -d)
echo "Working in temporary directory: $TEMP_DIR"

# Copy requirements
cp chip_clock/requirements.txt "$TEMP_DIR/"

# Setup venv and install
cd "$TEMP_DIR"
python3 -m venv venv
source venv/bin/activate
echo "Installing dependencies (this may take a minute)..."
pip install -r requirements.txt -q

# Calculate size in MB
SIZE_KB=$(du -sk venv | awk '{print $1}')
SIZE_MB=$(echo "scale=2; $SIZE_KB / 1024" | bc)

echo "Estimated unzipped size: $SIZE_MB MB"

# Clean up
cd - > /dev/null
rm -rf "$TEMP_DIR"

# Vercel limit is 250MB
LIMIT=240

if (( $(echo "$SIZE_MB > $LIMIT" | bc -l) )); then
    echo "ERROR: Estimated size ($SIZE_MB MB) exceeds the safe limit of $LIMIT MB!"
    exit 1
else
    echo "SUCCESS: Estimated size is within limits."
    exit 0
fi
