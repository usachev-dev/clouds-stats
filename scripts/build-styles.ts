import { createHash } from "node:crypto";
import { watch } from "node:fs";
import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import * as sass from "sass";

const rootDir = join(import.meta.dir, "..");
const args = process.argv.slice(2);
const isDevMode = args.includes("dev");
const outputDirName = join("dist", "public");
const outputDirNameDev = "public";

const sourceFile = join(import.meta.dir, "..", "styles", "index.scss");
const outputDir = join(rootDir, isDevMode ? outputDirNameDev : outputDirName);

async function buildStyles(): Promise<void> {
  const result = sass.compile(sourceFile, {
    loadPaths: [join(import.meta.dir, "..", "node_modules")],
    style: "compressed",
  });

  const hash = createHash("sha256").update(result.css).digest("hex").slice(0, 10);
  const outputFileName =`index.${hash}.css`;
  const outputFileNameDev = 'index.css';
  const outputFile = join(outputDir, isDevMode ? outputFileNameDev : outputFileName);
  const outputFileDev = join(outputDirNameDev, outputFileNameDev);
  try {
    rm(outputFileDev, {force: true})
  } catch {}

  await mkdir(outputDir, { recursive: true });

  const publicFiles = await readdir(outputDir);
  await Promise.all(
    publicFiles
      .filter((name) => name === outputFileName || /^index\.[a-f0-9]{10}\.css$/i.test(name))
      .map((name) => rm(join(outputDir, name))),
  );

  await writeFile(outputFile, result.css, "utf8");
  console.log(`Built ${outputFileName} -> ${outputDir}`);
}

await buildStyles();

if (isDevMode) {
  console.log(`Watching ${sourceFile}`);
  let timer: ReturnType<typeof setTimeout> | null = null;

  watch(sourceFile, () => {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(async () => {
      try {
        await buildStyles();
      } catch (error) {
        console.error("CSS build failed:", error);
      }
    }, 500);
  });

  await new Promise(() => {});
}
