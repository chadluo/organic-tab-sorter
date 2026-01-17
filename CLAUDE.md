# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chrome/Chromium browser extension called "Organic Tab Sorter" that sorts browser tabs by title or URL with domain-aware sorting. It uses Manifest V3, the latest Chrome extension API specification.

## Architecture

The extension follows a standard Manifest V3 Chrome extension structure with a background service worker:

### Core Files

- **manifest.json**: Extension configuration with permissions (`tabs`, `storage`, `tabGroups`), keyboard commands, and background service worker definition
- **background.js**: Background service worker that handles all tab sorting logic and listens for keyboard shortcuts
- **hello.html**: Popup UI with sort buttons, settings controls, and visual feedback
- **popup.js**: Popup script that handles UI interactions and communicates with background worker via message passing
- **hello_extensions.png**: Extension icon displayed in the browser toolbar

### Key Implementation Details

**Sorting Logic (background.js)**:

- `sortByTitle()`: Sorts tabs alphabetically using `localeCompare()`
- `sortByUrl()`: Domain-aware sorting that parses URLs into sort keys like `/com/google/dev/path`
- `getUrlSortKey()`: Reverses domain parts (TLD first) and appends path for intelligent grouping
- Pinned tabs are kept at the beginning and sorted separately within their group
- Grouped tabs are preserved in their original order and moved to the left side (after pinned tabs, before ungrouped tabs)
- Only ungrouped tabs are sorted and reordered

**Message Passing Architecture**:

- Popup sends messages to background worker via `chrome.runtime.sendMessage()`
- Background worker responds with success/error status
- Keyboard shortcuts trigger sorting directly in background worker without popup

**Settings Storage**:

- Uses `chrome.storage.sync` for cross-device preference sync
- Stores `defaultSortMode` as either "title" or "url"
- Settings loaded on popup open and saved on radio button change

## Development Workflow

### Loading the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right corner)
3. Click "Load unpacked"
4. Select this repository's root directory

### Testing Changes

After making code changes:

**For popup.js or hello.html changes**:

1. Close the popup (if open)
2. Reopen the popup - changes take effect immediately

**For background.js changes**:

1. Go to `chrome://extensions/`
2. Click the refresh icon on the Organic Tab Sorter extension card
3. Test the functionality

**For manifest.json changes**:

1. Go to `chrome://extensions/`
2. Click "Remove" on the extension
3. Click "Load unpacked" again to reload with new manifest

### Testing Keyboard Shortcuts

- Open multiple tabs with various URLs
- Create some tab groups with multiple tabs
- Press `Alt+Shift+T` to test title sorting
- Press `Alt+Shift+U` to test URL sorting
- Verify tabs reorder without opening popup
- Verify grouped tabs move to the left and maintain their internal order

### Debugging

- **Background worker console**: Go to `chrome://extensions/`, find the extension, click "service worker" link
- **Popup console**: Right-click popup, select "Inspect"

## Chrome Extension API Notes

### Manifest V3 Specifics

- Background scripts must be service workers (not persistent background pages)
- Use `chrome.action` API for browser action (replaces `chrome.browserAction` from V2)
- Commands API (`chrome.commands`) defines keyboard shortcuts
- Content Security Policy is more restrictive - inline scripts in HTML are not allowed

### Permissions Used

- `tabs`: Required to query and reorder tabs in the current window
- `storage`: Required to persist user's default sort preference
- `tabGroups`: Required to detect and preserve tab groups during sorting

### Key APIs Used

- `chrome.tabs.query({ currentWindow: true })`: Get all tabs in active window
- `chrome.tabs.move(tabId, { index: newIndex })`: Reorder tabs
- `chrome.tabGroups.TAB_GROUP_ID_NONE`: Constant to identify ungrouped tabs
- `chrome.commands.onCommand`: Listen for keyboard shortcuts
- `chrome.runtime.sendMessage()`: Send messages from popup to background
- `chrome.runtime.onMessage`: Receive messages in background worker
- `chrome.storage.sync.set()` / `chrome.storage.sync.get()`: Persist settings

## Common Development Tasks

### Adding a New Sort Mode

1. Implement sort function in [background.js](background.js)
2. Add command to manifest.json `commands` section if keyboard shortcut needed
3. Add button to [hello.html](hello.html)
4. Add click handler in [popup.js](popup.js) that sends appropriate message
5. Update settings storage to include new mode option

### Modifying Sort Behavior

All sorting logic is in [background.js](background.js). The two main functions are:

- `sortByTitle()` - Modify for title sorting changes
- `sortByUrl()` - Modify for URL sorting changes
- `getUrlSortKey()` - Modify to change how URLs are parsed/grouped

Both sorting functions follow this pattern:

1. Separate tabs into pinned, grouped, and ungrouped categories
2. Sort only pinned and ungrouped tabs
3. Preserve grouped tabs in their original order
4. Arrange final order as: pinned → grouped → ungrouped

### Changing Keyboard Shortcuts

Edit the `commands` section in [manifest.json](manifest.json). Default shortcuts are `Alt+Shift+T` (title) and `Alt+Shift+U` (URL). Users can customize shortcuts via `chrome://extensions/shortcuts`.

### Working with Tab Groups

Tab groups are handled using the `chrome.tabGroups` API:

- `tab.groupId`: Contains the group ID for grouped tabs, or `chrome.tabGroups.TAB_GROUP_ID_NONE` for ungrouped tabs
- Grouped tabs are filtered out during sorting to preserve their original order
- After sorting, grouped tabs are positioned between pinned and ungrouped tabs
