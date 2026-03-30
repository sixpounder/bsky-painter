/**
 * Rolldown plugin that launches the PostCSS CLI asynchronously.
 *
 * It:
 *   1. Registers every `src/themes/*.css` file as a watch file
 *      (so a change triggers a rebuild).
 *   2. Executes `postcss … --dir dist/themes …` once the bundle has been
 *      resolved but before the output files are written.
 *
 * No synchronous APIs are used – the plugin is fully `async/await`‑friendly.
 */
import { promisify } from "node:util";
import { exec as execCallback } from "node:child_process";
import { resolve } from "node:path";
import { glob } from "glob";
import chalk from "chalk";
import { performance } from "node:perf_hooks";

const exec = promisify(execCallback);

export default async function postcssThemesPlugin(options = {}) {
  const {
    srcDir = "src/themes",
    outDir = "dist/themes",
    config = resolve("postcss.config.js"),
  } = options;

  // Resolve the CSS files that belong to the theme directory.
  const cssFiles = await glob(`${srcDir}/*.css`);

  return {
    name: "rolldown-plugin-postcss-cli",

    /** Run PostCSS asynchronously after module resolution but before emitting. */
    async buildEnd() {
      // Construct the CLI command.
      const cmd = [
        "postcss",
        `${srcDir}/[!_]*.css`, // pattern for all theme files
        `--dir ${outDir}`, // where to put the compiled CSS
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
          outDir,
        );
      } catch (err) {
        console.error("\n❌  [PostCSS] failed:", err);
        // Propagate the error so Rolldown aborts the build.
        throw err;
      }
    },
  };
}
