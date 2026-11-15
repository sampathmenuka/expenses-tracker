import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { defineConfig, type Plugin } from "vite";

const outDir = path.resolve(import.meta.dirname, "dist/public");

/** Preloads the heading font so the largest text on screen doesn't wait for CSS to discover it. */
function preloadHeadingFont(): Plugin {
  return {
    name: "preload-heading-font",
    apply: "build",
    transformIndexHtml: {
      order: "post",
      handler(_html, ctx) {
        const font = Object.keys(ctx.bundle ?? {}).find((name) =>
          /fraunces-latin-700-normal-.*\.woff2$/.test(name)
        );
        if (!font) return [];
        return [
          {
            tag: "link",
            attrs: { rel: "preload", href: `/${font}`, as: "font", type: "font/woff2", crossorigin: "" },
            injectTo: "head-prepend",
          },
        ];
      },
    },
  };
}

/**
 * `vite preview` answers every unknown path with index.html. Match the production server:
 * a missing *file* (llms.txt, /.well-known/...) is a 404; only page routes fall back to the app.
 */
function missingFilesAre404(): Plugin {
  return {
    name: "missing-files-are-404",
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = decodeURIComponent((req.url ?? "/").split("?")[0]);
        const lastSegment = pathname.split("/").pop() ?? "";
        const looksLikeFile = lastSegment.includes(".") || pathname.startsWith("/.well-known/");
        if (looksLikeFile && !pathname.startsWith("/api/")) {
          const file = path.resolve(outDir, `.${pathname}`);
          if (!file.startsWith(outDir) || !fs.existsSync(file)) {
            res.statusCode = 404;
            res.end("Not Found");
            return;
          }
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), preloadHeadingFont(), missingFilesAre404()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir,
    emptyOutDir: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "wouter"],
          "vendor-recharts": ["recharts"],
          "vendor-icons": ["lucide-react"],
        },
      },
    },
  },
  server: {
    port: 3000,
    strictPort: false,
    proxy: {
      "/api": process.env.VITE_API_PROXY ?? "http://localhost:8010",
    },
  },
});
