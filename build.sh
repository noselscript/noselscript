#!/bin/bash

# Exit the script immediately if any command fails
set -e

echo "Installing package 'pkg'..."
npm install pkg

echo "Running 'npm run build'..."
npm run build

echo "Build completed successfully."