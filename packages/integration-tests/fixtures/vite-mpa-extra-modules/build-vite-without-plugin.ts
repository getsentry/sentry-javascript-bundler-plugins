import * as path from "path";
import * as vite from "vite";

const inputDir = path.join(__dirname, "input");

void vite.build({
  clearScreen: false,
  root: inputDir,
  build: {
    sourcemap: true,
    outDir: path.join(__dirname, "out", "without-plugin"),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: path.join(inputDir, "index.html"),
        page1: path.join(inputDir, "page1.html"),
        page2: path.join(inputDir, "page2.html"),
      },
    },
  },
  plugins: [],
});

