// Background service worker for Organic Tab Sorter

// Listen for keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
  if (command === "sort-tabs") {
    // Use the stored default sort preference
    chrome.storage.sync.get("defaultSortMode", (data) => {
      const defaultMode = data.defaultSortMode || "website";
      if (defaultMode === "title") {
        sortByTitle();
      } else if (defaultMode === "lastAccessed") {
        sortByLastAccessed();
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
  } else if (message.action === "sortByLastAccessed") {
    sortByLastAccessed()
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
  return sortTabs((a, b) => naturalCompare(a.title, b.title));
}

// Sort tabs by last accessed time (most recent first)
async function sortByLastAccessed() {
  return sortTabs((a, b) => (a.lastAccessed || 0) - (b.lastAccessed || 0));
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
    return naturalCompare(keyA, keyB);
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

// Natural string comparison: compares strings normally but treats trailing
// numbers numerically so "ticket-8" < "ticket-10" instead of "ticket-10" < "ticket-8"
function naturalCompare(a, b) {
  const re = /^(.*?)(\d+)$/;
  const matchA = a.match(re);
  const matchB = b.match(re);
  if (matchA && matchB && matchA[1] === matchB[1]) {
    return parseInt(matchA[2], 10) - parseInt(matchB[2], 10);
  }
  return a.localeCompare(b);
}

// Generic second-level domains (typically paired with country codes)
const GENERIC_SLDS = new Set(["co", "com", "net", "org", "gov", "edu", "ac", "mil"]);

// Parse URL to create sort key for domain-aware sorting
// e.g., "https://mail.google.com/inbox" -> "/https/google.com/mail/inbox"
function getUrlSortKey(url) {
  try {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol.replace(":", "");
    const parts = urlObj.hostname.split(".").reverse(); // ["com", "google", "mail"]
    const path = urlObj.pathname;

    // Country TLD + generic SLD (e.g., .com.au) uses 3 parts, otherwise 2 (or 1 for localhost)
    const isCountryTld = parts.length >= 3 && parts[0].length === 2 && GENERIC_SLDS.has(parts[1]);
    const domainPartCount = isCountryTld ? 3 : Math.min(2, parts.length);

    const domain = parts.slice(0, domainPartCount).reverse().join(".");
    const subdomains = parts.slice(domainPartCount).join("/");

    return "/" + protocol + "/" + domain + (subdomains ? "/" + subdomains : "") + path;
  } catch (error) {
    return url;
  }
}
