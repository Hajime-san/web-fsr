import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  base: "./",
  root: "popup",
  publicDir: path.resolve(...[__dirname, "public"]),
  build: {
    outDir: path.resolve(...[__dirname, "dist"]),
    emptyOutDir: true,
    copyPublicDir: true,
    rollupOptions: {
      output: {
        entryFileNames: "assets/[name].js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name].[ext]",
      },
    },
  },
  server: {
    open: true,
    port: 3000,
  },
});
