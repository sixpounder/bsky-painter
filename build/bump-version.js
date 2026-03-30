/**
 * Bump the minor version in package.json and src/manifest.json,
 * then commit the changes.
 *
 * Example:
 *   package.json 1.4.0 → 1.5.0
 *   manifest.json 1.4   → 1.5
 *
 * The script is safe to run after each publish step.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

/** Read JSON from a file */
function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

/** Write JSON to a file (pretty‑printed) */
function writeJSON(filePath, data) {
  const json = JSON.stringify(data, null, 2) + "\n";
  fs.writeFileSync(filePath, json, "utf8");
}

/**
 * Increment the minor component of a semver string.
 * @param {string} current - current semver (e.g. "1.4.0" or "1.4")
 * @returns {string} bumped semver
 */
function bumpMinor(current) {
  const parts = current.split(".");
  while (parts.length < 3) parts.push("0"); // pad to X.Y.Z for package.json
  parts[1] = (parseInt(parts[1], 10) + 1).toString(); // bump minor
  return parts.join(".");
}

function main() {
  const __dirname = fileURLToPath(new URL(".", import.meta.url));
  const rootDir = path.resolve(__dirname, "..");
  const pkgPath = path.join(rootDir, "package.json");
  const manifestPath = path.join(rootDir, "src", "manifest.json");

  console.info("🛠️  Bumping minor versions…");

  // -------- package.json ----------
  const pkg = readJSON(pkgPath);
  const oldPkgVer = pkg.version;
  const newPkgVer = bumpMinor(oldPkgVer);
  pkg.version = newPkgVer;
  writeJSON(pkgPath, pkg);
  console.info(`  • package.json: ${oldPkgVer} → ${newPkgVer}`);

  // -------- manifest.json ----------
  const manifest = readJSON(manifestPath);
  const oldManVer = manifest.version;
  const newManVer = bumpMinor(oldManVer);
  // Web‑Extension manifests only allow major.minor
  manifest.version = newManVer.split(".").slice(0, 2).join(".");
  writeJSON(manifestPath, manifest);
  console.info(`  • manifest.json: ${oldManVer} → ${manifest.version}`);

  // -------- git commit ----------
  try {
    // Stage both files
    execSync(
      `git add ${path.relative(rootDir, pkgPath)} ${path.relative(rootDir, manifestPath)}`,
      { stdio: "inherit" },
    );

    // Commit only if there are changes
    // `git diff --quiet` exits 0 when there are no differences
    execSync(
      `git diff --quiet ${path.relative(rootDir, pkgPath)} ${path.relative(rootDir, manifestPath)}`,
    );
    console.info("🗃️  No changes to commit.");
  } catch {
    // If diff exited with non‑zero, there are changes; commit them
    console.info("📦  Committing bumped versions…");
    execSync(`git commit -m "chore: bump versions"`, { stdio: "inherit" });
    console.info("✅  Commit created.");
  }

  console.info("✅ Minor version bump completed.");
}

main();
