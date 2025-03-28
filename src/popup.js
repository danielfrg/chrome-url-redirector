// Get DOM elements
const openOptionsButton = document.getElementById('open-options');
const patternCountElement = document.getElementById('pattern-count');

// Load data when popup opens
document.addEventListener('DOMContentLoaded', () => {
  loadPatternCount();
});

// Add event listeners
openOptionsButton.addEventListener('click', openOptionsPage);

// Function to load and display pattern count
function loadPatternCount() {
  chrome.storage.sync.get('redirectPatterns', (data) => {
    const patterns = data.redirectPatterns || [];
    patternCountElement.textContent = patterns.length;
  });
}

// Function to open the options page
function openOptionsPage() {
  chrome.runtime.openOptionsPage();
}
