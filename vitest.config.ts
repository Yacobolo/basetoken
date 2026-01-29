import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    deps: {
      inline: ["@material/material-color-utilities"],
    },
  },
});
