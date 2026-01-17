// Background service worker for Organic Tab Sorter

// Parse URL to create sort key for domain-aware sorting
function getUrlSortKey(url) {
  try {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol.replace(":", ""); // "https", "chrome", "file", etc.
    const hostname = urlObj.hostname;
    const parts = hostname.split(".").reverse(); // ["com", "google", "dev"]
    const path = urlObj.pathname;

    // Generic TLDs to ignore when sorting (common, non-semantic TLDs)
    const genericTlds = new Set(["com", "net", "org"]);

    // Remove the TLD (first element after reverse) if it's a generic one
    // This keeps semantic TLDs like 'ai', 'gallery', 'dev', etc.
    if (parts.length > 0 && genericTlds.has(parts[0])) {
      parts.shift(); // Remove the generic TLD
    }

    // Prepend protocol to sort key: "/chrome/extensions" for chrome://extensions/
    return "/" + protocol + "/" + parts.join("/") + path;
  } catch (error) {
    return url;
  }
}

// Sort tabs by title
async function sortByTitle() {
  const tabs = await chrome.tabs.query({ currentWindow: true });

  // Separate tabs into categories: pinned, grouped, and ungrouped
  const pinnedTabs = tabs.filter((tab) => tab.pinned);
  const groupedTabs = tabs.filter(
    (tab) => !tab.pinned && tab.groupId !== chrome.tabGroups.TAB_GROUP_ID_NONE,
  );
  const ungroupedTabs = tabs.filter(
    (tab) => !tab.pinned && tab.groupId === chrome.tabGroups.TAB_GROUP_ID_NONE,
  );

  // Sort pinned tabs by title
  pinnedTabs.sort((a, b) => a.title.localeCompare(b.title));

  // Sort ungrouped tabs by title
  ungroupedTabs.sort((a, b) => a.title.localeCompare(b.title));

  // Keep grouped tabs in their original order (preserve group internal order)
  // Grouped tabs are already in the correct relative order from the query

  // Move tabs to their new positions: pinned first, then grouped, then ungrouped
  const sortedTabs = [...pinnedTabs, ...groupedTabs, ...ungroupedTabs];
  for (let i = 0; i < sortedTabs.length; i++) {
    await chrome.tabs.move(sortedTabs[i].id, { index: i });
  }
}

// Sort tabs by website (domain-aware)
async function sortByWebsite() {
  const tabs = await chrome.tabs.query({ currentWindow: true });

  // Separate tabs into categories: pinned, grouped, and ungrouped
  const pinnedTabs = tabs.filter((tab) => tab.pinned);
  const groupedTabs = tabs.filter(
    (tab) => !tab.pinned && tab.groupId !== chrome.tabGroups.TAB_GROUP_ID_NONE,
  );
  const ungroupedTabs = tabs.filter(
    (tab) => !tab.pinned && tab.groupId === chrome.tabGroups.TAB_GROUP_ID_NONE,
  );

  // Cache URL sort keys to avoid redundant parsing during comparison
  const sortKeyCache = new Map();
  const getCachedSortKey = (url) => {
    if (!sortKeyCache.has(url)) {
      sortKeyCache.set(url, getUrlSortKey(url));
    }
    return sortKeyCache.get(url);
  };

  // Sort pinned tabs by website
  pinnedTabs.sort((a, b) => {
    const keyA = getCachedSortKey(a.url);
    const keyB = getCachedSortKey(b.url);
    return keyA.localeCompare(keyB);
  });

  // Sort ungrouped tabs by website
  ungroupedTabs.sort((a, b) => {
    const keyA = getCachedSortKey(a.url);
    const keyB = getCachedSortKey(b.url);
    return keyA.localeCompare(keyB);
  });

  // Keep grouped tabs in their original order (preserve group internal order)
  // Grouped tabs are already in the correct relative order from the query

  // Move tabs to their new positions: pinned first, then grouped, then ungrouped
  const sortedTabs = [...pinnedTabs, ...groupedTabs, ...ungroupedTabs];
  for (let i = 0; i < sortedTabs.length; i++) {
    await chrome.tabs.move(sortedTabs[i].id, { index: i });
  }
}

// Listen for keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
  if (command === "sort-tabs") {
    // Use the stored default sort preference
    chrome.storage.sync.get("defaultSortMode", (data) => {
      const defaultMode = data.defaultSortMode || "website";
      if (defaultMode === "title") {
        sortByTitle();
      } else {
        sortByWebsite();
      }
    });
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "sortByTitle") {
    sortByTitle()
      .then(() => {
        sendResponse({ success: true });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep message channel open for async response
  } else if (message.action === "sortByWebsite") {
    sortByWebsite()
      .then(() => {
        sendResponse({ success: true });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep message channel open for async response
  }
});
