#!/bin/bash
# Rebuild script - runs detached from Node.js

cd "C:\Users\antho\OneDrive\Desktop\Maida\IT\Website\maida.pt"

# Log file for debugging
exec > rebuild.log 2>&1

echo "$(date): Rebuild started"

# Wait for the HTTP response to complete
sleep 3

echo "$(date): Clearing .next cache..."
rm -rf .next

echo "$(date): Running npm build..."
npm run build

echo "$(date): Rebuild complete!"
