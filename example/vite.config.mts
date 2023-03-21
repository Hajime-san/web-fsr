import path from "path";
import { fileURLToPath } from "url";
import { copyFile, mkdir, readdir, stat } from "node:fs/promises";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(...[__dirname, "public"]);
await stat(publicDir)
  .catch((err) => mkdir(publicDir));
// copy assets
const files = (await readdir(path.resolve(...[__dirname, "../assets"])))
  .filter((v) => /^s.\d/.test(v) && !v.includes("comparison"));
await Promise.all(files.map(async (file) => {
  await copyFile(
    path.resolve(...[__dirname, "../assets", file]),
    path.resolve(...[__dirname, "public", file]),
  );
}));

export default defineConfig({
  // https://vitejs.dev/guide/static-deploy.html#github-pages
  base: process.env.CD ? "/web-fsr/" : "./",
  publicDir,
  server: {
    open: true,
    port: 3000,
  },
});
