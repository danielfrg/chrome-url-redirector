// DOM elements
const patternsList = document.getElementById('patterns-list');
const addPatternButton = document.getElementById('add-pattern');
const saveButton = document.getElementById('save');
const statusElement = document.getElementById('status');
const patternTemplate = document.getElementById('pattern-template');

// Load saved patterns when the options page is opened
document.addEventListener('DOMContentLoaded', () => {
  loadPatterns();
});

// Add event listeners
addPatternButton.addEventListener('click', addNewPattern);
saveButton.addEventListener('click', savePatterns);

// Function to load saved patterns from storage
function loadPatterns() {
  chrome.storage.sync.get('redirectPatterns', (data) => {
    const patterns = data.redirectPatterns || [];

    // Clear the patterns list
    patternsList.innerHTML = '';

    // Add each pattern to the UI
    patterns.forEach(pattern => {
      addPatternToUI(pattern.pattern, pattern.redirect);
    });
  });
}

// Function to add a new empty pattern input to the UI
function addNewPattern() {
  addPatternToUI('', '');
}

// Function to add a pattern to the UI with given values
function addPatternToUI(patternValue, redirectValue) {
  // Clone the template
  const patternItem = document.importNode(patternTemplate.content, true);

  // Set values if provided
  const patternInput = patternItem.querySelector('.pattern-input');
  const redirectInput = patternItem.querySelector('.redirect-input');

  patternInput.value = patternValue;
  redirectInput.value = redirectValue;

  // Add remove button functionality
  const removeButton = patternItem.querySelector('.remove-pattern');
  removeButton.addEventListener('click', function() {
    this.closest('.pattern-item').remove();
  });

  // Add the new pattern to the list
  patternsList.appendChild(patternItem);
}

// Function to save patterns to storage
function savePatterns() {
  const patternItems = document.querySelectorAll('.pattern-item');
  const patterns = [];

  // Collect all pattern data
  patternItems.forEach(item => {
    const patternInput = item.querySelector('.pattern-input').value.trim();
    const redirectInput = item.querySelector('.redirect-input').value.trim();

    // Only save if both fields have values
    if (patternInput && redirectInput) {
      patterns.push({
        pattern: patternInput,
        redirect: redirectInput
      });
    }
  });

  // Save to Chrome storage
  chrome.storage.sync.set({ redirectPatterns: patterns }, () => {
    // Check for error and update status
    if (chrome.runtime.lastError) {
      statusElement.textContent = 'Error saving options: ' + chrome.runtime.lastError.message;
    } else {
      // Update status to let user know options were saved
      statusElement.textContent = 'Options saved.';
    }

    setTimeout(() => {
      statusElement.textContent = '';
    }, 2000);
  });
}
