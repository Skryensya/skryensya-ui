<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { getConnect, getRoot } from "../runtime/svelte-hydrate";

  /*
   * El wrapper genérico para los enhancers SIN máquina de Zag, los que la plataforma ya da nativa y
   * el enhancer sólo sincroniza (button, slider sobre <input range>, sidebar, toast, segmented, vaul).
   * No usa Zag porque no hay máquina que usar; pero se monta por el MISMO camino Svelte que los
   * machine-backed, así que no queda una segunda forma de montar (nada de createEnhancer / legacyMounts).
   * Corre el `connect(root)` imperativo en onMount y su cleanup en onDestroy.
   */
  const root = getRoot();
  const connect = getConnect();
  let cleanup: (() => void) | undefined;
  onMount(() => {
    cleanup = connect(root);
  });
  onDestroy(() => cleanup?.());
</script>
