// Popup script for Organic Tab Sorter

const statusEl = document.getElementById('status');
const sortByTitleBtn = document.getElementById('sortByTitle');
const sortByWebsiteBtn = document.getElementById('sortByWebsite');
const sortByLastAccessedBtn = document.getElementById('sortByLastAccessed');
const defaultTitleRadio = document.getElementById('defaultTitle');
const defaultWebsiteRadio = document.getElementById('defaultWebsite');
const defaultLastAccessedRadio = document.getElementById('defaultLastAccessed');

// Update status message
function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.style.background = isError ? '#ffe7e7' : '#e7f3ff';
  statusEl.style.color = isError ? '#cc0000' : '#0066cc';

  // Reset status after 2 seconds
  setTimeout(() => {
    statusEl.textContent = 'Ready';
    statusEl.style.background = '#e7f3ff';
    statusEl.style.color = '#0066cc';
  }, 2000);
}

// Sort by title
sortByTitleBtn.addEventListener('click', () => {
  setStatus('Sorting by title...');
  chrome.runtime.sendMessage({ action: 'sortByTitle' }, (response) => {
    if (response && response.success) {
      setStatus('Sorted by title!');
    } else {
      setStatus('Error sorting tabs', true);
    }
  });
});

// Sort by website
sortByWebsiteBtn.addEventListener('click', () => {
  setStatus('Sorting by website...');
  chrome.runtime.sendMessage({ action: 'sortByWebsite' }, (response) => {
    if (response && response.success) {
      setStatus('Sorted by website!');
    } else {
      setStatus('Error sorting tabs', true);
    }
  });
});

// Sort by last accessed
sortByLastAccessedBtn.addEventListener('click', () => {
  setStatus('Sorting by last accessed...');
  chrome.runtime.sendMessage({ action: 'sortByLastAccessed' }, (response) => {
    if (response && response.success) {
      setStatus('Sorted by last accessed!');
    } else {
      setStatus('Error sorting tabs', true);
    }
  });
});

// Save default sort preference
function saveDefaultSort(value) {
  chrome.storage.sync.set({ defaultSortMode: value }, () => {
    setStatus(`Default set to ${value}`);
  });
}

// Listen for radio button changes
defaultTitleRadio.addEventListener('change', () => {
  if (defaultTitleRadio.checked) {
    saveDefaultSort('title');
  }
});

defaultWebsiteRadio.addEventListener('change', () => {
  if (defaultWebsiteRadio.checked) {
    saveDefaultSort('website');
  }
});

defaultLastAccessedRadio.addEventListener('change', () => {
  if (defaultLastAccessedRadio.checked) {
    saveDefaultSort('lastAccessed');
  }
});

// Load saved preference on popup open
chrome.storage.sync.get('defaultSortMode', (data) => {
  let defaultMode = data.defaultSortMode || 'website';
  // Backward compatibility: migrate 'url' to 'website'
  if (defaultMode === 'url') {
    defaultMode = 'website';
    chrome.storage.sync.set({ defaultSortMode: 'website' });
  }
  if (defaultMode === 'title') {
    defaultTitleRadio.checked = true;
  } else if (defaultMode === 'lastAccessed') {
    defaultLastAccessedRadio.checked = true;
  } else {
    defaultWebsiteRadio.checked = true;
  }
});

// Load and display keyboard shortcuts
chrome.commands.getAll((commands) => {
  const shortcutEl = document.getElementById('shortcut-sort');

  commands.forEach((command) => {
    const shortcut = command.shortcut || 'Not set';
    if (command.name === 'sort-tabs') {
      shortcutEl.textContent = `${shortcut}: Sort tabs using default order`;
    }
  });

  // Fallback if command not found
  if (shortcutEl.textContent === 'Loading...') {
    shortcutEl.textContent = 'Alt+Shift+S: Sort tabs using default order';
  }
});
