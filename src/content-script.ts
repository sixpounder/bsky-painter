// content-script.ts (Firefox-friendly: use browser.*)
const THEME_STYLE_ID = "bdx-theme-style";
const THEME_VARS_ID = "bdx-theme-vars";
const INJECTED_CLASS = "bdx-theme-injected";

/**
 * Fetches the text content of a file from the extension's resources.
 * @param path - The path to the file relative to the extension's resources.
 * @returns The text content of the file, or an empty string if the fetch fails.
 */
async function fetchText(path: string): Promise<string> {
  try {
    const url = browser.runtime.getURL(path);
    const res = await fetch(url);
    if (!res.ok) return "";
    return await res.text();
  } catch {
    return "";
  }
}

/**
 * Injects the common theme CSS into the document.
 * Colors are later overridden by theme-specific CSS.
 */
async function injectCommon(): Promise<void> {
  if (document.getElementById(THEME_STYLE_ID)) return;
  const css = await fetchText("themes/common.css");
  if (!css) return;
  const el = document.createElement("style");
  el.id = THEME_STYLE_ID;
  el.textContent = css;
  (document.head || document.documentElement)!.appendChild(el);
  document.documentElement.classList.add(INJECTED_CLASS);
}

/**
 * Applies theme variables to the document's root element.
 * @param theme - The theme name to apply, or undefined to remove existing variables.
 */
async function applyThemeVars(theme: string | undefined): Promise<void> {
  const existing = document.getElementById(THEME_VARS_ID);
  if (existing) existing.remove();

  if (!theme || theme === "default") {
    cleanupCommon();
    return;
  } else {
    injectCommon();
  }

  const css = await fetchText(`themes/${theme}.css`);
  if (!css) return;
  const el = document.createElement("style");
  el.id = THEME_VARS_ID;
  el.textContent = css;
  (document.head || document.documentElement)!.appendChild(el);
}

/**
 * Cleans up the common theme CSS from the document.
 */
function cleanupCommon() {
  document.getElementById(THEME_STYLE_ID)?.remove();
  document.documentElement.classList.remove(INJECTED_CLASS);
}

/**
 * Initializes the theme by injecting common CSS and applying theme variables.
 */
async function init(): Promise<void> {
  await injectCommon();
  const res = await browser.storage.local.get("theme");
  const data = res as Record<string, string>;
  const theme = data.theme || "gruvbox";
  await applyThemeVars(theme);
}

// Initialize the theme on page load
init();

/**
 * Listens for messages from the popup and applies the theme accordingly.
 */
browser.runtime.onMessage.addListener((msg: Record<string, string>) => {
  if (msg && msg.type === "set-theme") {
    applyThemeVars(msg.theme);
    browser.storage.local.set({ theme: msg.theme });
  }
});
