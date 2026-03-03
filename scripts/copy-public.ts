import { cp, copyFile, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";

const rootDir = join(import.meta.dir, "..");
const sourceDir = join(rootDir, "public");
const sourceTemplatePath = join(rootDir, "index.html");
const distDir = join(rootDir, "dist");
const distPublicDir = join(distDir, "public");
const distTemplatePath = join(distDir, "index.html");

await mkdir(distDir, { recursive: true });
await rm(distPublicDir, { recursive: true, force: true });
await cp(sourceDir, distPublicDir, { recursive: true });
await copyFile(sourceTemplatePath, distTemplatePath);

console.log("Copied public -> dist/public");
console.log("Copied index.html -> dist/index.html");
