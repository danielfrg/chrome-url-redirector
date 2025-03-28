// Default patterns to use if none are set
const defaultPatterns = [
  {
    pattern: "go/*",
    redirect: "https://go.example.com/$1"
  },
];

// Keep track of the current patterns
let redirectPatterns = [];

// Load patterns from storage when the extension starts
loadPatternsFromStorage();

// Listen for changes to the storage
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.redirectPatterns) {
    loadPatternsFromStorage();
  }
});

// Function to load patterns from storage
function loadPatternsFromStorage() {
  chrome.storage.sync.get('redirectPatterns', (data) => {
    if (data.redirectPatterns && data.redirectPatterns.length > 0) {
      redirectPatterns = data.redirectPatterns.map(convertPatternToRegex);
    } else {
      redirectPatterns = defaultPatterns.map(convertPatternToRegex);
    }
  });
}

// Function to convert a wildcard pattern to a regex pattern
function convertPatternToRegex(patternObj) {
  // If it's already a regex pattern (stored as string), convert it back to RegExp
  if (patternObj.isRegex) {
    return {
      pattern: new RegExp(patternObj.pattern),
      redirect: patternObj.redirect,
      isRegex: true
    };
  }

  // Handle wildcard patterns
  const pattern = patternObj.pattern;
  const redirect = patternObj.redirect;

  // Escape special regex characters except for the wildcard *
  const escapedPattern = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '(.+)');

  // Create a regex that matches with or without http/https prefix
  // Use ?: for non-capturing group so it doesn't affect the group numbers
  const regexPattern = new RegExp(`^(?:http:\\/\\/|https:\\/\\/)?${escapedPattern}$`);

  return {
    pattern: regexPattern,
    // Convert wildcard redirect to use $1, $2, etc. for captured groups
    redirect: redirect.replace(/\*/g, '$1'),
    originalPattern: pattern,
    originalRedirect: redirect,
    isWildcard: true
  };
}

// Listen for tab updates to detect when a URL matching our patterns is being accessed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'loading' && tab.url) {
    for (const patternObj of redirectPatterns) {
      const match = tab.url.match(patternObj.pattern);

      if (match) {
        // Handle redirect using patternObj.redirect
        let redirectUrl = patternObj.redirect;
        for (let i = 1; i < match.length; i++) {
          redirectUrl = redirectUrl.replace(`$${i}`, match[i]);
        }

        chrome.tabs.update(tabId, { url: redirectUrl });
        break;
      }
    }
  }
});
