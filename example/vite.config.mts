import { defineConfig } from "vite";

export default defineConfig({
  // https://vitejs.dev/guide/static-deploy.html#github-pages
  base: process.env.CI ? '/web-fsr/' : "./",
  server: {
    open: true,
    port: 3000,
  },
});
