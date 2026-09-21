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
 */
export const diagramCycleCss = `.sk-diagram {
  --sk-diagram-node-max-inline-size: 11rem;
  --sk-diagram-node-min-inline-size: 5rem;
  padding-inline: 3.5rem;
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

export const diagramModelTree = (t: Translate): UsageTree => ({
  contract: "diagram",
  signature: "Diagram",
  options: { label: t("diagram.modelDiagramLabel"), columns: 2 },
  slots: {
    nodes: [
      {
        options: { node: "customer" },
        slots: {
          children: t("diagram.modelNode1"),
          rows: [field("id", "id"), field("email", "email"), field("name", "name")],
        },
      },
      {
        options: { node: "order" },
        slots: {
          children: t("diagram.modelNode2"),
          rows: [field("id", "id"), field("customer_id", "customer_id"), field("total", "total")],
        },
      },
      {
        options: { node: "line" },
        slots: {
          children: t("diagram.modelNode3"),
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
          children: t("diagram.modelNode4"),
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
