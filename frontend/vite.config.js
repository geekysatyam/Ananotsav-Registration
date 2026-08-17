// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

/**
 * Vite 8 / Rolldown resolves every re-export in lucide-react's barrel file.
 * Deprecated aliases point at icon files that are no longer published → 600+
 * UNRESOLVED_IMPORT errors. Stub those missing files so the build can proceed.
 */
function lucideMissingIconStub() {
  return {
    name: "lucide-missing-icon-stub",
    enforce: "pre",
    resolveId(source, importer) {
      if (!importer) return null;
      const from = importer.replace(/\\/g, "/");
      if (!from.includes("/lucide-react/")) return null;
      if (!source.startsWith(".")) return null;

      const abs = path.resolve(path.dirname(importer), source);
      const candidates = source.endsWith(".js") ? [abs] : [abs, `${abs}.js`];
      if (candidates.some((p) => fs.existsSync(p))) return null;

      return `\0lucide-stub:${source}`;
    },
    load(id) {
      if (!id.startsWith("\0lucide-stub:")) return null;
      return "export default function LucideMissingIcon() { return null; }\n";
    },
  };
}

export default defineConfig({
  vite: {
    plugins: [lucideMissingIconStub()],
    resolve: {
      tsconfigPaths: true,
    },
    ssr: {
      noExternal: ["framer-motion", "motion-dom", "lucide-react"],
    },
    optimizeDeps: {
      include: ["lucide-react"],
    },
  },
  tanstackStart: {
    server: {
      entry: "server",
    },
    router: {
      generatedRouteTree: "./src/routeTree.gen.js",
    },
  },
});
