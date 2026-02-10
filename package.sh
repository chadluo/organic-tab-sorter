#!/bin/bash
# Package Chrome Extension for Web Store Submission
# This script creates a zip archive containing only the required extension files

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ZIP_FILE="organic-tab-sorter.zip"
ZIP_PATH="$SCRIPT_DIR/$ZIP_FILE"

# Files and folders to include in the package
FILES_TO_INCLUDE=(
    "manifest.json"
    "background.js"
    "popup.html"
    "popup.js"
    "icons"
)

# Remove existing zip file if it exists
if [ -f "$ZIP_PATH" ]; then
    echo -e "\033[33mRemoving existing $ZIP_FILE...\033[0m"
    rm -f "$ZIP_PATH"
fi

# Verify all required files exist
echo -e "\033[36mVerifying required files...\033[0m"
ALL_FILES_EXIST=true
for file in "${FILES_TO_INCLUDE[@]}"; do
    if [ ! -e "$SCRIPT_DIR/$file" ]; then
        echo -e "  \033[31mERROR: Required file/folder not found: $file\033[0m"
        ALL_FILES_EXIST=false
    else
        echo -e "  \033[32m✓ Found: $file\033[0m"
    fi
done

if [ "$ALL_FILES_EXIST" = false ]; then
    echo -e "\n\033[31mPackaging aborted due to missing files.\033[0m"
    exit 1
fi

# Create the zip archive
echo -e "\n\033[36mCreating zip archive...\033[0m"
cd "$SCRIPT_DIR" || exit 1
if zip -r "$ZIP_PATH" "${FILES_TO_INCLUDE[@]}"; then
    echo -e "\n\033[32m✓ Successfully created: $ZIP_FILE\033[0m"

    # Display zip file information
    SIZE_KB=$(awk "BEGIN {printf \"%.2f\", $(stat -f%z "$ZIP_PATH") / 1024}")
    echo -e "\n\033[36mPackage Details:\033[0m"
    echo "  Location: $ZIP_PATH"
    echo "  Size: ${SIZE_KB} KB"

    # List contents of the zip
    echo -e "\n\033[36mPackage Contents:\033[0m"
    zipinfo -1 "$ZIP_PATH" | while read -r entry; do
        echo "  - $entry"
    done

    echo -e "\n\033[32m✓ Package ready for Chrome Web Store submission!\033[0m"
else
    echo -e "\n\033[31mERROR: Failed to create zip archive\033[0m"
    exit 1
fi
