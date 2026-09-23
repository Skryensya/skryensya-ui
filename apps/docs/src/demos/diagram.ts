import type { ItemInput, UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * FOUR DEMOS, and the point of having four is that they are NOT four modes.
 *
 * The component has two nouns and a shape option. Everything below is the same two nouns composed
 * differently, and the page says so out loud, because "which type of diagram is this" is the first
 * question a reader brings to a component like this and the honest answer is "none, it is nodes and
 * edges".
 *
 *   diagramFlowTree      a linear flow. One column, three nodes, two edges. The floor.
 *   diagramBranchTree    an if/else. Two columns, a decision spanning both, two labelled edges.
 *   diagramTreeTree      a decision tree. The same thing again, one level deeper, and nothing new.
 *   diagramStateTree     a state chart with a cycle. The same thing again with an edge pointing
 *                        BACKWARDS, which is the only thing that makes a cycle a cycle.
 */

/*
 * The demos' own type. A diagram is prose about a system, so the nodes read as sentences rather than
 * as identifiers, and the code family the anatomy diagrams ask for would be wrong here.
 *
 * The narrow column is the interesting one: a diagram is the widest thing on a docs page by nature,
 * and capping the node measure is what keeps a translated label from turning a three-column drawing
 * into a six-row one.
 */
export const diagramDemoCss = `.sk-diagram {
  --sk-diagram-node-max-inline-size: 11rem;
}`;

/*
 * THE CYCLE DEMOS RESERVE THEIR OWN MARGINS, and this is the one place a demo tunes the component
 * rather than only sizing it.
 *
 * A return edge runs in a lane OUTSIDE the widest node it passes, and its label sits on that lane.
 * Nothing in the component reserves room for either: the overlay is `overflow: visible` on purpose
 * (a cycle clipped at the frame's edge is the one relationship a reader is most likely to be looking
 * for), so the line is drawn whether or not there is room, and at a 390px preview `invalidate` hung
 * 36px off the left edge and was cut off by the stage. Padding the frame is what makes room, and
 * narrowing the node floor is what pays for it: the two margins come out of the grid's width.
 *
 * THE RANK GAP IS WIDENED FOR THE SAME REASON, on the other axis. The stylesheet's 40px is measured
 * for a BARE connector (`diagram.css` says why: at 24px two thirds of it is the arrowhead, at 40px
 * there is a line with a head on it), and these two drawings label almost every edge. A chip is
 * 28px tall, so a labelled corridor spends 28 of its 40 on the chip and the remaining 12 on an
 * 8px head and its standoff: `pedir` came out welded to the bottom of `Inactiva`, and the branch
 * labels had no room on the line at all, so `placeDiagramLabel` pushed `sí` and `no` off it
 * sideways and bent both connectors around them. It is set HERE and not in the component because
 * the component cannot know how many of an author's edges carry a label.
 *
 * AND THE NODE FLOOR IS RAISED WITH IT, which is the half that no amount of gap could buy. The
 * state chart fans TWO labelled edges out of one node, and their exit ports are spread along that
 * node's bottom face: however tall the corridor, two chips leaving a narrow box start life on top
 * of each other. Measured on the 340px drawing, no row gap between 3.5rem and 6.5rem was clean -
 * `resuelve` sat either on `Cargando` or on `rechaza` at every one of them, because the search was
 * on the wrong axis. Widening the box is the fix: `fit-content` means `--sk-diagram-node-max-inline-size`
 * never touched it, and the FLOOR is what makes a node wider than its words. At 13rem the two
 * ports are far enough apart that each chip gets its own column of air, and 5.5rem then gives each
 * one a corridor to sit in rather than fill.
 *
 * The floor was 5rem here, narrowed to pay for the padding above, and raising it costs nothing
 * back because the component writes it as `min(floor, 100%)` against the GRID AREA: on a phone
 * `Cargando` is already the full width of the grid and the leaves are already their columns, so
 * 13rem and 5rem render identically there. It only bites where there is room for it to.
 */
export const diagramCycleCss = `.sk-diagram {
  --sk-diagram-node-max-inline-size: 11rem;
  --sk-diagram-node-min-inline-size: 13rem;
  --sk-diagram-row-gap: 5.5rem;
  padding-inline: 3.5rem;
}`;

/*
 * THE LINEAR FLOW'S ONE LABELLED CORRIDOR, which is the cycle demos' problem on a single edge and
 * takes the same number to fix.
 *
 * Three corridors, one chip. `aprobado` came out welded to the bottom of `Revisión editorial` with a
 * stub of arrow below it, for the reason spelled out on `diagramCycleCss`: a 40px corridor holding
 * a 28px chip has 12px left for the head and its standoff. The gap is uniform across a grid, so
 * the two BARE corridors get the same 68px, which is more than a bare connector needs and is the
 * right trade anyway: rank gaps that differed down one drawing would read as meaning.
 *
 * It is its own stylesheet rather than a line in `diagramDemoCss` because that one is shared by
 * five drawings, and the two that already reflow on a narrow screen (see `diagramTreeCss`) are
 * spending height elsewhere.
 */
export const diagramFlowCss = `${diagramDemoCss}

.sk-diagram {
  --sk-diagram-row-gap: 4.25rem;
}`;

/*
 * A LINEAR FLOW, and it is deliberately the first thing on the page.
 *
 * Two terminals and one step: the whole vocabulary of a flowchart that never branches. There is no
 * `columns` here at all, because one column is what the stylesheet already says, and a demo that set
 * `columns: 1` would teach a reader to write a value that changes nothing.
 */
export const diagramFlowTree = (t: Translate): UsageTree => ({
  contract: "diagram",
  signature: "Diagram",
  options: { label: t("diagram.flowLabel") },
  slots: {
    nodes: [
      { options: { node: "draft", shape: "terminal" }, slots: { children: t("diagram.flowNode1") } },
      { options: { node: "review" }, slots: { children: t("diagram.flowNode2") } },
      { options: { node: "publish" }, slots: { children: t("diagram.flowNode3") } },
      { options: { node: "live", shape: "terminal" }, slots: { children: t("diagram.flowNode4") } },
    ],
    edges: [
      { options: { from: "draft", to: "review" }, slots: {} },
      { options: { from: "review", to: "publish" }, slots: { children: t("diagram.flowEdge") } },
      { options: { from: "publish", to: "live" }, slots: {} },
    ],
  },
});

/*
 * AN IF/ELSE, which is two columns and one node that spans them.
 *
 * `span: 2` on every node that is not a branch is what keeps the trunk centred: a node left at one
 * column would sit in the left half of the drawing and the whole flow would lean. That is normal
 * CSS Grid and not a diagram concept, which is the argument for the grid being the layout.
 *
 * The rejoin at the end is the interesting edge: `retry` goes from the failure branch back UP to the
 * question, which is a cycle in a drawing nobody would call a state chart. Cycles are not a mode
 * either.
 */
export const diagramBranchTree = (t: Translate): UsageTree => ({
  contract: "diagram",
  signature: "Diagram",
  options: { label: t("diagram.branchLabel"), columns: 2 },
  slots: {
    nodes: [
      {
        options: { node: "request", shape: "terminal", span: 2 },
        slots: { children: t("diagram.branchNode1") },
      },
      {
        options: { node: "session", shape: "decision", span: 2 },
        slots: { children: t("diagram.branchNode2") },
      },
      { options: { node: "app" }, slots: { children: t("diagram.branchNode3") } },
      { options: { node: "login" }, slots: { children: t("diagram.branchNode4") } },
    ],
    edges: [
      { options: { from: "request", to: "session" }, slots: {} },
      { options: { from: "session", to: "app" }, slots: { children: t("diagram.branchYes") } },
      { options: { from: "session", to: "login" }, slots: { children: t("diagram.branchNo") } },
      { options: { from: "login", to: "session" }, slots: { children: t("diagram.branchRetry") } },
    ],
  },
});

/*
 * THE DECISION TREE'S OWN STYLESHEET, and the only demo on this page that needs a rule beyond
 * sizing. Two ranks run out of room on a phone, and they run out of it for different reasons.
 *
 * THE LEAVES, first. Four across is fine on a laptop and is an overlap on a phone: measured at a
 * 377px drawing the tracks are 85px, `Redespachar` and `Ver transferencia` each want 97, so each
 * leaf ate the 12px gap beside it and the rank read as one continuous strip with the outer boxes
 * hanging off both edges. The component already refuses to let a node's PADDING cause that
 * (`--node-fit-inline` caps it against the track), but nothing shrinks a box below its longest
 * word, and `transferencia` is longer than a quarter of a phone.
 *
 * So the rank is split in two: the first leaf of each pair on one row, the second one row lower.
 * Two boxes side by side at different heights may be wider than their tracks without ever meeting,
 * which is the whole of it - the drawing buys back width with height, and on a phone height is the
 * cheap axis.
 *
 * WHICH COLUMN EACH LEAF KEEPS IS LOAD-BEARING, and the obvious arrangement is the wrong one.
 * Stacking a pair in the SAME columns (`carrier` over `warehouse`, both across 1-2) is what you
 * reach for first, and it draws `shipped -> warehouse` straight THROUGH `carrier`: the router
 * computes a route between two boxes and does not steer around a third, so a rank-to-rank
 * connector goes wherever the geometry points it. Giving the lower leaf a column of its own leaves
 * the cell above it empty, and the connector comes down that empty cell. One leaf per column, the
 * two rows interleaved, and every corridor is clear by construction rather than by luck.
 *
 * `justify-self` on the two OUTER leaves only, because a node wider than its track is centred on
 * it and overflows both sides, and in the first column that hangs off the front of the drawing.
 * Pinning the first leaf to the start and the last to the end sends the overflow inward, into the
 * row its neighbour has just vacated. The middle two keep centring, which is what keeps them under
 * their questions.
 *
 * THE ROW GAP GOES UP WITH THEM, for the reason `diagramCycleCss` spells out at length: the
 * stylesheet's 40px is measured for a bare connector and this drawing labels six of its seven
 * edges. Splitting the leaves does nothing for that on its own, and it showed: at a 247px drawing
 * `transferencia` still sat on `¿Cómo pagó?` and on `tarjeta`, and `tarjeta` hung off the frame.
 * Inside the query and on `.sk-diagram__nodes` rather than the host, because `@container` can
 * reach what is inside the container and never the container itself, and `row-gap` on the grid is
 * the same declaration the hook feeds.
 *
 * THE QUESTIONS, second, and at a second breakpoint. A decision's padding is `1.6em * aspect` per
 * side - the width the text gives up so it stays inside the RHOMBUS rather than inside its box -
 * and that is the right number until the box is half a phone wide: on a 217px drawing the pair is
 * 87px of padding on a 103px track, and the two diamonds cross tip to tip in the middle. Both
 * terms of that product come down here. The em is a type step, which the whole drawing takes
 * together (a diagram whose questions are smaller than its outcomes reads as a hierarchy that is
 * not there), and the aspect gives the padding back directly, because the padding IS the aspect:
 * at 13px and 1.35 the same pair clears by the full column gap and each question wraps a line
 * lower instead.
 *
 * It is NOT folded into the query above, because it buys the fit with height and with type size
 * and the leaves need neither: between 18rem and 26rem the questions still fit their tracks, and
 * paying for a fit that is already there is a cost with nothing bought.
 *
 * BELOW ROUGHLY 12rem it stops being solvable this way and the drawing is left as it falls. Two
 * questions side by side need `despachó?` plus its padding twice over, the words do not break, and
 * the alternative (a question per row) is the arrangement the leaves above had to refuse: `paid`
 * would reach the lower question straight through the upper one. That width is a 320px phone with
 * the preview's own gutters taken out of it, and a drawing this dense is honest about not fitting.
 *
 * `@container` and not `@media`, because `.sk-diagram` already declares `container-type:
 * inline-size` and the question is how wide THIS DRAWING is rather than the window: the same tree
 * in a half-width column needs the stagger at a viewport that would never have asked for it. A
 * container query reaches only what is INSIDE the container, which is exactly as far as these
 * rules go - `grid-column`, `grid-row` and the aspect hook all sit on the node, and an unlayered
 * rule here outranks `@layer components`. That is not true of `columns` and `span`, which the
 * contract writes as INLINE custom properties; see `diagramAwsCss` for the drawing that has to
 * set those in CSS for the same reason.
 */
export const diagramTreeCss = `${diagramDemoCss}

@container (width < 26rem) {
  .sk-diagram__nodes {
    row-gap: 3.5rem;
  }

  .sk-diagram__node[data-node="carrier"] {
    grid-row: 4;
    grid-column: 1;
    justify-self: start;
  }

  .sk-diagram__node[data-node="warehouse"] {
    grid-row: 5;
    grid-column: 2;
  }

  .sk-diagram__node[data-node="bank"] {
    grid-row: 4;
    grid-column: 3;
  }

  .sk-diagram__node[data-node="card"] {
    grid-row: 5;
    grid-column: 4;
    justify-self: end;
  }
}

/* Narrower still: the drawing steps down a type size and the two questions give their padding
   back, which is what keeps each of them inside its own pair of columns. */
@container (width < 18rem) {
  .sk-diagram__node {
    --sk-diagram-node-font-size: 0.8125rem;
  }

  .sk-diagram__node[data-shape="decision"] {
    --sk-diagram-decision-aspect: 1.35;
  }

  .sk-diagram__label {
    --sk-diagram-edge-font-size: 0.6875rem;
  }
}`;

/*
 * A DECISION TREE: the same two nouns, one level deeper, and not one option the if/else above did
 * not already use.
 *
 * Four columns, so each leaf gets a column of its own and each question spans the pair it governs.
 * That is the whole of "how do I draw a tree": a node spans the branches below it. There is no
 * `depth`, no `parent`, no recursion in the data, because a tree is not a different kind of diagram
 * and the moment the contract said it was, it would owe an answer for every drawing that is nearly
 * one.
 */
export const diagramTreeTree = (t: Translate): UsageTree => ({
  contract: "diagram",
  signature: "Diagram",
  options: { label: t("diagram.treeLabel"), columns: 4 },
  slots: {
    nodes: [
      {
        options: { node: "ticket", shape: "terminal", span: 4 },
        slots: { children: t("diagram.treeNode1") },
      },
      {
        options: { node: "paid", shape: "decision", span: 4 },
        slots: { children: t("diagram.treeNode2") },
      },
      {
        options: { node: "shipped", shape: "decision", span: 2 },
        slots: { children: t("diagram.treeNode3") },
      },
      {
        options: { node: "method", shape: "decision", span: 2 },
        slots: { children: t("diagram.treeNode4") },
      },
      { options: { node: "carrier" }, slots: { children: t("diagram.treeLeaf1") } },
      { options: { node: "warehouse" }, slots: { children: t("diagram.treeLeaf2") } },
      { options: { node: "bank" }, slots: { children: t("diagram.treeLeaf3") } },
      { options: { node: "card" }, slots: { children: t("diagram.treeLeaf4") } },
    ],
    edges: [
      { options: { from: "ticket", to: "paid" }, slots: {} },
      { options: { from: "paid", to: "shipped" }, slots: { children: t("diagram.treeYes") } },
      { options: { from: "paid", to: "method" }, slots: { children: t("diagram.treeNo") } },
      { options: { from: "shipped", to: "carrier" }, slots: { children: t("diagram.treeYes") } },
      { options: { from: "shipped", to: "warehouse" }, slots: { children: t("diagram.treeNo") } },
      { options: { from: "method", to: "bank" }, slots: { children: t("diagram.treeTransfer") } },
      { options: { from: "method", to: "card" }, slots: { children: t("diagram.treeCard") } },
    ],
  },
});

/*
 * A STATE CHART, which is the same drawing with an edge that points BACKWARDS.
 *
 * `idle -> loading -> ready` is an ordinary flow. What makes it a machine is `ready -> idle`
 * (invalidate) and `failed -> loading` (retry): a target above its source, which the geometry routes
 * out through the inline-end margin rather than back down the corridor the forward edges are using.
 * Nothing in the composition says "state machine"; two edges happen to point up.
 *
 * `arrow: "both"` on the pair between `loading` and `failed` is the one relationship here that runs
 * both ways at once, drawn once rather than as two lines that would overlap for their whole length.
 */
export const diagramStateTree = (t: Translate): UsageTree => ({
  contract: "diagram",
  signature: "Diagram",
  options: { label: t("diagram.stateLabel"), columns: 2 },
  slots: {
    nodes: [
      {
        options: { node: "idle", shape: "terminal", span: 2 },
        slots: { children: t("diagram.stateNode1") },
      },
      { options: { node: "loading", span: 2 }, slots: { children: t("diagram.stateNode2") } },
      { options: { node: "ready" }, slots: { children: t("diagram.stateNode3") } },
      { options: { node: "failed" }, slots: { children: t("diagram.stateNode4") } },
    ],
    edges: [
      { options: { from: "idle", to: "loading" }, slots: { children: t("diagram.stateFetch") } },
      { options: { from: "loading", to: "ready" }, slots: { children: t("diagram.stateResolve") } },
      { options: { from: "loading", to: "failed" }, slots: { children: t("diagram.stateReject") } },
      { options: { from: "failed", to: "loading" }, slots: { children: t("diagram.stateRetry") } },
      { options: { from: "ready", to: "idle" }, slots: { children: t("diagram.stateInvalidate") } },
    ],
  },
});

/*
 * A PROCESS THAT SPLITS AND REJOINS, which is what an activity diagram is once the notation is
 * taken away.
 *
 * Nothing new in the API again, and that is the demo. What it adds to the drawing is TRAFFIC: two
 * edges leave one node and two arrive at another, so both the fan-out and the fan-in have to spread
 * their origins along the side they share. That spreading is the same rule the decision's two faces
 * use; here it runs on an ordinary rectangle, which is where it is easier to see.
 */
export const diagramProcessTree = (t: Translate): UsageTree => ({
  contract: "diagram",
  signature: "Diagram",
  options: { label: t("diagram.processLabel"), columns: 2 },
  slots: {
    nodes: [
      {
        options: { node: "placed", shape: "terminal", span: 2 },
        slots: { children: t("diagram.processNode1") },
      },
      { options: { node: "charge" }, slots: { children: t("diagram.processNode2") } },
      { options: { node: "pick" }, slots: { children: t("diagram.processNode3") } },
      { options: { node: "pack", span: 2 }, slots: { children: t("diagram.processNode4") } },
      {
        options: { node: "shipped", shape: "terminal", span: 2 },
        slots: { children: t("diagram.processNode5") },
      },
    ],
    edges: [
      { options: { from: "placed", to: "charge" }, slots: {} },
      { options: { from: "placed", to: "pick" }, slots: {} },
      { options: { from: "charge", to: "pack" }, slots: {} },
      { options: { from: "pick", to: "pack" }, slots: {} },
      { options: { from: "pack", to: "shipped" }, slots: {} },
    ],
  },
});

/*
 * RELATIONSHIPS BETWEEN THINGS RATHER THAN STEPS THROUGH TIME, and the one demo whose edges point
 * at something smaller than a node.
 *
 * Three things it shows that nothing above does:
 *
 *   A NODE CAN BE A RECORD. The `rows` slot puts named lines under a rule, which is a class with
 *   its members or a table with its columns. It is a slot and not a shape because the rows are
 *   ADDRESSABLE, and a silhouette cannot carry that.
 *   AN EDGE CAN POINT AT A ROW. `fromRow` / `toRow` land the connector on the node's own side at
 *   that row's height, so the drawing says WHICH column joins to which instead of "these two are
 *   related somehow". That is the whole difference between a sketch and a schema.
 *   `arrow: "none"`. An association is not a sequence: nothing happens next, so nothing points.
 *
 * WHAT THIS IS NOT is the point of putting it here, and the page says so: it is records and
 * association lines, not UML. There is no hollow triangle for inheritance, no diamond for
 * composition, no stereotype and no visibility markers, and a sequence diagram is not expressible
 * at all, because its lifelines are not nodes and its messages are not edges between them.
 */
const field = (row: string, label: string) => ({ options: { row }, slots: { children: label } });

/*
 * THE ORDER MODEL BUYS ITSELF A GUTTER, and it is the only drawing on the page that needs one.
 *
 * Every other demo here puts ONE connector between two ranks and labels few of them. This one puts
 * three association lines into the single corridor between two columns of records, and labels all
 * three, and a cardinality chip ("many to 1") is 84px wide. At the shared 12px column gap that
 * corridor is 80px across on a 340px preview: every chip was wider than the space it had, so each
 * one sat with one end over `Customer` and the other over `Order`, and the vertical that runs the
 * height of the drawing passed behind two of them.
 *
 * `placeDiagramLabel` will not solve that, and it is worth saying why rather than tuning it again:
 * it chooses the least bad of the positions it is offered, and when every position overlaps a box
 * there is no good one to choose. Room is not a placement problem. The component asks the author
 * how wide the gap between columns is, and this drawing's answer is "wide enough for a sentence".
 *
 * The node measure is left where `diagramDemoCss` puts it: a record is sized by its longest column
 * name, which is `product_sku`, and nothing here is near the 11rem cap.
 */
export const diagramModelCss = `${diagramDemoCss}

.sk-diagram {
  --sk-diagram-column-gap: 3rem;
}`;

/*
 * THE TABLE NAMES ARE NOT TRANSLATED, and they are the one demo on this page that is not.
 *
 * Every other drawing here is prose about a system - "Editorial review", "Paid for?" - and prose is
 * translated. A data model is not prose: `Customer` is the name of a table, its columns are
 * `customer_id` and `product_sku`, and those are already literals in the tree below because a
 * schema is written in one language whatever the page around it is written in. Translating the box
 * and not the rows inside it produced `Cliente` over `customer_id`, which is a join nobody can read
 * and a foreign key that appears to point at a table with a different name.
 */

export const diagramModelTree = (t: Translate): UsageTree => ({
  contract: "diagram",
  signature: "Diagram",
  options: { label: t("diagram.modelDiagramLabel"), columns: 2 },
  slots: {
    nodes: [
      {
        options: { node: "customer" },
        slots: {
          children: "Customer",
          rows: [field("id", "id"), field("email", "email"), field("name", "name")],
        },
      },
      {
        options: { node: "order" },
        slots: {
          children: "Order",
          rows: [field("id", "id"), field("customer_id", "customer_id"), field("total", "total")],
        },
      },
      {
        options: { node: "line" },
        slots: {
          children: "Line item",
          rows: [
            field("order_id", "order_id"),
            field("product_sku", "product_sku"),
            field("qty", "qty"),
          ],
        },
      },
      {
        options: { node: "product" },
        slots: {
          children: "Product",
          rows: [field("sku", "sku"), field("name", "name")],
        },
      },
    ],
    /*
     * Every one of these is a foreign key, so every one names a row at BOTH ends: the line leaves
     * the column that holds the reference and arrives at the column it references. Read the drawing
     * and you can write the join.
     */
    edges: [
      {
        options: {
          from: "order",
          to: "customer",
          fromRow: "customer_id",
          toRow: "id",
          arrow: "none",
        },
        slots: { children: t("diagram.modelMany") },
      },
      {
        options: { from: "line", to: "order", fromRow: "order_id", toRow: "id", arrow: "none" },
        slots: { children: t("diagram.modelMany") },
      },
      {
        options: {
          from: "line",
          to: "product",
          fromRow: "product_sku",
          toRow: "sku",
          arrow: "none",
        },
        slots: { children: t("diagram.modelOne") },
      },
    ],
  },
});

/*
 * A RULE, EVALUATED: two conditions feeding one test, and two outcomes out of it.
 *
 * The mirror image of the branch demo, and worth having beside it. Every decision above FANS OUT;
 * this one fans IN, so two connectors arrive on the rhombus's two UPPER faces by exactly the rule
 * that sends two out of its lower ones. Nothing in the contract knows the difference between a
 * condition and a conclusion: what makes this read as logic is that two things arrive and one
 * answer leaves, which is a shape the author composed and not a mode anyone selected.
 */
export const diagramLogicTree = (t: Translate): UsageTree => ({
  contract: "diagram",
  signature: "Diagram",
  options: { label: t("diagram.logicLabel"), columns: 2 },
  slots: {
    nodes: [
      { options: { node: "token" }, slots: { children: t("diagram.logicNode1") } },
      { options: { node: "scope" }, slots: { children: t("diagram.logicNode2") } },
      {
        options: { node: "both", shape: "decision", span: 2 },
        slots: { children: t("diagram.logicNode3") },
      },
      {
        options: { node: "allow", shape: "terminal" },
        slots: { children: t("diagram.logicNode4") },
      },
      { options: { node: "deny", shape: "terminal" }, slots: { children: t("diagram.logicNode5") } },
    ],
    edges: [
      { options: { from: "token", to: "both" }, slots: {} },
      { options: { from: "scope", to: "both" }, slots: {} },
      { options: { from: "both", to: "allow" }, slots: { children: t("diagram.logicYes") } },
      { options: { from: "both", to: "deny" }, slots: { children: t("diagram.logicNo") } },
    ],
  },
});

/*
 * LOGIC GATES, and the two drawings below are the notation working rather than a chart of it.
 *
 * A legend was the obvious first idea and the contract refuses it outright: `edges` is required, so
 * seven disconnected symbols in a row is not a Diagram, it is a table of pictures. That refusal is
 * right. A gate means something only in a drawing where a signal arrives and a result leaves, and
 * the two compositions here are the smallest honest ones that show it.
 *
 * WHAT IS NEW TO THE PAGE IS NOT AN OPTION, again. Both are `nodes` and `edges` like everything
 * above; the only thing that changed is which silhouette a node names, and the two structural facts
 * that fall out of it - a gate's operands land on its back plane and its result leaves one pin -
 * are geometry, not API.
 */

/*
 * A HALF ADDER, which is the drawing every logic notation is introduced with, and it is here for
 * the one thing none of the drawings above do: FAN OUT.
 *
 * `A` and `B` each feed BOTH gates, so four connectors leave two boxes and arrive on four different
 * thirds of two back planes, and the two that cross do so because the circuit crosses. Everything
 * above this point on the page is a tree: one parent, many children, no signal read twice.
 *
 * `arrow: "none"` on every edge, and that is the notation rather than a preference. A schematic
 * draws wires, not arrows: direction is carried by the symbols, which have a back and a nose, so an
 * arrowhead would be restating what the shape already said - and it would restate it eight pixels
 * off the gate, because a head keeps its clearance (`DIAGRAM_ARROW_GAP`). Without one the wire
 * touches the symbol, which is what a wire does.
 */
export const diagramGateCss = `${diagramDemoCss}
.sk-diagram {
  /*
   * A ROW OF GATES NEEDS LESS AIR BETWEEN RANKS THAN A COLUMN OF STEPS DOES. The page's default gap
   * is sized for a vertical flow, where the whole connector - clearance, arrowhead and what is left
   * of the line - lives in it. These drawings run along the inline axis, where the rank gap is only
   * the wire's own length, and at 40px the wires were longer than the symbols they joined.
   */
  /*
   * THE DESIGNATORS NEED NO ALLOWANCE HERE, and this comment used to say the opposite.
   *
   * U1 under a gate is positioned rather than laid out - it has to be, or the node's box would grow
   * and take the output pin off the symbol's centre line - so it claims no space. The first version
   * left that to this number and the number was wrong: at 24px the designator exactly filled the
   * gap and landed on the symbol in the rank below. A demo is the wrong place to fix that, because
   * every other drawing with a designator would have to rediscover it, so the component adds a line
   * of caption to its own rank gap whenever a frame has one. This is back to being what it says it
   * is: the room the wires need.
   */
  --sk-diagram-row-gap: var(--space-stack-lg);
  --sk-diagram-node-max-inline-size: 11rem;

  /*
   * AND THE DRAWING HAS A MEASURE OF ITS OWN, which is the one thing a schematic needs that a
   * flowchart does not.
   *
   * Every other demo on this page is boxes of text, and a box of text uses the width it is given.
   * A gate is a fixed silhouette: widen the frame and the symbols stay the size they were while the
   * grid columns they sit in grow, so all the new space goes into the WIRES. Measured on the free
   * width stage at 804px, "Revocado" reached its inverter across 250px of empty paper, the AND sat
   * two thirds of the way across the sheet from its own operands, and the drawing read as four
   * things that happen to be connected rather than as one circuit.
   *
   * 38rem is what the WIRING needs rather than what the boxes need, which is the correction this
   * number took: at 28rem the boxes were comfortable and the corridor between the columns was about
   * thirty pixels, which is where a schematic is actually read.
   *
   * Caps and not widths, so nothing changes on a narrow stage: a phone still gets the whole column.
   *
   * The auto inline margin is here because a capped drawing that stayed at the leading edge would
   * read as a layout accident rather than as a figure.
   *
   * NO BACKTICKS ANYWHERE IN THIS COMMENT, and that is not a style rule: this block lives inside a
   * template literal, so one backtick ends the CSS and the module stops parsing.
   */
  max-inline-size: 38rem;
  margin-inline: auto;
}`;

/*
 * THE HALF ADDER PAYS FOR ITS OWN CORRIDOR, and it is the only drawing on the page that has to.
 *
 * Four wires leave two boxes and two of them CROSS, because a half adder crosses: that is the fact
 * the drawing exists to show. At the page's inline gap - sized for two sibling boxes with nothing
 * to fit between them - all four ran through about thirty pixels and came out as a knot.
 *
 * NOT IN `diagramGateCss`, which the rule drawing below extends, and the reason is the whole of why
 * this is a separate string: the gap comes out of the columns. Given to both, the rule's first
 * column lost the width its sentences need and "Token present" wrapped to two lines, so a number
 * that bought clarity in one drawing spent it in the other.
 */
export const diagramHalfAdderCss = `${diagramGateCss}

.sk-diagram {
  --sk-diagram-column-gap: 2.5rem;
}`;

export const diagramGateTree = (t: Translate): UsageTree => ({
  contract: "diagram",
  signature: "Diagram",
  options: { label: t("diagram.gateLabel"), columns: 3 },
  slots: {
    nodes: [
      { options: { node: "a", shape: "terminal" }, slots: { children: "A" } },
      /* The gate's words are its name, and the stylesheet clips them: the symbol is what a reader
         sees, and "XOR" is what a screen reader hears. Not a t() call for the same reason a table's
         name is not one - the notation is the same in every language on this site.

         `designator` is the other half of that: the box IS the symbol, so the one piece of text a
         schematic does put on a gate goes UNDER it, positioned rather than laid out so the ports
         stay on the silhouette. `U1`/`U2` are what a schematic calls its parts, and they are not
         translated either. */
      {
        options: { node: "xor", shape: "xor" },
        slots: { children: "XOR", designator: "U1" },
      },
      { options: { node: "sum", shape: "terminal" }, slots: { children: t("diagram.gateSum") } },
      { options: { node: "b", shape: "terminal" }, slots: { children: "B" } },
      {
        options: { node: "and", shape: "and" },
        slots: { children: "AND", designator: "U2" },
      },
      { options: { node: "carry", shape: "terminal" }, slots: { children: t("diagram.gateCarry") } },
    ],
    edges: [
      { options: { from: "a", to: "xor", arrow: "none" }, slots: {} },
      { options: { from: "b", to: "xor", arrow: "none" }, slots: {} },
      { options: { from: "a", to: "and", arrow: "none" }, slots: {} },
      { options: { from: "b", to: "and", arrow: "none" }, slots: {} },
      { options: { from: "xor", to: "sum", arrow: "none" }, slots: {} },
      { options: { from: "and", to: "carry", arrow: "none" }, slots: {} },
    ],
  },
});

/*
 * THE SAME RULE AS `diagramLogicTree`, IN THE NOTATION, and the pair is the argument.
 *
 * The drawing above it asks one rhombus "are both true?" and lets two answers out. This one says
 * the same thing with an AND, adds the clause the rhombus could not hold without a second question
 * (`NOT revoked`), and keeps the operands as ordinary `process` boxes and the outcome as a
 * `terminal`. That mixture is the point: gates are not a second component with a frame of their
 * own, so a rule can be half prose and half notation without anything being converted.
 *
 * THE INVERTER IS IN ITS OWN COLUMN, and that is load-bearing rather than tidy. A gate's operands
 * arrive on its back plane, so every gate-to-gate wire has to run FORWARD along the inline axis; an
 * inverter sitting in the AND's own column would have to double back, and a corridor that doubles
 * back turns halfway between its two ends, which for two boxes in one column is inside them both.
 * The drawing would run the wire under the symbol it was feeding. Stagger is what a schematic does
 * anyway - operators in the order they apply, left to right - so the rule costs nothing.
 *
 * THREE OPERANDS ON ONE GATE, which is the other thing worth showing: they land at a third, a half
 * and two thirds of the back plane rather than fanned to its corners, because the pins belong to the
 * symbol (`DIAGRAM_GATE_PORT_BAND`).
 */
export const diagramGateRuleCss = `${diagramGateCss}

/* Four columns, and three of them hold one thing each, so the grid is addressed rather than flowed:
   the operands stack in column 1, the inverter takes column 2 on its own row, and the AND and its
   outcome sit level with the middle operand. */
.sk-diagram__node[data-node="token"] { grid-area: 1 / 1; }
.sk-diagram__node[data-node="scope"] { grid-area: 2 / 1; }
.sk-diagram__node[data-node="revoked"] { grid-area: 3 / 1; }
.sk-diagram__node[data-node="fresh"] { grid-area: 3 / 2; }
.sk-diagram__node[data-node="both"] { grid-area: 2 / 3; }
.sk-diagram__node[data-node="allow"] { grid-area: 2 / 4; }`;

export const diagramGateRuleTree = (t: Translate): UsageTree => ({
  contract: "diagram",
  signature: "Diagram",
  options: { label: t("diagram.gateRuleLabel"), columns: 4 },
  slots: {
    nodes: [
      { options: { node: "token" }, slots: { children: t("diagram.logicNode1") } },
      { options: { node: "scope" }, slots: { children: t("diagram.logicNode2") } },
      { options: { node: "revoked" }, slots: { children: t("diagram.gateRevoked") } },
      {
        options: { node: "fresh", shape: "not" },
        slots: { children: "NOT", designator: "U1" },
      },
      {
        options: { node: "both", shape: "and" },
        slots: { children: "AND", designator: "U2" },
      },
      {
        options: { node: "allow", shape: "terminal" },
        slots: { children: t("diagram.logicNode4") },
      },
    ],
    edges: [
      { options: { from: "token", to: "both", arrow: "none" }, slots: {} },
      { options: { from: "scope", to: "both", arrow: "none" }, slots: {} },
      { options: { from: "revoked", to: "fresh", arrow: "none" }, slots: {} },
      { options: { from: "fresh", to: "both", arrow: "none" }, slots: {} },
      { options: { from: "both", to: "allow", arrow: "none" }, slots: {} },
    ],
  },
});

/*
 * AN INFRASTRUCTURE DRAWING, which needs exactly one thing the demos above do not: a way to say
 * that some of these boxes are INSIDE something.
 *
 * `zones` is that, and it is the smallest version of it that is honest. A zone lays nothing out: the
 * grid puts the nodes where it puts them, and a zone traces a boundary around wherever the ones that
 * named it landed. So there is no coordinate here either, and a drawing re-arranged by a media query
 * takes its regions with it.
 *
 * NESTING IS DECLARED BY THE ZONE, NOT BY THE NODE. Each node names the innermost region it is in
 * and stops; `within` says the rest. Moving the private subnet into a different VPC is one edit,
 * not one per instance, which is the whole argument for splitting the two.
 *
 * The icons are not a feature: a node's slot has always taken a composition, and this is the first
 * demo to put something in it that is not a word.
 */
/*
 * THE RANKS A BOUNDARY PASSES BETWEEN NEED ROOM FOR IT.
 *
 * A zone reaches above its topmost member by its own padding plus the band its name sits in, which
 * at one level of nesting is 64px. The default rank gap is 40, so the VPC's top edge landed across
 * the CDN, a node that is deliberately OUTSIDE it: the drawing said the opposite of the data. This
 * is the component's own hook doing its job rather than a gap in it, and it is the reason the gap
 * is a hook at all.
 */
export const diagramZonedCss = `.sk-diagram {
  --sk-diagram-node-max-inline-size: 11rem;
  --sk-diagram-row-gap: 5rem;
  /* A service mark carries more of the meaning here than a word does, so it gets more room. */
  --sk-diagram-logo-size: 2.25rem;
}`;

/*
 * A NODE'S MARK, as an image.
 *
 * The `logo` slot takes a tree, so this is an `ImageFrame` around an SVG file and it could as
 * easily be a PNG, an `Icon` from the installed set, or anything else the catalogue renders. The
 * component's only contribution is the box: one size for every mark on the drawing
 * (`--sk-diagram-logo-size`), because a rank of logos that do not agree on a height reads as a rank
 * of things that are not alike.
 *
 * `radius: "none"` and `fit: "contain"` together are the rule for a MARK as opposed to a
 * photograph: a logo cropped or rounded is a logo altered, and every trademark guideline ever
 * written agrees about that one.
 *
 * THE MARKS ARE INVENTED, like every other brand on this site (`public/demos/logos` has six more).
 * Real cloud providers' service icons are trademarks with their own terms, and a design system's
 * documentation is the last place that should be quietly redistributing someone else's: what this
 * page is demonstrating is the SLOT, and a slot is demonstrated just as well by a mark nobody owns.
 */
const mark = (file: string): UsageTree => ({
  contract: "image-frame",
  signature: "ImageFrame",
  options: {
    src: `/demos/services/${file}.svg`,
    /* Empty on purpose: the node's own words already name the service, and a mark that repeats the
       name out loud is a second announcement of the same thing. */
    alt: "",
    aspect: "1/1",
    fit: "contain",
    radius: "none",
  },
});

const service = (file: string, label: string, options: ItemInput["options"]): ItemInput => ({
  options,
  slots: { children: label, logo: mark(file) },
});

export const diagramInfraTree = (t: Translate): UsageTree => ({
  contract: "diagram",
  signature: "Diagram",
  options: { label: t("diagram.infraLabel"), columns: 2 },
  slots: {
    zones: [
      { options: { zone: "vpc" }, slots: { children: t("diagram.infraZone1") } },
      { options: { zone: "public", within: "vpc" }, slots: { children: t("diagram.infraZone2") } },
      { options: { zone: "private", within: "vpc" }, slots: { children: t("diagram.infraZone3") } },
    ],
    nodes: [
      /*
       * THE ONE NODE WHOSE MARK IS AN ICON RATHER THAN AN IMAGE, and it is in the drawing to make
       * the point that the slot does not care: an `Icon` from the installed set and an
       * `ImageFrame` around an SVG land in the same box and come out the same size. The visitor is
       * also the one thing here that is not a service, so a drawn glyph rather than a product mark
       * is the honest picture of it.
       */
      {
        options: { node: "client", shape: "terminal", span: 2 },
        slots: {
          children: t("diagram.infraNode1"),
          logo: { contract: "icon", signature: "Icon", options: { name: "user" } },
        },
      },
      service("cdn", t("diagram.infraNode2"), { node: "edge", span: 2 }),
      service("balancer", t("diagram.infraNode3"), { node: "alb", span: 2, zone: "public" }),
      service("compute", t("diagram.infraNode4"), { node: "app", zone: "private" }),
      service("worker", t("diagram.infraNode5"), { node: "worker", zone: "private" }),
      service("database", t("diagram.infraNode6"), { node: "store", span: 2, zone: "private" }),
    ],
    edges: [
      { options: { from: "client", to: "edge" }, slots: { children: t("diagram.infraHttps") } },
      { options: { from: "edge", to: "alb" }, slots: {} },
      { options: { from: "alb", to: "app" }, slots: {} },
      { options: { from: "app", to: "store" }, slots: {} },
      { options: { from: "worker", to: "store" }, slots: {} },
    ],
  },
});

/*
 * THE SAME THING AGAIN WITH REAL SERVICE NAMES, which is the demo that proves the point the
 * generic one can only assert: nothing above is a toy vocabulary that happens to fit invented
 * services. It is three levels of region, seven boxes and six relationships, and it uses no option
 * the drawings further up have not already used.
 *
 * WHAT IT ADDS IS DEPTH. `AWS Cloud` holds a `VPC` holds two subnets, and each boundary draws
 * further out than the one inside it because a zone counts what is nested below it. S3 is the node
 * that makes that worth drawing: it is inside the cloud and OUTSIDE the VPC, which is where it
 * actually lives, and the only reason the picture can say so is that the two regions are separate
 * boxes rather than one nesting attribute on a node.
 *
 * The marks are the same invented ones the drawing above uses. Real service icons are trademarks
 * with their own terms; the NAMES are the vocabulary anyone would search for, and they are not.
 */
export const diagramAwsCss = `.sk-diagram {
  /*
   * THE COLUMN COUNT IS SET HERE AND NOT AS AN OPTION, and that is the whole reason the media query
   * below works. The columns OPTION writes this custom property as an INLINE STYLE, and nothing
   * in a stylesheet outranks one: a media query trying to re-flow a drawing whose author passed
   * columns:2 is a rule that never applies. The contract says as much where the option is
   * declared. The option is for a composition that owns the number; the hook is for when the
   * stylesheet does, and a responsive drawing is the second case.
   */
  --sk-diagram-columns: 2;
  --sk-diagram-node-max-inline-size: 13rem;
  --sk-diagram-logo-size: 2.25rem;
  /*
   * Three levels of region need more of both than two do: the outermost boundary reaches
   * padding x (depth + 1) past its members, plus a band for its own name, and the rank gap has to
   * be wider than that reach or the cloud's top edge lands across the node above it.
   */
  --sk-diagram-row-gap: 6rem;
  --sk-diagram-zone-inset: 4.25rem;
  --sk-diagram-zone-inset-block-start: 6.5rem;
}

/* The trunk covers both columns; ECS and SQS are the one pair that shares a rank. Addressed by the
   names the author already gave them, so the rule says what it means. */
.sk-diagram__node:not([data-node="ecs"]):not([data-node="sqs"]) {
  --sk-diagram-node-span: 2;
}

/*
 * AND THE CLAIM THE REST OF THE PAGE ONLY MAKES IN PROSE, made here instead.
 *
 * Two columns of long service names do not fit a phone: ECS and SQS end up a few pixels apart and
 * the word between them has nowhere to be. One media query, no JavaScript, and nothing that knows
 * this drawing exists: the grid re-flows, every box lands somewhere new, and the connectors, the
 * arrowheads, the labels and all four region boundaries are recomputed from where they landed.
 */
@media (max-width: 30rem) {
  /*
   * Both halves of the layout, because a one-column grid still grows an implicit second column for
   * anything spanning two. The selector repeats the one above it on purpose: a media query adds no
   * specificity, so a bare .sk-diagram__node here loses to the :not() pair outside and the spans
   * never change.
   */
  .sk-diagram__node:not([data-node="ecs"]):not([data-node="sqs"]) {
    --sk-diagram-node-span: 1;
  }

  .sk-diagram {
    --sk-diagram-columns: 1;
    /* Still wide enough for a boundary to pass between two ranks: the private subnet reaches 46px
       above its first node, and a rail pushed clear of that band needs room to turn at both ends. */
    --sk-diagram-row-gap: 5.5rem;
  }
}`;

export const diagramAwsTree = (t: Translate): UsageTree => ({
  contract: "diagram",
  signature: "Diagram",
  /* No `columns` here: see the note on `diagramAwsCss` for why this one is set in CSS. */
  options: { label: t("diagram.awsLabel") },
  slots: {
    zones: [
      { options: { zone: "cloud" }, slots: { children: t("diagram.awsZone1") } },
      { options: { zone: "vpc", within: "cloud" }, slots: { children: t("diagram.awsZone2") } },
      { options: { zone: "public", within: "vpc" }, slots: { children: t("diagram.awsZone3") } },
      { options: { zone: "private", within: "vpc" }, slots: { children: t("diagram.awsZone4") } },
    ],
    nodes: [
      /* Outside every region, because a person is. */
      {
        options: { node: "users", shape: "terminal" },
        slots: {
          children: t("diagram.awsNode1"),
          logo: { contract: "icon", signature: "Icon", options: { name: "user" } },
        },
      },
      service("cdn", "Amazon CloudFront", { node: "cdn", zone: "cloud" }),
      service("balancer", "Application Load Balancer", { node: "alb", zone: "public" }),
      service("compute", "Amazon ECS", { node: "ecs", zone: "private" }),
      service("queue", "Amazon SQS", { node: "sqs", zone: "private" }),
      service("database", "Amazon RDS", { node: "rds", zone: "private" }),
      /* In the cloud and OUTSIDE the VPC, which is where it lives. The drawing can only say that
         because the two regions are separate boxes: S3 sits below the VPC's lower edge and inside
         the cloud's, and no attribute on the node had to encode the difference. */
      service("storage", "Amazon S3", { node: "s3", zone: "cloud" }),
    ],
    edges: [
      { options: { from: "users", to: "cdn" }, slots: { children: "https" } },
      { options: { from: "cdn", to: "alb" }, slots: {} },
      { options: { from: "alb", to: "ecs" }, slots: {} },
      /* One line with a head at each end: the queue is pushed to and polled from, and drawing that
         as two lines would put two strokes in one corridor saying one thing. */
      {
        options: { from: "ecs", to: "sqs", arrow: "both" },
        slots: { children: t("diagram.awsJobs") },
      },
      { options: { from: "ecs", to: "rds" }, slots: { children: "SQL" } },
      { options: { from: "rds", to: "s3" }, slots: { children: t("diagram.awsSnapshots") } },
    ],
  },
});
