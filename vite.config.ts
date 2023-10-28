import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import * as fs from "node:fs";

const arrayBufferLoader = () => ({
  name: "arraybuffer-loader",
  transform(_code: any, id: string) {
    const [path, query] = id.split("?");
    if (query != "buffer") {
      return null;
    }
    const hex = fs.readFileSync(path, "hex");
    return `
    const hex = "${hex}";
    const arrayBuffer = new Uint8Array(hex.match(/../g).map(h => parseInt(h, 16))).buffer;
    export default arrayBuffer;
    `;
  },
});

export default defineConfig({
  plugins: [
    arrayBufferLoader(),
    tsconfigPaths(),
    react(),
    vanillaExtractPlugin(),
  ],
  test: {
    globals: true,
    setupFiles: "./src/test/setup.ts",
    browser: {
      enabled: true,
      provider: "playwright",
      name: "chromium",
      headless: true,
    },
  },
});
