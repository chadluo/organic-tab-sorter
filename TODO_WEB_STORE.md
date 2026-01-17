# Chrome Web Store Publication Checklist

## Required Before Submission

### 1. Icon Assets (CRITICAL)

- [ ] Create 48x48 pixel version of extension icon
- [ ] Create 128x128 pixel version of extension icon
- [ ] Update manifest.json to reference all icon sizes:

  ```json
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
  ```

- [ ] Create `icons/` folder and move all icon files there

### 2. Screenshots (CRITICAL)

- [ ] Take at least 1 screenshot showing the extension in action
  - Recommended size: 1280x800 or 640x400
  - Show the popup with sort buttons
  - Show before/after tab sorting if possible
- [ ] Consider taking 2-3 screenshots to show different features:
  - Screenshot 1: Extension popup interface
  - Screenshot 2: Tabs sorted by URL (domain grouping)
  - Screenshot 3: Tab groups preserved after sorting

### 3. Privacy Policy Hosting

- [ ] Host PRIVACY.md on GitHub Pages or another public URL
- [ ] Update STORE_LISTING.md with the actual privacy policy URL
- [ ] Test that the privacy policy URL is accessible

### 4. Repository/Homepage Setup

- [ ] Ensure GitHub repository is public (if using GitHub)
- [ ] Update STORE_LISTING.md with actual GitHub repository URL
- [ ] Consider adding screenshots to README.md as well

### 5. Chrome Web Store Developer Account

- [ ] Register for Chrome Web Store Developer account
  - URL: <https://chrome.google.com/webstore/devconsole>
  - One-time $5 registration fee required
- [ ] Verify email address
- [ ] Set up payment information (for the $5 fee)

## Submission Process

### 6. Package Extension

- [ ] Create a ZIP file containing:
  - manifest.json
  - background.js
  - popup.html
  - popup.js
  - All icon files (16x16, 48x48, 128x128)
  - Do NOT include:
    - CLAUDE.md
    - README.md
    - PRIVACY.md
    - STORE_LISTING.md
    - TODO_WEB_STORE.md
    - .git folder
    - Any other development files

### 7. Fill Out Store Listing

- [ ] Upload the ZIP package
- [ ] Enter Extension Name: "Organic Tab Sorter"
- [ ] Enter Short Description (use content from STORE_LISTING.md)
- [ ] Enter Detailed Description (use content from STORE_LISTING.md)
- [ ] Select Category: Productivity
- [ ] Select Language: English
- [ ] Upload icon (128x128) for store listing
- [ ] Upload screenshots (at least 1, up to 5 recommended)
- [ ] Enter Privacy Policy URL
- [ ] Enter Support/Homepage URL (GitHub repository)
- [ ] Add tags/keywords: tab management, tab organizer, tab sorter, productivity, browser tabs, domain sorting, keyboard shortcuts, tab groups

### 8. Optional Promotional Images

- [ ] Create 440x280 small tile icon (optional)
- [ ] Create 920x680 large tile promotional image (optional)
- [ ] Create 1400x560 marquee promotional image (optional)

### 9. Final Review

- [ ] Test the extension one more time locally
- [ ] Verify all permissions are necessary and documented
- [ ] Review store listing for typos
- [ ] Check that privacy policy is accurate
- [ ] Ensure all URLs work correctly

### 10. Submit for Review

- [ ] Submit extension to Chrome Web Store
- [ ] Wait for review (typically 1-3 days, can be longer)
- [ ] Respond to any feedback from Chrome Web Store review team
- [ ] Celebrate when approved! 🎉

## Post-Publication

### 11. After Approval

- [ ] Share the Chrome Web Store link
- [ ] Update README.md with installation link from Chrome Web Store
- [ ] Consider creating a simple landing page or documentation site
- [ ] Monitor reviews and user feedback
- [ ] Plan future updates and features

## Quick Command Reference

### To create icon sizes (using ImageMagick)

```bash
# From existing 16x16 icon, upscale to create others
convert hello_extensions.png -resize 48x48 icons/icon48.png
convert hello_extensions.png -resize 128x128 icons/icon128.png
```

### To create ZIP package

```bash
# Windows PowerShell
Compress-Archive -Path manifest.json,background.js,popup.html,popup.js,icons -DestinationPath organic-tab-sorter.zip

# Or manually select files and right-click > "Send to > Compressed (zipped) folder"
```

## Resources

- Chrome Web Store Developer Dashboard: <https://chrome.google.com/webstore/devconsole>
- Extension Publishing Guide: <https://developer.chrome.com/docs/webstore/publish/>
- Branding Guidelines: <https://developer.chrome.com/docs/webstore/branding/>
- Best Practices: <https://developer.chrome.com/docs/webstore/best_practices/>
