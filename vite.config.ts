import { glob } from "glob";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => {
  const isDev = mode === "development";

  // Find all top-level entry point files in src/frontend
  const entryPoints = glob.sync("src/frontend/*.ts", {
    ignore: ["**/*.d.ts"],
  });

  // Convert to input object with keys based on filename
  const input: Record<string, string> = {};
  entryPoints.forEach((file) => {
    const name = path.basename(file, path.extname(file));
    input[name] = path.resolve(__dirname, file);
  });

  return {
    // Enable public directory for static assets like favicon
    publicDir: "public",

    build: {
      // Dev outputs to src/backend/public, production to dist/public
      outDir: isDev ? "src/backend/public" : "dist/public",
      emptyOutDir: isDev, // Clear dev folder on rebuild, but not prod (backend also outputs there)
      rollupOptions: {
        input,
        output: {
          // Output each entry file separately in the js/ directory
          entryFileNames: "js/[name].js",
          // Output CSS to a fixed filename (no hash)
          assetFileNames: (assetInfo) => {
            if (assetInfo.name?.endsWith(".css")) {
              return "js/bundle.css";
            }
            return "assets/[name]-[hash][extname]";
          },
          // Disable code splitting for simplicity
          manualChunks: undefined,
        },
      },
      // Generate sourcemaps for easier debugging
      sourcemap: isDev,
      // Target modern browsers
      target: "es2020",
    },
  };
});
