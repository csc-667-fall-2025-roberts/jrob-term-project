import path from "path";
import { defineConfig } from "vite";

export default defineConfig(({ command, mode }) => {
  const isDev = mode === "development";
  const outDir = isDev ? "src/backend/public" : "dist/backend/public";

  return {
    // Enable public directory for static assets like favicon
    publicDir: "public",

    build: {
      // Dev outputs to src/backend/public, production to dist/public
      outDir,
      emptyOutDir: isDev, // Clear dev folder on rebuild, but not prod (backend also outputs there)
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, "src/frontend/entrypoint.ts"),
          chat: path.resolve(__dirname, "src/frontend/chat.ts"),
          lobby: path.resolve(__dirname, "src/frontend/lobby.ts"),
        },
        output: {
          // Output as ES modules (requires type="module" in script tags)
          // This is the modern approach and allows for multiple entry points
          format: "es",
          // Output as a single bundle.js file (matching current setup)
          entryFileNames: "[name].js",
          dir: `${outDir}/js`,
          // Output CSS to a fixed filename (no hash)
          assetFileNames: (assetInfo) => {
            if (assetInfo.name?.endsWith(".css")) {
              return "bundle.css";
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
