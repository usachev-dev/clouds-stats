import { existsSync } from "node:fs";
import { join } from "node:path";
import mustache from "mustache-bun";

const cwdPublicDirPath = join(process.cwd(), "public");
const fallbackPublicDirPath = join(import.meta.dir, "..", "dist", "public");

function htmlTemplate(name: string): Promise<string> {
  let filename = `${name}.html`;
  const cwdTemplatePath = join(process.cwd(), "templates", filename);
  const fallbackTemplatePath = join(import.meta.dir, "..", filename);
  return Bun.file(cwdTemplatePath).text().catch(() => {
    return Bun.file(fallbackTemplatePath).text();
  }) 
}

export const publicDirFsPath = existsSync(cwdPublicDirPath)
  ? cwdPublicDirPath
  : fallbackPublicDirPath;

export function renderHtml(templateName: string, context: any): Promise<string> {
  return htmlTemplate(templateName).then(t => {
    return mustache.render(t, context)
  })
}

export function getPublicFiles(): string[] {
  return Array.from(new Bun.Glob("*").scanSync(publicDirFsPath))
    .map((entry) => entry.split(/[\\/]/).pop() ?? entry)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
}


export function renderHomepage(): Promise<string> {
  return renderHtml("index", {
    message: "Hello World",
    files: getPublicFiles().map(f => ({name: f, href: `/public/${encodeURIComponent(f)}`}))
  });
}