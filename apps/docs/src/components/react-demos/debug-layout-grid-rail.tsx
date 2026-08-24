/*
 * Debug-only: three rail placements on one LayoutGrid. After (`rail`), before
 * (`rail-start`), and both. Mirrors the vanilla markup on /debug/layout-grid-rail.
 */
import { Box, LayoutGrid } from "@skryensya/react/layout";

function RailBox({
  role,
  width,
  children,
}: {
  role: "main" | "toc" | "index";
  width?: "rail" | "rail-start";
  children: string;
}) {
  return (
    <Box padding="lg" surface="surface" border="subtle" data-role={role} data-width={width}>
      {children}
    </Box>
  );
}

export function LayoutGridRailEnd() {
  return (
    <LayoutGrid data-debug="layout-grid-rail">
      <RailBox role="main">MAIN CONTENT</RailBox>
      <RailBox role="toc" width="rail">
        TOC (rail)
      </RailBox>
    </LayoutGrid>
  );
}

export function LayoutGridRailStart() {
  return (
    <LayoutGrid data-debug="layout-grid-rail">
      <RailBox role="index" width="rail-start">
        INDEX (rail-start)
      </RailBox>
      <RailBox role="main">MAIN CONTENT</RailBox>
    </LayoutGrid>
  );
}

export function LayoutGridRailsBoth() {
  return (
    <LayoutGrid data-debug="layout-grid-rail">
      <RailBox role="index" width="rail-start">
        INDEX (rail-start)
      </RailBox>
      <RailBox role="main">MAIN CONTENT</RailBox>
      <RailBox role="toc" width="rail">
        TOC (rail)
      </RailBox>
    </LayoutGrid>
  );
}

