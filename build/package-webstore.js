/**
 * Chrome Web Store publish script
 *
 * 1. Zip the `dist/` folder.
 * 2. Upload & publish the zip using `chrome-webstore-upload`.
 *
 * Install the helper packages first:
 *   npm i -D chrome-webstore-upload archiver
 */
import inquirer from "inquirer";
import { upload, publish } from "chrome-webstore-upload";
import archiver from "archiver";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

/** Zip a folder into a .zip file */
function zipFolder(srcDir, destZip) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(destZip);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => resolve());
    archive.on("error", (err) => reject(err));

    archive.pipe(output);
    archive.directory(srcDir, false); // keep the folder structure
    archive.finalize();
  });
}

/** Read the Chrome extension id from the manifest or fall back to prompt */
async function getExtensionId() {
  // Try to read from the manifest
  try {
    const manifest = JSON.parse(fs.readFileSync("src/manifest.json", "utf8"));

    // Common custom locations for a Chrome id
    const candidates = [
      manifest.browser_specific_settings?.chrome?.id,
      manifest.chrome_id,
      manifest.extensionId,
    ];

    const found = candidates.find(Boolean);
    if (found) return found;
  } catch {
    // Ignore any read/parse errors – we’ll prompt instead
  }

  // No id in the manifest – prompt the user
  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "extensionId",
      message: "Chrome Web Store extension ID:",
      validate: (input) => (input ? true : "Extension ID cannot be empty"),
    },
  ]);
  return answers.extensionId;
}

/** Prompt for missing OAuth credentials */
async function promptForMissing() {
  const questions = [];

  if (!process.env.CHROME_CLIENT_ID) {
    questions.push({
      type: "input",
      name: "clientId",
      message: "Chrome Web Store client ID:",
      validate: (input) => (input ? true : "Client ID cannot be empty"),
    });
  }
  if (!process.env.CHROME_CLIENT_SECRET) {
    questions.push({
      type: "input",
      name: "clientSecret",
      message: "Chrome Web Store client secret:",
      validate: (input) => (input ? true : "Client secret cannot be empty"),
    });
  }
  if (!process.env.CHROME_REFRESH_TOKEN) {
    questions.push({
      type: "input",
      name: "refreshToken",
      message: "Chrome Web Store refresh token:",
      validate: (input) => (input ? true : "Refresh token cannot be empty"),
    });
  }

  if (questions.length === 0) return;

  const answers = await inquirer.prompt(questions);

  process.env.CHROME_CLIENT_ID =
    process.env.CHROME_CLIENT_ID || answers.clientId;
  process.env.CHROME_CLIENT_SECRET =
    process.env.CHROME_CLIENT_SECRET || answers.clientSecret;
  process.env.CHROME_REFRESH_TOKEN =
    process.env.CHROME_REFRESH_TOKEN || answers.refreshToken;
}

/** Main workflow */
async function run() {
  // 1️⃣  Make sure we have OAuth creds
  await promptForMissing();

  // 2️⃣  Grab the Chrome extension id from the manifest (or prompt)
  const extensionId = await getExtensionId();

  // 3️⃣  Prepare a temp zip file
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bsky-painter-"));
  const zipPath = path.join(tmpDir, "dist.zip");
  const distDir = "dist";

  console.info("\n📦️ Zipping extension");
  await zipFolder(distDir, zipPath);
  console.info("✅  Zipped →", zipPath);

  // 4️⃣  Upload to Chrome Web Store
  console.info("\n🚀 Uploading to Chrome Web Store");
  await upload({
    extensionId,
    clientId: process.env.CHROME_CLIENT_ID,
    clientSecret: process.env.CHROME_CLIENT_SECRET,
    refreshToken: process.env.CHROME_REFRESH_TOKEN,
    uploadPath: zipPath,
  });

  // 5️⃣  Publish the uploaded package
  console.info("📄 Publishing");
  await publish({
    extensionId,
    clientId: process.env.CHROME_CLIENT_ID,
    clientSecret: process.env.CHROME_CLIENT_SECRET,
    refreshToken: process.env.CHROME_REFRESH_TOKEN,
    uploadPath: zipPath,
  });

  console.info("\n✅ Extension published!");
}

run().catch((err) => {
  console.error("\n❌  Publishing failed:", err);
  process.exit(1);
});
