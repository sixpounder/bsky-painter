browser.runtime.onInstalled.addListener(() => {
  browser.storage.local.get("theme").then((res) => {
    const data = res as Record<string, any>;
    if (!data.theme) {
      return browser.storage.local.set({ theme: "default" });
    }
    return Promise.resolve();
  });
});