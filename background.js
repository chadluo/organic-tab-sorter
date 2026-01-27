// Background service worker for Organic Tab Sorter

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
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
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

// Sort tabs by title
async function sortByTitle() {
  return sortTabs((a, b) => a.title.localeCompare(b.title));
}

// Sort tabs by website (domain-aware)
async function sortByWebsite() {
  // Cache URL sort keys to avoid redundant parsing during comparison
  const sortKeyCache = new Map();
  const getCachedSortKey = (url) => {
    if (!sortKeyCache.has(url)) {
      sortKeyCache.set(url, getUrlSortKey(url));
    }
    return sortKeyCache.get(url);
  };

  return sortTabs((a, b) => {
    const keyA = getCachedSortKey(a.url);
    const keyB = getCachedSortKey(b.url);
    return keyA.localeCompare(keyB);
  });
}

// Common sorting function that accepts a compare function
async function sortTabs(compareFn) {
  const tabs = await chrome.tabs.query({ currentWindow: true });

  // Separate tabs into categories: pinned, grouped, and ungrouped
  const pinnedTabs = tabs.filter((tab) => tab.pinned);
  const groupedTabs = tabs.filter(
    (tab) => !tab.pinned && tab.groupId !== chrome.tabGroups.TAB_GROUP_ID_NONE,
  );
  const ungroupedTabs = tabs.filter(
    (tab) => !tab.pinned && tab.groupId === chrome.tabGroups.TAB_GROUP_ID_NONE,
  );

  // Get unique group IDs in their original order and count tabs per group
  const groupIds = [...new Set(groupedTabs.map((tab) => tab.groupId))];
  const groupSizes = new Map();
  for (const tab of groupedTabs) {
    groupSizes.set(tab.groupId, (groupSizes.get(tab.groupId) || 0) + 1);
  }

  // Sort pinned and ungrouped tabs using the provided compare function
  pinnedTabs.sort(compareFn);
  ungroupedTabs.sort(compareFn);

  // Move pinned tabs to the front
  for (let i = 0; i < pinnedTabs.length; i++) {
    await chrome.tabs.move(pinnedTabs[i].id, { index: i });
  }

  // Move entire tab groups to after pinned tabs
  // Iterate forward and calculate correct index based on previous group sizes
  let groupTargetIndex = pinnedTabs.length;
  for (const groupId of groupIds) {
    await chrome.tabGroups.move(groupId, { index: groupTargetIndex });
    groupTargetIndex += groupSizes.get(groupId);
  }

  // Move ungrouped tabs to after the groups
  for (let i = 0; i < ungroupedTabs.length; i++) {
    await chrome.tabs.move(ungroupedTabs[i].id, { index: groupTargetIndex + i });
  }
}

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
