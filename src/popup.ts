// popup.ts (Firefox-friendly: use browser.*)
const form = document.getElementById("theme-form") as HTMLFormElement;
const applyBtn = document.getElementById("apply") as HTMLButtonElement;

function setSelected(theme: string) {
  const input = form.querySelector(`input[value="${theme}"]`) as HTMLInputElement | null;
  if (input) input.checked = true;
}

browser.storage.local.get("theme").then((res) => {
  setSelected((res as any).theme || "gruvbox");
});

applyBtn.addEventListener("click", async () => {
  const formData = new FormData(form);
  const theme = (formData.get("theme") as string) || "gruvbox";
  await browser.storage.local.set({ theme });
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  const tab = tabs[0];
  if (tab && tab.id) {
    await browser.tabs.sendMessage(tab.id as number, { type: "set-theme", theme });
  }
});
