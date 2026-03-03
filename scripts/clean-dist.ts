const rootDir = Bun.fileURLToPath(new URL("../", import.meta.url));
const distDir = `${rootDir}/dist`;

const escapedDist = distDir.replaceAll("'", "''");

const removeResult = Bun.spawnSync({
  cmd: [
    "powershell",
    "-NoProfile",
    "-Command",
    `if (Test-Path '${escapedDist}') { Remove-Item -Recurse -Force '${escapedDist}' }`,
  ],
});

if (removeResult.exitCode !== 0) {
  throw new Error(new TextDecoder().decode(removeResult.stderr));
}

const createResult = Bun.spawnSync({
  cmd: [
    "powershell",
    "-NoProfile",
    "-Command",
    `New-Item -ItemType Directory -Force '${escapedDist}' | Out-Null`,
  ],
});

if (createResult.exitCode !== 0) {
  throw new Error(new TextDecoder().decode(createResult.stderr));
}

console.log("Emptied dist/");
