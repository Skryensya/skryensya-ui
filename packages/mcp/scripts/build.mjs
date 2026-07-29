import { build } from "esbuild";

/*
 * The server is bundled, and it is the only package here that is.
 *
 * Every other package exports TypeScript source and leaves compiling to whoever consumes it — a
 * bundler, always. This one is an executable: `.mcp.json` starts it with plain `node`, which cannot
 * load a `.ts` file or resolve a workspace link. Compiling it with `tsc` alone was not enough,
 * because its own imports resolve to `@skryensya/ai-compiler/src/*.ts` and then to
 * `@skryensya/core/src/*.ts`. Bundling collapses that whole chain into one file that runs anywhere,
 * with the MCP SDK left external because it is a real npm dependency.
 */
await build({
  entryPoints: ["src/index.ts"],
  outfile: "dist/index.js",
  bundle: true,
  platform: "node",
  target: "node22",
  format: "esm",
  // The workspace is what has to be inlined, so only real npm dependencies are listed here.
  // `packages: "external"` would externalize the workspace links too, since pnpm puts them in
  // node_modules — which is exactly the resolution that fails under plain node.
  external: ["@modelcontextprotocol/sdk", "@modelcontextprotocol/sdk/*", "zod"],
  // No banner: src/index.ts already carries the shebang, and a second one lands on line 2 where it
  // is a syntax error rather than a directive.
  logLevel: "info",
});
