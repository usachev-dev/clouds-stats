import * as sass from "sass";

const args = process.argv.slice(2);
const isDevMode = args.includes("dev");
const rootUrl = new URL("../", import.meta.url);
const sourceFileUrl = new URL("styles/index.scss", rootUrl);
const outputDirUrl = new URL(isDevMode ? "public/" : "dist/public/", rootUrl);
const outputDirPath = Bun.fileURLToPath(outputDirUrl);
const outputDirName = isDevMode ? "public" : "dist/public";
const outputFileNameDev = "index.css";


async function removeFiles(dirPath: string): Promise<void> {
  const files = Array.from(new Bun.Glob("*").scanSync(dirPath));
  for (const name of files) {
    if (name === outputFileNameDev || /^index\.[a-f0-9]{10}\.css$/i.test(name)) {
      await Bun.$`rm -f ${`${dirPath}/${name}`}`.quiet();
    }
  }
}

async function buildStyles(): Promise<void> {
  const result = sass.compile(Bun.fileURLToPath(sourceFileUrl), {
    loadPaths: [Bun.fileURLToPath(new URL("node_modules/", rootUrl))],
    style: "compressed",
  });

  const hash = Bun.hash(result.css).toString(16).padStart(16, "0").slice(0, 10);
  const outputFileName = `index.${hash}.css`;
  const outputFile = new URL(isDevMode ? outputFileNameDev : outputFileName, outputDirUrl);
  
  await Bun.$`mkdir -p ${outputDirPath}`.quiet();
  await removeFiles("public");
  await removeFiles(outputDirPath);
  await Bun.write(outputFile, result.css);

  console.log(`Built ${isDevMode ? outputFileNameDev : outputFileName} -> ${outputDirName}`);
}

await buildStyles();

if (isDevMode) {
  console.log(`Watching ${Bun.fileURLToPath(sourceFileUrl)}`);
  let lastHash = Bun.hash(await Bun.file(sourceFileUrl).text());
  while (true) {
    await Bun.sleep(300);
    const nextHash = Bun.hash(await Bun.file(sourceFileUrl).text());
    if (nextHash !== lastHash) {
      lastHash = nextHash;
      try {
        await buildStyles();
      } catch (error) {
        console.error("CSS build failed:", error);
      }
    }
  }
}
