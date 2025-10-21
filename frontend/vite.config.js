import { defineConfig, loadEnv } from "vite";
import { resolve } from "node:path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const outDir = resolve(__dirname, "../backend/app/static");

  return {
    build: {
      outDir,
      emptyOutDir: true,
    },
    esbuild: {
      jsx: "automatic",
    },
    server: {
      port: Number(env.VITE_FRONTEND_PORT || env.FRONTEND_PORT || 3000),
      host: "0.0.0.0",
      proxy: {
        "/api": {
          target: env.VITE_FRONTEND_API_BASE_URL || env.FRONTEND_API_BASE_URL,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
