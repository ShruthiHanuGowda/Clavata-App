#!/bin/bash

# Script to set up environment file based on target
# This script should be added as a "Run Script" build phase BEFORE "Bundle React Native code and images"

set -e

PROJECT_ROOT="$PROJECT_DIR/.."

echo "========================================"
echo "🔧 ENVIRONMENT SETUP SCRIPT"
echo "========================================"
echo "Target Name: $TARGET_NAME"
echo "Project Dir: $PROJECT_DIR"
echo "Project Root: $PROJECT_ROOT"

# Determine which env file to use based on target name
if [ "$TARGET_NAME" = "DWallet" ]; then
    ENV_FILE=".env.dwallet"
    echo "✅ Using PRODUCTION environment: $ENV_FILE"
elif [ "$TARGET_NAME" = "DWallet TestNet" ]; then
    ENV_FILE=".env.dwallet.testnet"
    echo "✅ Using TESTNET environment: $ENV_FILE"
else
    echo "⚠️ Warning: Unknown target '$TARGET_NAME', defaulting to .env"
    ENV_FILE=".env"
fi

# Create symlink to the appropriate env file
cd "$PROJECT_ROOT"

if [ -f "$ENV_FILE" ]; then
    echo "📋 Copying $ENV_FILE to .env for react-native-config"
    cp "$ENV_FILE" ".env"

    # Show first few lines to verify
    echo "📄 Verification - First 3 lines of .env:"
    head -3 ".env"

    echo "✅ Environment setup complete!"
    echo "========================================"
else
    echo "❌ Error: Environment file $ENV_FILE not found in $PROJECT_ROOT!"
    echo "Available files:"
    ls -la .env* || true
    exit 1
fi
