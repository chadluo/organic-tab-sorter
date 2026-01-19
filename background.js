// Background service worker for Organic Tab Sorter

// Parse URL to create sort key for domain-aware sorting
function getUrlSortKey(url) {
  try {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol.replace(":", ""); // "https", "chrome", "file", etc.
    const hostname = urlObj.hostname;
    const parts = hostname.split(".").reverse(); // ["com", "google", "www"]
    const path = urlObj.pathname;

    // Generic second-level domains (typically paired with country codes)
    const genericSlds = new Set(["co", "com", "net", "org", "gov", "edu", "ac", "mil"]);

    // Extract the root domain
    let domain = "";

    if (parts.length === 0) {
      domain = hostname;
    } else if (parts.length === 1) {
      // Single part like "localhost"
      domain = parts[0];
    } else if (parts.length >= 3 &&
               parts[0].length === 2 && // Country code (2 letters)
               genericSlds.has(parts[1])) { // Generic second-level domain
      // Country TLD + generic SLD pattern (e.g., au.com.finder)
      // e.g., ["au", "com", "finder"] -> "finder.com.au"
      domain = parts[2] + "." + parts[1] + "." + parts[0];
    } else {
      // Standard case: take domain + TLD (works for both generic and semantic TLDs)
      // e.g., ["com", "google"] -> "google.com"
      // e.g., ["ai", "anthropic"] -> "anthropic.ai"
      domain = parts[1] + "." + parts[0];
    }

    // Prepend protocol and domain: "/https/google.com/path"
    return "/" + protocol + "/" + domain + path;
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
