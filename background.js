// Background service worker for Organic Tab Sorter

// Parse URL to create sort key for domain-aware sorting
function getUrlSortKey(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    const parts = hostname.split('.').reverse(); // ["com", "google", "dev"]
    const path = urlObj.pathname;

    // Generic TLDs to ignore when sorting (common, non-semantic TLDs)
    const genericTlds = new Set(['com', 'net', 'org']);

    // Remove the TLD (first element after reverse) if it's a generic one
    // This keeps semantic TLDs like 'ai', 'gallery', 'dev', etc.
    if (parts.length > 0 && genericTlds.has(parts[0])) {
      parts.shift(); // Remove the generic TLD
    }

    return '/' + parts.join('/') + path; // "/google/dev/products/chrome"
  } catch (error) {
    // Handle invalid URLs (chrome://, about:, etc.)
    return url;
  }
}

// Sort tabs by title
async function sortByTitle() {
  const tabs = await chrome.tabs.query({ currentWindow: true });

  // Separate pinned and unpinned tabs
  const pinnedTabs = tabs.filter(tab => tab.pinned);
  const unpinnedTabs = tabs.filter(tab => !tab.pinned);

  // Sort pinned tabs by title
  pinnedTabs.sort((a, b) => a.title.localeCompare(b.title));

  // Sort unpinned tabs by title
  unpinnedTabs.sort((a, b) => a.title.localeCompare(b.title));

  // Move tabs to their new positions
  const sortedTabs = [...pinnedTabs, ...unpinnedTabs];
  for (let i = 0; i < sortedTabs.length; i++) {
    await chrome.tabs.move(sortedTabs[i].id, { index: i });
  }
}

// Sort tabs by URL (domain-aware)
async function sortByUrl() {
  const tabs = await chrome.tabs.query({ currentWindow: true });

  // Separate pinned and unpinned tabs
  const pinnedTabs = tabs.filter(tab => tab.pinned);
  const unpinnedTabs = tabs.filter(tab => !tab.pinned);

  // Sort pinned tabs by URL
  pinnedTabs.sort((a, b) => {
    const keyA = getUrlSortKey(a.url);
    const keyB = getUrlSortKey(b.url);
    return keyA.localeCompare(keyB);
  });

  // Sort unpinned tabs by URL
  unpinnedTabs.sort((a, b) => {
    const keyA = getUrlSortKey(a.url);
    const keyB = getUrlSortKey(b.url);
    return keyA.localeCompare(keyB);
  });

  // Move tabs to their new positions
  const sortedTabs = [...pinnedTabs, ...unpinnedTabs];
  for (let i = 0; i < sortedTabs.length; i++) {
    await chrome.tabs.move(sortedTabs[i].id, { index: i });
  }
}

// Listen for keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
  if (command === 'sort-by-title') {
    sortByTitle();
  } else if (command === 'sort-by-url') {
    sortByUrl();
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'sortByTitle') {
    sortByTitle().then(() => {
      sendResponse({ success: true });
    }).catch((error) => {
      sendResponse({ success: false, error: error.message });
    });
    return true; // Keep message channel open for async response
  } else if (message.action === 'sortByUrl') {
    sortByUrl().then(() => {
      sendResponse({ success: true });
    }).catch((error) => {
      sendResponse({ success: false, error: error.message });
    });
    return true; // Keep message channel open for async response
  }
});
