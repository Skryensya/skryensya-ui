/*
 * WHERE THE DOCUMENTATION LIVES, from here.
 *
 * Since the split these are two apps and, in development, two origins: a bare `/components/button`
 * resolves against the playground, which has no such route. The default is empty, because the
 * deployment puts both behind one host and a bare path is then already correct; in development it
 * points at the port the docs actually serve. `PUBLIC_DOCS_URL` overrides both, and is the mirror of
 * `PUBLIC_PLAYGROUND_URL` on the docs side (`apps/docs/src/lib/navigation.ts`).
 */
export const docsOrigin =
  import.meta.env.PUBLIC_DOCS_URL ?? (import.meta.env.DEV ? "http://localhost:4173" : "");

/** A docs path, made reachable from this app. Absolute paths only; anything else is returned as-is. */
export const docsHref = (path: string): string =>
  path.startsWith("/") ? `${docsOrigin}${path}` : path;
