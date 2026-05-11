import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { componentTagger } from "lovable-tagger";

const BUILD_ID = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const readGit = (command: string, fallback = "unknown") => {
  try {
    return execSync(command, { stdio: ["ignore", "pipe", "ignore"] }).toString().trim() || fallback;
  } catch {
    return fallback;
  }
};
const BUILD_COMMIT = process.env.VERCEL_GIT_COMMIT_SHA || readGit("git rev-parse HEAD");
const BUILD_BRANCH = process.env.VERCEL_GIT_COMMIT_REF || readGit("git rev-parse --abbrev-ref HEAD");

// Emits /version.json into the build output so the runtime can poll for new deploys.
const versionStampPlugin = (): Plugin => ({
  name: "version-stamp",
  apply: "build",
  closeBundle() {
    const indexPath = path.resolve(__dirname, "dist/index.html");
    const html = readFileSync(indexPath, "utf8").replace(/__CACHE_BUST__/g, encodeURIComponent(BUILD_ID));
    writeFileSync(indexPath, html, "utf8");
  },
  generateBundle() {
    this.emitFile({
      type: "asset",
      fileName: "version.json",
      source: JSON.stringify({
        buildId: BUILD_ID,
        commit: BUILD_COMMIT,
        branch: BUILD_BRANCH,
        builtAt: new Date().toISOString(),
      }),
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
