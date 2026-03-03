import { publicDirFsPath, renderHomePage } from "./src/render";
import { join } from "node:path";

function resolvePublicFile(requestedPath: string): string | null {
  const decodedPath = decodeURIComponent(requestedPath);
  if (decodedPath.includes("..") || decodedPath.includes("/") || decodedPath.includes("\\")) {
    return null;
  }

  const candidatePath = join(publicDirFsPath, decodedPath);
  return candidatePath;
}

const server = Bun.serve({
  port: 3000,
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      return renderHomePage("Hello World");
    }

    if (url.pathname.startsWith("/public/")) {
      const requestedFile = url.pathname.slice("/public/".length);
      const resolvedPath = resolvePublicFile(requestedFile);
      if (!resolvedPath) {
        return new Response("Bad request", { status: 400 });
      }

      const file = Bun.file(resolvedPath);
      if (!(await file.exists())) {
        return new Response("Not found", { status: 404 });
      }

      return new Response(file);
    }

    return new Response("Not found", { status: 404 });
  },
});

console.log(`Server running at http://localhost:${server.port}`);
