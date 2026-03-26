// Keep a reference to the popup port (if it’s open)
type TabStatus = { allowed: boolean; url: string | undefined };
let popupPort: browser.runtime.Port | undefined = undefined;
let lastStatus: TabStatus = { allowed: false, url: undefined }; // cached result

browser.runtime.onInstalled.addListener(() => {
  browser.storage.local.get("theme").then((res) => {
    const data = res as Record<string, any>;
    return browser.storage.local.set({ theme: data.theme ?? "default" });
  });
});

/**
 * Checks if a URL is allowed by the extension's host permissions.
 */
async function urlIsAllowed(url: string | undefined) {
  if (!url) return false;
  try {
    return await browser.permissions.contains({ origins: [url] });
  } catch {
    // Permission check failed; assume the URL is not allowed.
    return false;
  }
}

/**
 * Sends the cached status to the popup (if it's connected).
 */
function sendStatusIfConnected() {
  if (popupPort) {
    popupPort.postMessage(lastStatus);
  }
}

/**
 * Re-evaluates the active tab and updates the cache.
 */
async function updateCurrentTabStatus() {
  const [tab] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });
  const allowed = await urlIsAllowed(tab?.url);
  lastStatus = { allowed, url: tab?.url };
  sendStatusIfConnected(); // push immediately if popup is open
}

// Listen for the popup opening
browser.runtime.onConnect.addListener((port) => {
  if (port.name !== "popup") return;

  popupPort = port;
  // Send the most recent status right away
  port.postMessage(lastStatus);

  // Clean up when the popup closes
  port.onDisconnect.addListener(() => {
    popupPort = undefined;
  });
});

// React to tab activation (user switches tabs)
browser.tabs.onActivated.addListener(() => {
  updateCurrentTabStatus();
});

// React to URL changes in the active tab (navigation, SPA updates)
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only care about the currently active tab in the focused window
  browser.tabs
    .query({ active: true, currentWindow: true })
    .then((activeTabs) => {
      if (activeTabs[0] && activeTabs[0].id === tabId && changeInfo.url) {
        updateCurrentTabStatus();
      }
    });
});

// Initialise cache when the background script starts
updateCurrentTabStatus();
