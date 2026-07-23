import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // El plugin compila los `.svelte` (los enhancers machine-backed) en los tests, igual que lo hará
  // Vite en el sitio. Los enhancers no-machine siguen siendo `.ts` puro.
  plugins: [svelte()],
  // En test, resolver Svelte a su build de navegador: sin la condición `browser`, `mount()` cae al
  // build de servidor y lanza `lifecycle_function_unavailable`. Sólo en VITEST para no alterar el
  // resto de la resolución.
  resolve: process.env.VITEST ? { conditions: ["browser"] } : undefined,
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
  },
});
