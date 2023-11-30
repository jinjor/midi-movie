import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import * as glob from "glob";
import * as fs from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

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
  build: {
    rollupOptions: {
      input: {
        index: "./index.html",
        ...Object.fromEntries(
          glob
            .sync("renderer/*.mts")
            .map((file) => [
              file.slice(0, file.length - path.extname(file).length),
              fileURLToPath(new URL(file, import.meta.url)),
            ]),
        ),
      },
      output: {
        entryFileNames: (info) => {
          if (info.facadeModuleId?.includes("/renderer/")) {
            return "[name].mjs";
          }
          return "assets/[name]-[hash].js";
        },
      },
    },
  },
  plugins: [arrayBufferLoader(), tsconfigPaths(), react()],
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
