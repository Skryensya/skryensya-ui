/*
 * `?raw` is Vite's, not TypeScript's: this package's real components are injected into an isolated
 * shadow root as CSS TEXT (see `panel.ts`), and `?raw` is how Vite hands a module its source as a
 * plain string instead of processing it. The consuming app (`apps/docs`) is always Vite-bundled, so
 * the suffix resolves at build/dev time regardless of which package's source imports it. This
 * declaration only stops that import from being a type error along the way.
 */
declare module "*.css?raw" {
  const content: string;
  export default content;
}
