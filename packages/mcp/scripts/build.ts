import { build } from "esbuild";

/*
 * The server is bundled, and it is the only package here that is.
 *
 * Every other package exports TypeScript source and leaves compiling to whoever consumes it. A
 * bundler, always. This one is an executable: `.mcp.json` starts it with plain `node`, which cannot
 * load a `.ts` file or resolve a workspace link. Compiling it with `tsc` alone was not enough,
 * because its own imports resolve to `@skryensya/ai-compiler/src/*.ts` and then to
 * `@skryensya/core/src/*.ts`. Bundling collapses that whole chain into one file that runs anywhere,
 * with the MCP SDK (v2: `@modelcontextprotocol/server` and `/node`) and zod left external because
 * they are real npm dependencies.
 *
 * TWO entry points, one bundle each, sharing `create-server.ts` at build time (esbuild inlines it
 * into both, there is no runtime link between `dist/index.js` and `dist/http.js`): `index.ts` is
 * the stdio process `.mcp.json` starts, `http.ts` is the same tools reachable over a network
 * (`node dist/http.js`, see that file's own header).
 */
const entryPoints = ["src/index.ts", "src/http.ts"];

for (const entryPoint of entryPoints) {
  await build({
    entryPoints: [entryPoint],
    outfile: `dist/${entryPoint.replace(/^src\//, "").replace(/\.ts$/, ".js")}`,
    bundle: true,
    platform: "node",
    target: "node24",
    format: "esm",
    // The workspace is what has to be inlined, so only real npm dependencies are listed here.
    // `packages: "external"` would externalize the workspace links too, since pnpm puts them in
    // node_modules, which is exactly the resolution that fails under plain node.
    external: ["@modelcontextprotocol/server", "@modelcontextprotocol/server/*", "@modelcontextprotocol/node", "zod"],
    // No banner: both entry points already carry their own shebang, and a second one lands on
    // line 2 where it is a syntax error rather than a directive.
    logLevel: "info",
  });
}
