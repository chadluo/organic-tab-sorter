# Chrome Web Store Listing

## Extension Name

Organic Tab Sorter

## Short Description (132 characters max)

Sort browser tabs by title or URL with intelligent domain grouping. Preserves pinned tabs and tab groups.

## Detailed Description

A browser extension that sorts tabs in the current window by title or URL.

## Features

### Sort by Title

Alphabetically sorts tabs by their page titles using standard locale-aware comparison.

### Sort by URL

Domain-aware sorting that groups tabs from the same website together. URLs are parsed and sorted by protocol, then domain hierarchy (excluding generic TLDs like .com/.net/.org), then path. For example:

- All `https://` sites are grouped separately from `chrome://` pages
- `developers.google.com` and `mail.google.com` appear adjacent
- `github.com/user/repo1` and `github.com/user/repo2` are grouped together
- Sites with semantic TLDs (like `.ai`, `.dev`) are kept grouped by those TLDs

### Keyboard Shortcuts

By default:

- Alt+Shift+S: Sort tabs using your default sort preference
- Customizable via chrome://extensions/shortcuts

### Settings

Default sort preference is saved and syncs across Chrome browsers when signed in.

## Privacy

The extension only stores your sort preference using Chrome's sync storage. No browsing data, page content, or usage analytics are collected or transmitted.

## Category

Productivity

## Language

English

## Privacy Policy URL

<https://github.com/chadluo/organic-tab-sorter/blob/main/PRIVACY.md>

## Support/Homepage URL

<https://github.com/chadluo/organic-tab-sorter>

## Tags/Keywords

tab management, tab organizer, tab sorter, productivity, browser tabs, domain sorting, keyboard shortcuts, tab groups
