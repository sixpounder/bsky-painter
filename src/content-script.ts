// content-script.ts (Firefox-friendly: use browser.*)
const THEME_STYLE_ID = "bdx-theme-style";
const THEME_VARS_ID = "bdx-theme-vars";
const INJECTED_CLASS = "bdx-theme-injected";

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

function cleanupCommon() {
  document.getElementById(THEME_STYLE_ID)?.remove();
  document.documentElement.classList.remove(INJECTED_CLASS);
}

async function init(): Promise<void> {
  await injectCommon();
  const res = await browser.storage.local.get("theme");
  const data = res as Record<string, any>;
  const theme = data.theme || "gruvbox";
  await applyThemeVars(theme);
}

init();

browser.runtime.onMessage.addListener((msg: any) => {
  console.log(msg);
  if (msg && msg.type === "set-theme") {
    applyThemeVars(msg.theme);
    browser.storage.local.set({ theme: msg.theme });
  }
});
