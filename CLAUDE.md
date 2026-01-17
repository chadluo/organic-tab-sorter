# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chrome/Chromium browser extension called "Organic Tab Sorter" that sorts browser tabs by title or website. It uses Manifest V3, the latest Chrome extension API specification.

## Architecture

The extension follows a minimal Chrome extension structure:

- **manifest.json**: Extension configuration using Manifest V3. Defines the browser action popup and extension metadata.
- **hello.html**: The popup UI that appears when clicking the extension icon in the browser toolbar.
- **popup.js**: JavaScript logic for the popup interface.
- **hello_extensions.png**: Extension icon displayed in the browser toolbar.

Currently, the extension is in a basic state with placeholder popup content. The actual tab sorting functionality needs to be implemented in popup.js using the Chrome Tabs API.

## Development Workflow

### Loading the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right corner)
3. Click "Load unpacked"
4. Select this repository's root directory

### Testing Changes

After making code changes:
1. Go to `chrome://extensions/`
2. Click the refresh icon on the Organic Tab Sorter extension card
3. Click the extension icon in the toolbar to test the popup

Note: Changes to manifest.json require a full extension reload (remove and re-add the unpacked extension).

## Chrome Extension API Notes

Since this is a Manifest V3 extension:
- Use `chrome.tabs` API for tab management and sorting operations
- Background scripts must be service workers (not persistent background pages)
- Use `chrome.action` API for browser action (replaces `chrome.browserAction` from V2)
- Content Security Policy is more restrictive - inline scripts in HTML are not allowed
