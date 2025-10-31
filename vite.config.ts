import { defineConfig } from "vite";
import path from "path";

export default defineConfig(({ command, mode }) => {
  const isDev = mode === "development";

  return {
    // Enable public directory for static assets like favicon
    publicDir: "public",

    build: {
      // Dev outputs to src/backend/public, production to dist/public
      outDir: isDev ? "src/backend/public" : "dist/public",
      emptyOutDir: isDev, // Clear dev folder on rebuild, but not prod (backend also outputs there)
      rollupOptions: {
        input: path.resolve(__dirname, "src/frontend/entrypoint.ts"),
        output: {
          // Output as a single bundle.js file (matching current setup)
          entryFileNames: "js/bundle.js",
          // Output CSS to a fixed filename (no hash)
          assetFileNames: (assetInfo) => {
            if (assetInfo.name?.endsWith('.css')) {
              return "js/bundle.css";
            }
            return "assets/[name]-[hash][extname]";
          },
          // Disable code splitting for simplicity
          manualChunks: undefined,
        },
      },
      // Generate sourcemaps for easier debugging
      sourcemap: true,
      // Target modern browsers
      target: "es2020",
    },
  };
});
