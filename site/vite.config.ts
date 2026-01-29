import { defineConfig } from "vite";

export default defineConfig({
  base: "/basetoken/",
  build: {
    outDir: "dist",
    target: "esnext",
  },
});
