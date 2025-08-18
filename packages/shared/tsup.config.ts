import { defineConfig } from "tsup";

export default defineConfig([
   {
      entry: ["index.ts"],
      format: ["cjs"],
      dts: false,
      sourcemap: true,
      clean: true,
      target: "es2022",
      minify: false,
      outDir: "dist/cjs",
   },
   {
      entry: ["index.ts"],
      format: ["esm"],
      dts: false,
      sourcemap: true,
      clean: false,
      target: "es2022",
      minify: false,
      outDir: "dist/esm",
      outExtension: () => ({ js: ".js" }),
   },
   {
      entry: ["index.ts"],
      format: ["cjs"],
      dts: { only: true },
      sourcemap: false,
      clean: false,
      target: "es2022",
      minify: false,
      outDir: "dist",
   },
]);
