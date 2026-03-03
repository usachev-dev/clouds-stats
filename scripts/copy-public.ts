const rootDir = Bun.fileURLToPath(new URL("../", import.meta.url));
const sourceDir = `${rootDir}/public`;
const sourceTemplatePath = `${rootDir}/index.html`;
const distDir = `${rootDir}/dist`;
const distPublicDir = `${distDir}/public`;
const distTemplatePath = `${distDir}/index.html`;

await Bun.$`mkdir -p ${distDir}`.quiet();
await Bun.$`mkdir -p ${distPublicDir}`.quiet();

for (const fileName of new Bun.Glob("*").scanSync(distPublicDir)) {
  await Bun.$`rm -f ${`${distPublicDir}/${fileName}`}`.quiet();
}

for (const fileName of new Bun.Glob("*").scanSync(sourceDir)) {
  await Bun.write(`${distPublicDir}/${fileName}`, Bun.file(`${sourceDir}/${fileName}`));
}

await Bun.write(distTemplatePath, Bun.file(sourceTemplatePath));

console.log("Copied public -> dist/public");
console.log("Copied index.html -> dist/index.html");
