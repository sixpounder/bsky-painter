const form = document.getElementById("theme-form") as HTMLFormElement;
const themeRadios = document.querySelectorAll('input[name="theme"]');

/**
 * Sets the selected theme radio button based on the provided theme value.
 * @param theme - The theme value to select.
 */
function setSelected(theme: string) {
  const input = form.querySelector(
    `input[value="${theme}"]`,
  ) as HTMLInputElement | null;
  if (input) input.checked = true;
}

/**
 * Handles the theme change event by updating the local storage and sending a message to the active tab.
 */
async function handleThemeChange() {
  const formData = new FormData(form);
  const theme = (formData.get("theme") as string) || "gruvbox";
  await browser.storage.local.set({ theme });
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  const tab = tabs[0];
  if (tab && tab.id) {
    await browser.tabs.sendMessage(tab.id as number, {
      type: "set-theme",
      theme,
    });
  }
}

function showUI() {
  document.body.classList.remove("blocked");
}

function showBlocked() {
  document.body.classList.add("blocked");
}

// Connect to the background script
const port = browser.runtime.connect({ name: "popup" });

port.onMessage.addListener((msg: any) => {
  // `msg` contains {allowed: boolean, url: string}
  msg.allowed && msg.url ? showUI() : showBlocked();
});

browser.storage.local.get("theme").then((res) => {
  setSelected((res as any).theme || "default");
});

themeRadios.forEach((radio) => {
  radio.addEventListener("change", handleThemeChange);
});
