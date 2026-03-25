import { defineConfig } from "rolldown";
import { copy } from "@web/rollup-plugin-copy";

export default defineConfig({
  input: {
    background: 'src/background.ts',
    'content-script': 'src/content-script.ts',
    popup: 'src/popup.ts'
  },
  
  // output dir and format
  output: {
    dir: 'dist',
    format: 'esm',
    sourcemap: true,
    cleanDir: true,
  },
  plugins: [
    copy({
      patterns: ['**/*.html', '**/*.css', '**/*.json', '**/themes/*.css', '**/icons/*.png'],
      rootDir: './src'
    })
  ]

})