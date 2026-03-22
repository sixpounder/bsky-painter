browser.runtime.onInstalled.addListener(() => {
  browser.storage.local.get("theme").then((res) => {
    const data = res as Record<string, any>;
    return browser.storage.local.set({ theme: data.theme ?? "default" });
  });
});