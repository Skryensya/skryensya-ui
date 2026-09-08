import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, "dist/**"],
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
    /*
     * 15s, against Vitest's 5s default, because that default is meant for a unit test that runs in
     * milliseconds and here almost none of them are: they mount a component in jsdom and drive a Zag
     * machine, whose listeners attach behind `raf` + `raf` + `setTimeout(0)` chains, so every `waitFor`
     * waits several real event-loop turns.
     *
     * MEASURED, not eyeballed. With the machine quiet, this package's slowest test takes 2575ms:
     * already 51% of the 5s budget, a 2x margin. With something else using the CPU (a Playwright run
     * alongside, a build) the same tests go from 13 to 249 above 500ms, with peaks of 35s. That is when
     * six different tests started failing on timeout on every run, never the same ones, in unrelated
     * components: accordion, calendar, select, sidebar, storage, and on the next one color-picker,
     * date-picker, tooltip. That is not a bug, it is contention, and a suite that goes red depending on
     * what is running alongside teaches people to ignore red.
     *
     * IT DOES NOT HIDE A HANG: a genuinely hung test never finishes, so 15s instead of 5s only changes
     * how long we wait before saying so, not whether we say it. What it does buy is that the result
     * stops depending on the machine's load.
     */
    testTimeout: 15_000,
  },
});
