import { publicDirFsPath, renderHomepage } from "./src/render";
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
    let path = url.pathname.split("/").filter(p => !!p)
    if (path.length == 0) {
      return await respondHTML(renderHomepage());
    }
   

    return new Response("Not found", { status: 404 });
  },
});

function respondHTML(content: Promise<string>): Promise<Response> {
  return content.then(c => new Response(c, { status: 200, headers: {
      "Content-Type": "text/html; charset=utf-8",
    }, })).catch(e => new Response(e, { status: 500, headers: {
      "Content-Type": "text; charset=utf-8",
    }, }))
} 


console.log(`Server running at http://localhost:${server.port}`);
