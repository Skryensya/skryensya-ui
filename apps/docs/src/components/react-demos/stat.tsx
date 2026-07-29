/*
 * Live React demos for /components/stat.
 */
import { Icon } from "@skryensya/react/icon";
import { Box, Grid } from "@skryensya/react/layout";
import { Stat } from "@skryensya/react/stat";
import { framedIn } from "./framed";

/** Every demo below runs inside its own preview frame — see `framed.tsx`. */
const framed = framedIn(import.meta.url);

export const StatCardsDemo = framed(function StatCardsDemo() {
  return (
    <Grid aria-label="Business Summary" columns={3} data-multicol="" gap="md">
      <Box as="article" border="subtle" padding="lg" surface="surface">
        <Stat label="Ingresos" value="48.200 €" trend="up" change={<><Icon name="arrow-up" /> 12,5%</>} />
      </Box>
      <Box as="article" border="subtle" padding="lg" surface="surface">
        <Stat label="Pedidos" value="1.204" trend="up" change={<><Icon name="arrow-up" /> 8,2%</>} />
      </Box>
      <Box as="article" border="subtle" padding="lg" surface="surface">
        <Stat label="Cancelaciones" value="0,9%" trend="up" change={<><Icon name="arrow-down" /> 0,3 puntos</>} />
      </Box>
    </Grid>
  );
});

const es = (n: number, opts?: Intl.NumberFormatOptions) => n.toLocaleString("en-US", opts);

export const StatAnimatedCardsDemo = framed(function StatAnimatedCardsDemo() {
  return (
    <Grid aria-label="Business Summary" columns={3} data-multicol="" gap="md">
      <Box as="article" border="subtle" padding="lg" surface="surface">
        <Stat
          animate
          format={(n) => `${es(n)} €`}
          label="Ingresos"
          value={48200}
          trend="up"
          change={<><Icon name="arrow-up" /> 12,5%</>}
        />
      </Box>
      <Box as="article" border="subtle" padding="lg" surface="surface">
        <Stat animate format={es} label="Pedidos" value={1204} trend="up" change={<><Icon name="arrow-up" /> 8,2%</>} />
      </Box>
      <Box as="article" border="subtle" padding="lg" surface="surface">
        <Stat
          animate
          format={(n) => `${es(n, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`}
          label="Cancelaciones"
          value={0.9}
          trend="up"
          change={<><Icon name="arrow-down" /> 0,3 puntos</>}
        />
      </Box>
    </Grid>
  );
});
