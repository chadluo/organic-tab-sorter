# Organic Tab Sorter

A Chrome extension that sorts browser tabs in the current window by title or URL with domain-aware sorting.

## Features

- **Sort by Title**: Alphabetically sort tabs by their page title
- **Sort by URL**: Domain-aware sorting that groups related sites together
  - Groups by top-level domain, then second-level domain, then subdomains
  - Example: `dev.google.com` and `mail.google.com` are grouped together
- **Keyboard Shortcuts**:
  - `Alt+Shift+T` - Sort by title
  - `Alt+Shift+U` - Sort by URL
- **Persistent Settings**: Save your preferred default sort mode
- **Pinned Tab Support**: Pinned tabs stay pinned and at the beginning
- **Tab Group Support**: Tab groups are preserved and moved to the left side
  - Tabs within groups maintain their original order
  - Groups are positioned after pinned tabs but before ungrouped tabs

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right corner)
3. Click "Load unpacked"
4. Select this repository's directory

## Usage

### Via Popup

1. Click the extension icon in the Chrome toolbar
2. Click "By Title" or "By URL" to sort tabs
3. Set your default sort preference using the radio buttons

### Via Keyboard Shortcuts

- Press `Alt+Shift+T` to sort by title (works without opening popup)
- Press `Alt+Shift+U` to sort by URL (works without opening popup)

## How URL Sorting Works

The extension uses domain-aware sorting to intelligently group related websites:

- `https://dev.google.com/products` → `/com/google/dev/products`
- `https://mail.google.com/inbox` → `/com/google/mail/inbox`
- `https://developer.apple.com/docs` → `/com/apple/developer/docs`

This ensures:

- Sites with the same domain are grouped together
- Subdomains are sorted logically within their parent domain
- `dev.google.com` appears near `mail.google.com`, not near `dev.apple.com`

## Tab Organization

When sorting, tabs are organized in this order:

1. **Pinned tabs** (sorted by title or URL)
2. **Grouped tabs** (moved to the left, original order preserved within each group)
3. **Ungrouped tabs** (sorted by title or URL)

This ensures that:

- Your pinned tabs always stay at the beginning
- Tab groups remain intact and are positioned on the left side
- Tabs within groups keep their original arrangement
- Only ungrouped tabs are sorted and reordered

## Development

See [CLAUDE.md](CLAUDE.md) for detailed development guidance and architecture information.
