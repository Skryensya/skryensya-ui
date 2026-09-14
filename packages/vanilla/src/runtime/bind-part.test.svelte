<script lang="ts">
  /*
   * TEST FIXTURE for `bindParts`, and the smallest one that can exist.
   *
   * `bindParts` registers `$effect` and `onDestroy`, and both throw outside component initialisation,
   * so it cannot be driven from a plain `.test.ts`. This component is the component context - it takes
   * the bindings under test as a prop and does nothing else, so a failing assertion is about
   * `bindParts` and never about the fixture.
   *
   * It renders no markup: the nodes a test binds are ones the test made itself, which is also how the
   * real enhancers work (they patch authored markup, they never render it).
   */
  import { bindParts, type BindPartsOptions, type PartBinding } from "./bind-part.svelte.js";

  const { bindings, options }: {
    bindings: readonly PartBinding[];
    options?: BindPartsOptions;
  } = $props();

  /*
   * Capturing the initial value is the contract, not an oversight: `bindParts` reads the array once at
   * initialisation and holds each `props` function for the life of the mount, which is what keeps Zag's
   * `prop()` reads O(1) instead of growing a chain per patch. A test that swapped the bindings
   * mid-mount would be testing something the module deliberately does not offer.
   */
  // svelte-ignore state_referenced_locally
  bindParts(bindings, options);
</script>
