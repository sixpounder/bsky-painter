// api-client.js
// Node.js script that obtains an API key & secret either from environment variables
// or interactively from the user, then runs a placeholder command.

import inquirer from "inquirer";
import webxt from "web-ext";

// Environment variable names
const KEY_ENV = "MOZ_DEV_API_KEY";
const SECRET_ENV = "MOZ_DEV_SECRET";
const API_ENDPOINT = "https://addons.mozilla.org/api/v5/";

// Retrieve from env if available
let apiKey = process.env[KEY_ENV];
let apiSecret = process.env[SECRET_ENV];

// Helper to ask for missing credentials
async function promptForCredentials() {
  const questions = [];

  if (!apiKey) {
    questions.push({
      type: "input",
      name: "apiKey",
      message: "Enter your API key:",
      validate: (input) => (input ? true : "API key cannot be empty"),
    });
  }

  if (!apiSecret) {
    questions.push({
      type: "password",
      name: "apiSecret",
      message: "Enter your API secret:",
      mask: "*",
      validate: (input) => (input ? true : "API secret cannot be empty"),
    });
  }

  const answers = await inquirer.prompt(questions);
  apiKey = apiKey || answers.apiKey;
  apiSecret = apiSecret || answers.apiSecret;
}

// Placeholder for the actual API call
async function runCommand(key, secret) {
  // Replace this with real logic (e.g., HTTP request, SDK call, etc.)
  console.info("\n📦️ Packaging extension");
  console.info(`Using API key: ${key}`);
  console.info(`Using API secret: ${"*".repeat(secret.length)}`);

  /** @type {BuildOptions} */
  const options = {
    apiKey,
    apiSecret,
    sourceDir: "dist",
    artifactsDir: "dist",
    target: "firefox",
    channel: "listed",
    amoBaseUrl: API_ENDPOINT,
    amoMetadata: "dist/metadata.json",
  };
  await webxt.cmd.build(options);
  console.info("✔️ Extension built and packaged");
  console.info("✒️ Signing");
  await webxt.cmd.sign(options);

  console.info("✔️ Extension signed");
}

// Main flow
(async () => {
  if (!apiKey || !apiSecret) {
    await promptForCredentials();
  }

  await runCommand(apiKey, apiSecret);
})();
