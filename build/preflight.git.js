import { exec } from "node:child_process"
import util from "node:util";

const execPromise = util.promisify(exec);

// -------------------------------------------------
// Verify Git status
// -------------------------------------------------
async function ensureCleanGit() {
  try {
    // `git status --porcelain` prints nothing when the tree is clean
    const { stdout } = await execPromise('git status --porcelain', { encoding: 'utf8' });
    const output = stdout.trim();

    if (output) {
      console.error('\n❌  Git working directory is not clean. Please commit or stash the following changes before running this script:\n');
      console.error(output);
      process.exit(1);
    }
  } catch (err) {
    console.log(err);
    // If the command fails (e.g., not a Git repo), abort with a clear message
    console.error('\n❌  Unable to check Git status. Make sure you are inside a Git repository.\n');
    process.exit(1);
  }
}

// Main flow
(async () => {
    await ensureCleanGit();
})();
