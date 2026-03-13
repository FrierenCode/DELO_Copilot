import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function replaceInFile(relativePath, transform) {
  const filePath = path.join(root, ...relativePath);
  if (!fs.existsSync(filePath)) {
    return;
  }

  const original = fs.readFileSync(filePath, "utf8");
  const updated = transform(original);

  if (updated == null) {
    return;
  }

  fs.writeFileSync(filePath, updated);
}

replaceInFile(
  ["node_modules", "@opennextjs", "aws", "dist", "build", "helper.js"],
  (source) => {
    if (source.includes("copyDirRecursive(options.tempBuildDir, buildDir);")) {
      return null;
    }

    const target = `export function initOutputDir(options) {
    fs.rmSync(options.outputDir, { recursive: true, force: true });
    const { buildDir } = options;
    fs.mkdirSync(buildDir, { recursive: true });
    fs.cpSync(options.tempBuildDir, buildDir, { recursive: true });
}`;

    if (!source.includes(target)) {
      console.error("OpenNext helper patch target not found.");
      process.exit(1);
    }

    return source.replace(
      target,
      `function copyDirRecursive(sourceDir, targetDir) {
    fs.mkdirSync(targetDir, { recursive: true });
    for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
        const sourcePath = path.join(sourceDir, entry.name);
        const targetPath = path.join(targetDir, entry.name);
        if (entry.isDirectory()) {
            copyDirRecursive(sourcePath, targetPath);
        }
        else {
            fs.copyFileSync(sourcePath, targetPath);
        }
    }
}
export function initOutputDir(options) {
    fs.rmSync(options.outputDir, { recursive: true, force: true });
    const { buildDir } = options;
    fs.mkdirSync(buildDir, { recursive: true });
    copyDirRecursive(options.tempBuildDir, buildDir);
}`,
    );
  },
);

replaceInFile(
  ["node_modules", "@opennextjs", "aws", "dist", "build", "createAssets.js"],
  (source) => {
    let updated = source;

    if (!updated.includes("function copyDirRecursive(sourceDir, targetDir) {")) {
      const target = `import * as buildHelper from "./helper.js";
/**
 * Copy the static assets to the output folder`;

      if (!updated.includes(target)) {
        console.error("OpenNext createAssets patch target not found.");
        process.exit(1);
      }

      updated = updated.replace(
        target,
        `import * as buildHelper from "./helper.js";
function copyDirRecursive(sourceDir, targetDir) {
    fs.mkdirSync(targetDir, { recursive: true });
    for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
        const sourcePath = path.join(sourceDir, entry.name);
        const targetPath = path.join(targetDir, entry.name);
        if (entry.isDirectory()) {
            copyDirRecursive(sourcePath, targetPath);
        }
        else {
            fs.copyFileSync(sourcePath, targetPath);
        }
    }
}
/**
 * Copy the static assets to the output folder`,
      );
    }

    updated = updated
      .replace(
        'fs.cpSync(path.join(appBuildOutputPath, ".next/static"), path.join(outputPath, "_next", "static"), { recursive: true });',
        'copyDirRecursive(path.join(appBuildOutputPath, ".next/static"), path.join(outputPath, "_next", "static"));',
      )
      .replace(
        "fs.cpSync(appPublicPath, outputPath, { recursive: true });",
        "copyDirRecursive(appPublicPath, outputPath);",
      )
      .replace(
        "fs.cpSync(fetchCachePath, fetchOutputPath, { recursive: true });",
        "copyDirRecursive(fetchCachePath, fetchOutputPath);",
      );

    return updated === source ? null : updated;
  },
);

replaceInFile(
  [
    "node_modules",
    "@opennextjs",
    "cloudflare",
    "dist",
    "cli",
    "build",
    "utils",
    "copy-package-cli-files.js",
  ],
  (source) => {
    let updated = source;

    if (!updated.includes("function copyDirRecursive(sourceDir, targetDir) {")) {
      const target = `import { getOutputWorkerPath } from "../bundle-server.js";
/**
 * Copies`;

      if (!updated.includes(target)) {
        console.error("OpenNext copy-package-cli-files patch target not found.");
        process.exit(1);
      }

      updated = updated.replace(
        target,
        `import { getOutputWorkerPath } from "../bundle-server.js";
function copyDirRecursive(sourceDir, targetDir) {
    fs.mkdirSync(targetDir, { recursive: true });
    for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
        const sourcePath = path.join(sourceDir, entry.name);
        const targetPath = path.join(targetDir, entry.name);
        if (entry.isDirectory()) {
            copyDirRecursive(sourcePath, targetPath);
        }
        else {
            fs.copyFileSync(sourcePath, targetPath);
        }
    }
}
/**
 * Copies`,
      );
    }

    updated = updated.replace(
      "fs.cpSync(sourceDir, destinationDir, { recursive: true });",
      "copyDirRecursive(sourceDir, destinationDir);",
    );

    return updated === source ? null : updated;
  },
);

replaceInFile(
  ["node_modules", "@opennextjs", "aws", "dist", "build", "copyTracedFiles.js"],
  (source) => {
    let updated = source;

    if (!updated.includes("function copyDirRecursive(sourceDir, targetDir) {")) {
      const target = `const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
/**
 * Copies a file and ensures the destination is writable.`;

      if (!updated.includes(target)) {
        console.error("OpenNext copyTracedFiles patch target not found.");
        process.exit(1);
      }

      updated = updated.replace(
        target,
        `const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
function copyDirRecursive(sourceDir, targetDir) {
    mkdirSync(targetDir, { recursive: true });
    for (const entry of readdirSync(sourceDir, { withFileTypes: true })) {
        const sourcePath = path.join(sourceDir, entry.name);
        const targetPath = path.join(targetDir, entry.name);
        if (entry.isDirectory()) {
            copyDirRecursive(sourcePath, targetPath);
        }
        else {
            copyFileSync(sourcePath, targetPath);
        }
    }
}
/**
 * Copies a file and ensures the destination is writable.`,
      );
    }

    updated = updated.replace(
      'cpSync(path.join(standaloneNextDir, "static", "css"), path.join(outputNextDir, "static", "css"), { recursive: true });',
      'copyDirRecursive(path.join(standaloneNextDir, "static", "css"), path.join(outputNextDir, "static", "css"));',
    );

    return updated === source ? null : updated;
  },
);
