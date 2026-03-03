const rootDir = Bun.fileURLToPath(new URL("../", import.meta.url));
const sourceDir = `${rootDir}/public`;
const sourceTemplatePath = `${rootDir}/templates/index.html`;
const fallbackTemplatePath = `${rootDir}/index.html`;
const distDir = `${rootDir}/dist`;
const distPublicDir = `${distDir}/public`;
const distTemplatePath = `${distDir}/index.html`;

await Bun.$`mkdir -p ${distDir}`.quiet();
await Bun.$`mkdir -p ${distPublicDir}`.quiet();

for (const fileName of new Bun.Glob("*").scanSync(distPublicDir)) {
  await Bun.$`rm -f ${`${distPublicDir}/${fileName}`}`.quiet();
}

for (const fileName of new Bun.Glob("*").scanSync(sourceDir)) {
  const content = await Bun.file(`${sourceDir}/${fileName}`).arrayBuffer();
  await Bun.write(`${distPublicDir}/${fileName}`, content);
}

const templatePath = (await Bun.file(sourceTemplatePath).exists())
  ? sourceTemplatePath
  : fallbackTemplatePath;
await Bun.write(distTemplatePath, await Bun.file(templatePath).text());

console.log("Copied public -> dist/public");
console.log("Copied index.html -> dist/index.html");
