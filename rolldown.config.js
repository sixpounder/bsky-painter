import { defineConfig } from "rolldown";
import { copy } from "@web/rollup-plugin-copy";
import postcssCli from "./build/postcss.cli.js";

export default defineConfig([
  {
    input: "node_modules/webextension-polyfill/dist/browser-polyfill.min.js",
    output: {
      dir: "dist",
      format: "iife",
      sourcemap: true,
    },
  },
  {
    input: {
      background: "src/background.ts",
      "content-script": "src/content-script.ts",
      popup: "src/popup.ts",
    },

    output: {
      dir: "dist",
      format: "esm",
      sourcemap: true,
    },

    platform: "browser",

    plugins: [
      copy({
        patterns: ["**/*.html", "*.css", "**/*.json", "**/icons/*.png"],
        rootDir: "./src",
      }),
      postcssCli(),
    ],
  },
]);
