/*
 * Live React demos for /components/loader. Each export is a self-contained island (no function
 * props crossing the Astro boundary), mounted directly from the page with a bare
 * `<LoaderSimulationDemo client:load />`.
 */
import { useEffect, useState } from "react";
import { Button } from "@skryensya/react/button";
import { Heading } from "@skryensya/react/heading";
import { Loader } from "@skryensya/react/loader";
import { Box, Grid, Inline, Stack } from "@skryensya/react/layout";
import { Text } from "@skryensya/react/text";
import { framedIn } from "./framed";

/** Every demo below runs inside its own preview frame — see `framed.tsx`. */
const framed = framedIn(import.meta.url);

export const LoaderSimulationDemo = framed(function LoaderSimulationDemo() {
  const [analyzing, setAnalyzing] = useState(true);
  const [run, setRun] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setAnalyzing(false), 2200);
    return () => window.clearTimeout(timer);
  }, [run]);

  const analyze = () => {
    setAnalyzing(true);
    setRun((current) => current + 1);
  };

  return (
    <div className="loader-demo" aria-busy={analyzing}>
      <div aria-atomic="true" aria-live="polite" className="loader-demo__status" role="status">
        {analyzing ? (
          <div className="loader-demo__state">
            <Loader size="md" variant="bars" />
            <span className="loader-demo__copy">
              <strong>Analizando mezcla</strong>
              <span>Buscando resonancias y picos transitorios…</span>
            </span>
          </div>
        ) : (
          <div className="loader-demo__state">
            <span className="loader-demo__ready-dot" aria-hidden="true" />
            <span className="loader-demo__copy">
              <strong>Updated analysis</strong>
              <span>The mixture is ready to review.</span>
            </span>
          </div>
        )}
      </div>

      {!analyzing && (
        <Button onClick={analyze} variant="ghost">
          Analyze again
        </Button>
      )}
    </div>
  );
});

export const LoaderContextsDemo = framed(function LoaderContextsDemo() {
  return (
    <Grid columns={3} data-multicol="">
      <Box as="article" aria-labelledby="save-title" border="subtle" padding="lg" surface="surface">
        <Stack>
          <Text as="span" data-role="eyebrow">
            Local action
          </Text>
          <Stack gap="xs">
            <Heading as="h3" id="save-title" size="h4">
              Save report
            </Heading>
            <Text tone="secondary">The button retains the action and the Loader remains decorative.</Text>
          </Stack>
          <Button aria-busy={true} disabled variant="primary">
            <Loader size="sm" /> Guardando…
          </Button>
        </Stack>
      </Box>

      <Box as="section" aria-busy={true} aria-labelledby="orders-title" border="subtle" padding="lg" surface="surface">
        <Stack>
          <Inline justify="between" wrap={false}>
            <Heading as="h3" id="orders-title" size="h4">
              Recent orders
            </Heading>
            <Loader label="Updating orders" variant="dots" />
          </Inline>
          <Text tone="secondary">Previous content remains visible while the region is updated.</Text>
          <Stack gap="xs">
            <Inline justify="between" wrap={false}>
              <Text as="span" tone="secondary">
                Procesados
              </Text>
              <Text as="span" weight="label">
                128
              </Text>
            </Inline>
            <Inline justify="between" wrap={false}>
              <Text as="span" tone="secondary">
                Pendientes
              </Text>
              <Text as="span" weight="label">
                24
              </Text>
            </Inline>
          </Stack>
        </Stack>
      </Box>

      <Box as="section" aria-busy={true} aria-labelledby="analytics-title" border="subtle" padding="lg" surface="surface">
        <Stack gap="sm">
          <Inline justify="center">
            <Loader label="Loading analytics panel" size="lg" variant="sweep" />
          </Inline>
          <Heading as="h3" id="analytics-title" size="h4">
            Preparing analytics
          </Heading>
          <Text tone="secondary">The initial load maintains a helpful title and explanation.</Text>
        </Stack>
      </Box>
    </Grid>
  );
});

export const LoaderSizesDemo = framed(function LoaderSizesDemo() {
  return (
    <div className="sk-inline">
      <Loader size="sm" />
      <Loader />
      <Loader size="lg" label="Loading results" />
    </div>
  );
});

export const LoaderSpeedDemo = framed(function LoaderSpeedDemo() {
  return (
    <div className="sk-inline">
      <Loader speed="fast" size="lg" variant="bars" />
      <Loader speed="normal" size="lg" variant="bars" />
      <Loader label="Syncing in the background" speed="slow" size="lg" variant="bars" />
    </div>
  );
});
