import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  root: "popup",
  publicDir: path.resolve(...[process.cwd(), "public"]),
  build: {
    outDir: path.resolve(...[process.cwd(), "dist"]),
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
