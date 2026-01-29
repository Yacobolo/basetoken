import { defineConfig } from "vite";

export default defineConfig({
  base: "/openhue/",
  build: {
    outDir: "dist",
    target: "esnext",
  },
});
