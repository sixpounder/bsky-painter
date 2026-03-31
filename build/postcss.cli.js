/**
 * Rolldown plugin that launches the PostCSS CLI.
 *
 * This is needed for rolldown since rolldown currently does not
 * allow importing CSS and thus processing them as modules. So
 * this plugin:
 *   1. Registers every css in `options.srcDir` file as a watch file.
 *   2. Executes `postcss` once the bundle has been
 *      resolved but before the output files are written.
 */
import { promisify } from "node:util";
import { exec as execCallback } from "node:child_process";
import { resolve } from "node:path";
import { glob } from "glob";
import chalk from "chalk";
import { performance } from "node:perf_hooks";

const exec = promisify(execCallback);

/**
 * Rolldown plugin that launches the PostCSS CLI.
 *
 * @param {Object} [options] - Plugin options.
 * @param {string} [options.include="\*.css"] - Source directory containing theme CSS files.
 * @param {string} [options.out="dist"] - Output directory for processed CSS.
 * @param {string} [options.config] - Path to the PostCSS configuration file. Defaults to the project's `postcss.config.js`.
 * @returns {import('rolldown').Plugin} A Rolldown plugin that runs PostCSS on theme CSS files.
 */
export default async function postcssThemesPlugin(options = {}) {
  const {
    include = "**/*.css",
    out = "dist",
    config = resolve("postcss.config.js"),
  } = options;

  // Resolve the CSS files that belong to the theme directory.
  const cssFiles = await glob(`${include}`);

  return {
    name: "rolldown-plugin-postcss-cli",

    /** Run PostCSS asynchronously after module resolution but before emitting. */
    async buildEnd() {
      // Construct the CLI command.
      const cmd = [
        "postcss",
        `${include}`, // pattern for all theme files
        `--dir ${out}`, // where to put the compiled CSS
        `--config ${config}`, // use the same config the user already has
        "--map", // generate sourcemaps
        "--minify", // minify the output (honours `minimize` in config)
      ].join(" ");

      console.info(
        `\n${chalk.blue("◌")} [PostCSS] Running on ${cssFiles.length} file(s)`,
      );

      try {
        performance.mark("BEFORE_EXEC");
        // `exec` will throw if the command exits with a non‑zero code.
        await exec(cmd, { stdio: "inherit", cwd: process.cwd() });
        performance.mark("AFTER_EXEC");
        const measure = performance.measure(
          "EXEC_TIME",
          "BEFORE_EXEC",
          "AFTER_EXEC",
        );
        console.info(
          `${chalk.green("✔")} [PostCSS] finished in ${chalk.green(`${measure.duration.toFixed(2)} ms`)} – output in`,
          out,
        );
      } catch (err) {
        console.error("\n❌  [PostCSS] failed:", err);
        // Propagate the error so Rolldown aborts the build.
        throw err;
      }
    },
  };
}
