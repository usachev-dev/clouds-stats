import { existsSync } from "node:fs";
import { join } from "node:path";

const cwdTemplatePath = join(process.cwd(), "templates", "index.html");
const fallbackTemplatePath = join(import.meta.dir, "..", "index.html");
const templatePath = existsSync(cwdTemplatePath) ? cwdTemplatePath : fallbackTemplatePath;
const htmlTemplate = await Bun.file(templatePath).text();
const cwdPublicDirPath = join(process.cwd(), "public");
const fallbackPublicDirPath = join(import.meta.dir, "..", "dist", "public");

export const publicDirFsPath = existsSync(cwdPublicDirPath)
  ? cwdPublicDirPath
  : fallbackPublicDirPath;

function renderHtml(message: string, filesHtml: string, stylesHref: string): string {
  return htmlTemplate
    .replace("{{message}}", message)
    .replace("{{files}}", filesHtml)
    .replace("{{stylesHref}}", stylesHref);
}

function getPublicFiles(): string[] {
  return Array.from(new Bun.Glob("*").scanSync(publicDirFsPath))
    .map((entry) => entry.split(/[\\/]/).pop() ?? entry)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
}

function renderFileLinks(files: string[]): string {
  if (files.length === 0) {
    return "<li>No files found in public/</li>";
  }

  return files
    .map((fileName) => {
      const href = `/public/${encodeURIComponent(fileName)}`;
      return `<li><a href="${href}">${fileName}</a></li>`;
    })
    .join("\n");
}

function resolveStylesHref(files: string[]): string {
  const hashedStylesFile = files.find((name) => /^index\.[a-f0-9]{10}\.css$/i.test(name));
  if (!hashedStylesFile) {
    return "/public/index.css";
  }

  return `/public/${encodeURIComponent(hashedStylesFile)}`;
}

export function renderHomePage(message: string): Response {
  const files = getPublicFiles();
  const stylesHref = resolveStylesHref(files);

  return new Response(renderHtml(message, renderFileLinks(files), stylesHref), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
