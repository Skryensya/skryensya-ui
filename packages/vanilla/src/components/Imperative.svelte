<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { getConnect, getRoot } from "../runtime/svelte-hydrate";

  /*
   * The generic wrapper for the enhancers WITHOUT a Zag machine, the ones the platform already provides
   * natively and the enhancer only syncs (button, slider over <input range>, sidebar, toast, segmented,
   * vaul). It does not use Zag because there is no machine to use; but it mounts through the SAME Svelte
   * path as the machine-backed ones, so there is no second way to mount (no createEnhancer /
   * legacyMounts). It runs the imperative `connect(root)` in onMount and its cleanup in onDestroy.
   */
  const root = getRoot();
  const connect = getConnect();
  let cleanup: (() => void) | undefined;
  onMount(() => {
    cleanup = connect(root);
  });
  onDestroy(() => cleanup?.());
</script>
