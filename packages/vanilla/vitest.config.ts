import { svelte } from "@sveltejs/vite-plugin-svelte";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  // El plugin compila los `.svelte` (los enhancers machine-backed) en los tests, igual que lo hará
  // Vite en el sitio. Los enhancers no-machine siguen siendo `.ts` puro.
  plugins: [svelte()],
  // En test, resolver Svelte a su build de navegador: sin la condición `browser`, `mount()` cae al
  // build de servidor y lanza `lifecycle_function_unavailable`. Sólo en VITEST para no alterar el
  // resto de la resolución.
  resolve: process.env.VITEST ? { conditions: ["browser"] } : undefined,
  test: {
    exclude: [...configDefaults.exclude, "dist/**"],
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
    /*
     * Lo mismo que en `packages/react/vitest.config.ts`, y por lo mismo: ahí está el razonamiento
     * completo con las mediciones. Los enhancers de este paquete manejan las MISMAS máquinas de Zag
     * (se comparten desde `core/machines`) detrás de las mismas cadenas `raf` + `raf` +
     * `setTimeout(0)`, así que corren exactamente el mismo riesgo.
     *
     * Se pone acá aunque este paquete todavía no falló: no es que sea inmune, es que la corrida en
     * la que React se cayó le tocó en un momento con menos carga. Esperar a que pase para arreglarlo
     * es esperar a que el rojo aparezca en un momento peor.
     */
    testTimeout: 15_000,
  },
});
