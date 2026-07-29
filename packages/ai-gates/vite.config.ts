import react from "@vitejs/plugin-react";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";

/*
 * The stage runs BOTH bindings in one page, so it needs both compilers: React for the React binding,
 * and Svelte because the Vanilla layer's enhancers are Svelte components underneath (decision 24).
 * That the vanilla path costs a compiler here is not a leak — the enhancer still renders no markup;
 * it mounts over the markup the emitter produced.
 */
export default defineConfig({
  root: "harness",
  plugins: [react(), svelte()],
  server: { port: 4180, strictPort: true },
});
