import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

const BUILD_ID = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

// Emits /version.json into the build output so the runtime can poll for new deploys.
const versionStampPlugin = (): Plugin => ({
  name: "version-stamp",
  apply: "build",
  generateBundle() {
    this.emitFile({
      type: "asset",
      fileName: "version.json",
      source: JSON.stringify({ buildId: BUILD_ID, builtAt: new Date().toISOString() }),
    });
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  define: {
    __BUILD_ID__: JSON.stringify(BUILD_ID),
  },
  server: {
    host: "0.0.0.0",
    port: 8080,
    strictPort: true,
    hmr: {
      protocol: "wss",
      clientPort: 443,
    },
    watch: {
      usePolling: true,
      interval: 300,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    mode !== "development" && versionStampPlugin(),
  ].filter(Boolean) as Plugin[],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime"],
  },
}));
