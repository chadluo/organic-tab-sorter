// Popup script for Organic Tab Sorter

const statusEl = document.getElementById('status');
const sortByTitleBtn = document.getElementById('sortByTitle');
const sortByWebsiteBtn = document.getElementById('sortByWebsite');
const defaultTitleRadio = document.getElementById('defaultTitle');
const defaultWebsiteRadio = document.getElementById('defaultWebsite');

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
  } else {
    defaultWebsiteRadio.checked = true;
  }
});

// Load and display keyboard shortcuts
chrome.commands.getAll((commands) => {
  const shortcutTitleEl = document.getElementById('shortcut-title');
  const shortcutWebsiteEl = document.getElementById('shortcut-website');

  commands.forEach((command) => {
    const shortcut = command.shortcut || 'Not set';
    if (command.name === 'sort-by-title') {
      shortcutTitleEl.textContent = `${shortcut}: Sort by Title`;
    } else if (command.name === 'sort-by-website') {
      shortcutWebsiteEl.textContent = `${shortcut}: Sort by Website`;
    }
  });

  // Fallback if commands not found
  if (shortcutTitleEl.textContent === 'Loading...') {
    shortcutTitleEl.textContent = 'Alt+Shift+T: Sort by Title (default)';
  }
  if (shortcutWebsiteEl.textContent === 'Loading...') {
    shortcutWebsiteEl.textContent = 'Alt+Shift+W: Sort by Website (default)';
  }
});
