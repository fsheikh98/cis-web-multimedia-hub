import { defineConfig } from "vite";

// Relative base so the build also works when opened from a plain
// file:// path or a GitHub Pages subfolder like /week-3/.
export default defineConfig({
  base: "./",
  server: {
    port: 5173,
    open: false
  },
  build: {
    outDir: "dist"
  }
});
