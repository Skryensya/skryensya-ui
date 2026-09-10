import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./src",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // Local runs only: the shared-page fixtures (fixtures.ts) already collapse most of the resource
  // cost, so this just keeps a hard ceiling on concurrent Chromium processes on a dev machine.
  // CI keeps Playwright's own default (unset here), untouched deliberately, for now.
  workers: process.env.CI ? undefined : 4,
  /*
   * FOUR TIMES THE DEFAULT, for the one thing here that is legitimately slow: the FIRST request to
   * the harness, which is where Vite transforms the whole module graph (every contract, both
   * bindings, every stylesheet the glob in `harness/main.tsx` pulls in). `global-setup.ts` pays that
   * once now, so nothing should ever spend it inside a test again; this is the headroom that keeps a
   * cold or contended machine from reporting the compiler as a component defect.
   *
   * Everything else is comfortably inside it: a full stage render is ~6.5s, an axe pass over one
   * case ~8s (axe walks the whole document either way, which is what that number is), the
   * whole-stage screenshot ~7.5s.
   *
   * The screenshot gate asks for more still and says so at its own call site.
   */
  timeout: 120_000,
  /* Renders the stage once so the dev server's transforms are cached before any test is timed;
   * `global-setup.ts` has the measurements. */
  globalSetup: "./global-setup.ts",
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:4180",
    /*
     * TRACING IS OFF LOCALLY, and it is the single biggest thing that was wrong with this suite.
     *
     * `retain-on-failure` records a full trace for EVERY test and throws it away when the test
     * passes, and a trace is DOM snapshots plus screenshots around each action. This stage is one
     * 76,000px-tall document holding 175 cases in both bindings, so each of those snapshots is
     * enormous, and four workers were each buffering their own on an 8GB machine. It swapped: whole
     * `page.evaluate` calls stalled for minutes around an axe run that measured 8s inside the page,
     * tests failed on a stopwatch in random places, and the suite took hours.
     *
     * Measured on the same fourteen accessibility cases, same machine: 6.9 minutes and two failures
     * with tracing on, 42.3 seconds and none with it off. The whole suite went from over two hours
     * to minutes.
     *
     * CI keeps the trace, the same split as `workers` above: there the artifact is how a failure
     * gets read at all, and the machine is not also running a dev server and an editor. Locally a
     * failure is ten seconds away from a trace anyway (`playwright test -g "<title>" --trace=on`),
     * which is a better trade than paying for 740 traces to keep one.
     */
    trace: process.env.CI ? "retain-on-failure" : "off",
  },
  webServer: {
    command: "vite",
    url: "http://localhost:4180",
    reuseExistingServer: !process.env.CI,
    stdout: "pipe",
    stderr: "pipe",
  },
});
