#!/usr/bin/env node
/**
 * Creates and pushes a git tag for the current web package version.
 * Used by changesets action instead of npm publish.
 */

import { execSync } from "child_process";
import { readFileSync, existsSync } from "fs";

const pkg = JSON.parse(readFileSync("./packages/web/package.json"));
const tag = `v${pkg.version}`;

// Check if tag already exists
const existingTags = execSync("git tag -l", { encoding: "utf-8" }).trim();
if (existingTags.split("\n").includes(tag)) {
  console.log(`Tag ${tag} already exists, skipping`);
  process.exit(0);
}

// Read changelog for tag message
let message = `Release ${tag}`;
const changelogPath = "./packages/web/CHANGELOG.md";
if (existsSync(changelogPath)) {
  const changelog = readFileSync(changelogPath, "utf-8");
  // Extract the first release section from changelog
  const match = changelog.match(/##\s+\d+\.\d+\.\d+[\s\S]*?(?=##\s+\d+\.\d+\.\d+|$)/);
  if (match) {
    message = match[0].trim();
  }
}

console.log(`Creating annotated tag ${tag}`);
execSync(`git tag -a "${tag}" -m "${message.replace(/"/g, '\\"')}"`, { stdio: "inherit" });
execSync(`git push origin ${tag}`, { stdio: "inherit" });
console.log(`Tag ${tag} created and pushed`);
