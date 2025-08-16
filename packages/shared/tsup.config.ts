import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["cjs"],
    dts: false,
    sourcemap: true,
    clean: true,
    target: "es2022",
    minify: false,
    outDir: "dist/cjs",
  },
  {
    entry: ["src/index.ts"],
    format: ["esm"],
    dts: false,
    sourcemap: true,
    clean: false,
    target: "es2022",
    minify: false,
    outDir: "dist/esm",
  },
  {
    entry: ["src/index.ts"],
    format: ["cjs"],
    dts: { only: true },
    sourcemap: false,
    clean: false,
    target: "es2022",
    minify: false,
    outDir: "dist",
  },
]);


