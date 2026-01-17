// Popup script for Organic Tab Sorter

const statusEl = document.getElementById('status');
const sortByTitleBtn = document.getElementById('sortByTitle');
const sortByUrlBtn = document.getElementById('sortByUrl');
const defaultTitleRadio = document.getElementById('defaultTitle');
const defaultUrlRadio = document.getElementById('defaultUrl');

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

// Sort by URL
sortByUrlBtn.addEventListener('click', () => {
  setStatus('Sorting by URL...');
  chrome.runtime.sendMessage({ action: 'sortByUrl' }, (response) => {
    if (response && response.success) {
      setStatus('Sorted by URL!');
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

defaultUrlRadio.addEventListener('change', () => {
  if (defaultUrlRadio.checked) {
    saveDefaultSort('url');
  }
});

// Load saved preference on popup open
chrome.storage.sync.get('defaultSortMode', (data) => {
  const defaultMode = data.defaultSortMode || 'url';
  if (defaultMode === 'title') {
    defaultTitleRadio.checked = true;
  } else {
    defaultUrlRadio.checked = true;
  }
});

// Load and display keyboard shortcuts
chrome.commands.getAll((commands) => {
  const shortcutTitleEl = document.getElementById('shortcut-title');
  const shortcutUrlEl = document.getElementById('shortcut-url');

  commands.forEach((command) => {
    const shortcut = command.shortcut || 'Not set';
    if (command.name === 'sort-by-title') {
      shortcutTitleEl.textContent = `${shortcut}: Sort by Title`;
    } else if (command.name === 'sort-by-url') {
      shortcutUrlEl.textContent = `${shortcut}: Sort by URL`;
    }
  });

  // Fallback if commands not found
  if (shortcutTitleEl.textContent === 'Loading...') {
    shortcutTitleEl.textContent = 'Alt+Shift+T: Sort by Title (default)';
  }
  if (shortcutUrlEl.textContent === 'Loading...') {
    shortcutUrlEl.textContent = 'Alt+Shift+U: Sort by URL (default)';
  }
});
