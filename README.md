# Bsky Painter

> **Apply custom themes (Gruvbox, Tokyo Night, Catppuccin, Everforest, etc.) to `bsky.app`**

![Build status](https://img.shields.io/badge/build-passing-brightgreen)

Bsky Painter is a Firefox browser extension that injects a wide range of modern, high‑contrast themes into the Bluesky web interface.  
It works by loading a user‑selected CSS file from the extension and applying it on page load.  
The extension is lightweight, open‑source, and fully extensible – you can add your own CSS or tweak existing ones.

---

## Features

- **Multiple ready‑to‑use themes** – Gruvbox, Tokyo Night, Catppuccin (Frappe, Latte, Macchiato, Mocha), Everforest, and more.  
- **Instant theme switching** – select a theme from the popup and it is applied immediately on the current tab.  
- **Custom themes** – copy a CSS file into the `src/themes` folder and it will appear automatically.  
- **Lightweight** – only a few kilobytes of CSS are injected, no heavy scripts or background network calls.  
- **No data collection** – the extension explicitly requests no data‑collection permissions.  

---

## Installation

### Firefox Add‑on

The extension is published on the Mozilla Add‑ons site and can be installed directly:

1. Open the [Bsky Painter page](https://addons.mozilla.org/en-US/firefox/addon/bsky-painter) on Firefox.  
2. Click **Add to Firefox** → **Add**.  
3. After installation, click the extension icon in the toolbar and choose a theme.

### Manual install (from source)

```bash
git clone https://github.com/sixpounder/bsky-painter.git
cd bsky-painter
npm ci
npm run build
```

Open Firefox, go to `about:debugging#/runtime/this-firefox`, click **Load Temporary Add‑on…**, and select `dist/manifest.json`.  
This will load the unpacked extension for development or testing.

---

## Development

Bsky Painter is written in TypeScript and bundled with **Rolldown**.

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start a development server with hot‑reloading. |
| `npm run build` | Build a production‑ready bundle in `dist/`. |
| `npm run browser:firefox` | Run the extension in a live Firefox session using WebExt. |
| `npm run lint` | Build + lint the source. |
| `npm run package` | Build a signed XPI package in `web-ext-artifacts/`. |
| `npm run publish` | Run pre‑flight checks, lint, sign, and upload to AMO. |

---

## Adding a Theme

1. Copy an existing CSS file or create a new one in `src/themes/`.  
2. Name it following the pattern `<theme-name>.css`.  
3. Update the theme list if you want it to appear in the popup (the popup automatically scans the folder).  
4. Rebuild (`npm run build`) and reload the extension.

---

## Contribution

1. Fork the repo.  
2. Create a feature branch.  
3. Submit a PR with clear commit messages.  
4. Ensure all tests pass (if any) and the build succeeds (`npm run build`).  

Feel free to add more themes, fix bugs, or improve the UI.

---

## License

This project is licensed under the [GPL‑3.0‑only](LICENSE).

---

## Contact

- Author: **Andrea Coronese**  
- Email: <sixpounder@protonmail.com>  
- GitHub: <https://github.com/sixpounder>

Enjoy painting your Bluesky experience!
