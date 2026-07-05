// Stages a clean, production-only copy of a Node.js source directory for Lambda packaging.
// Run by a Terraform null_resource before archive_file zips it - Lambda has no build step
// of its own, so unlike the GCP side (Buildpacks run `npm install` for us), we have to ship
// node_modules ourselves, and it must not include devDependencies (jest alone is 10s of MB).
// Operates on a copy under .build/ so it never touches the real node_modules a developer
// needs locally for `npm test`.
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const [, , sourceDir, buildDir] = process.argv;
if (!sourceDir || !buildDir) {
  console.error("Usage: node build-node-package.js <sourceDir> <buildDir>");
  process.exit(1);
}

const SKIP_DIRS = new Set(["node_modules", "scripts", ".build"]);

function copyRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (entry.isDirectory() && SKIP_DIRS.has(entry.name)) continue;
    if (entry.isFile() && entry.name.endsWith(".test.js")) continue;

    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

fs.rmSync(buildDir, { recursive: true, force: true });
copyRecursive(sourceDir, buildDir);

execSync("npm ci --omit=dev", { cwd: buildDir, stdio: "inherit" });

console.log(`Built production package at ${buildDir}`);
