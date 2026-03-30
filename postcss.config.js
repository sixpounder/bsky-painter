import autoprefixer from "autoprefixer";
import postcssMixins from "postcss-mixins";
import postCssPresetEnv from "postcss-preset-env";
import postCssImport from "postcss-import";

/** @type {import('postcss-load-config').Config} */
export default {
  extract: true,
  minimize: true,
  sourceMap: true,
  plugins: [
    postCssImport(),
    postCssPresetEnv(),
    postcssMixins(),
    autoprefixer(),
  ],
};
