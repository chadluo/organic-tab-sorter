# Organic Tab Sorter

A Chrome extension that sorts browser tabs in the current window by title or URL with domain-aware sorting.

## Features

- **Sort by Title**: Alphabetically sort tabs by their page title
- **Sort by URL**: Domain-aware sorting that groups related sites together
  - Groups by top-level domain, then second-level domain, then subdomains
  - Example: `dev.google.com` and `mail.google.com` are grouped together
- **Keyboard Shortcuts**:
  - `Ctrl+Shift+T` - Sort by title
  - `Ctrl+Shift+U` - Sort by URL
- **Persistent Settings**: Save your preferred default sort mode
- **Pinned Tab Support**: Pinned tabs stay pinned and at the beginning

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
- Press `Ctrl+Shift+T` to sort by title (works without opening popup)
- Press `Ctrl+Shift+U` to sort by URL (works without opening popup)

## How URL Sorting Works

The extension uses domain-aware sorting to intelligently group related websites:

- `https://dev.google.com/products` → `/com/google/dev/products`
- `https://mail.google.com/inbox` → `/com/google/mail/inbox`
- `https://developer.apple.com/docs` → `/com/apple/developer/docs`

This ensures:
- Sites with the same domain are grouped together
- Subdomains are sorted logically within their parent domain
- `dev.google.com` appears near `mail.google.com`, not near `dev.apple.com`

## Development

See [CLAUDE.md](CLAUDE.md) for detailed development guidance and architecture information.
