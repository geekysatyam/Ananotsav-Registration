// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    resolve: {
      tsconfigPaths: true,
    },
    ssr: {
      // Bundle these for SSR — avoids Vite 8 / Rolldown unresolved lucide icon stubs
      // and framer-motion ESM quirks on Vercel.
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
