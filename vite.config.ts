import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },

    build: {
      // Raise the warning threshold — gzip is what matters for performance
      chunkSizeWarningLimit: 600,

      rollupOptions: {
        output: {
          // Split vendor chunks for better long-term caching
          manualChunks: {
            "vendor-react":  ["react", "react-dom"],
            "vendor-motion": ["motion"],
            "vendor-lucide": ["lucide-react"],
          },
        },
      },
    },

    server: {
      // HMR disabled in AI Studio via DISABLE_HMR env var
      hmr:   process.env.DISABLE_HMR !== "true",
      watch: process.env.DISABLE_HMR === "true" ? null : {},
    },
  };
});
