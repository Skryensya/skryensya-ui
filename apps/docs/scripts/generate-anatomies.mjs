import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const outputDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "../public/anatomies");

/* Source-controlled SVG, never screenshots. Hook cards derive their width from their longest label
 * plus the same inline padding; their leaders begin on that computed edge, not on a stale fixed box. */
const CARD_PADDING_INLINE = 14;
const HOOK_TEXT_ADVANCE = 6.7;
const TITLE_TEXT_ADVANCE = 7.1;
const PRIMARY_ICON_BUTTON = {
  width: 134.484375,
  height: 44,
  borderWidth: 1,
  paddingInline: 16,
  gap: 4,
  iconSize: 20,
  fontSize: 16,
  labelWidth: 76.484375,
  radius: 8,
  background: "#5283d2",
  foreground: "#141415",
  focus: "#6893d9",
};
const ANATOMY_BUTTON_HEIGHT = 80;
const ANATOMY_BUTTON_SCALE = ANATOMY_BUTTON_HEIGHT / PRIMARY_ICON_BUTTON.height;

const diagrams = {
  button: {
    file: "button.svg",
    button: {
      x: (1200 - PRIMARY_ICON_BUTTON.width * ANATOMY_BUTTON_SCALE) / 2,
      y: 270,
      width: PRIMARY_ICON_BUTTON.width * ANATOMY_BUTTON_SCALE,
      height: ANATOMY_BUTTON_HEIGHT,
      radius: PRIMARY_ICON_BUTTON.radius * ANATOMY_BUTTON_SCALE,
      label: "Descargar",
    },
    notes: [
      {
        x: 56,
        y: 60,
        title: "Focus ring",
        hooks: ["--focus-ring-color", "--focus-ring-width", "--focus-ring-offset"],
        arrow: ({ right, centerY }, { focusX, focusY }) => `M${right} ${centerY}C${right + 46} ${centerY} ${focusX + 24} 196 ${focusX} ${focusY}`,
      },
      {
        right: 1144,
        y: 60,
        title: "Border radius",
        hooks: ["--sk-button-radius"],
        arrow: ({ x, centerY }, { radiusX, radiusY }) => `M${x} ${centerY}C${x - 28} ${centerY} ${radiusX + 14} 198 ${radiusX} ${radiusY}`,
      },
      {
        x: 48,
        y: 256,
        title: "Border",
        hooks: ["--sk-button-border-width", "--sk-button-border-color"],
        arrow: ({ right, centerY }, { borderX, borderY }) => `M${right} ${centerY}C${right + 34} ${centerY} ${borderX - 24} 302 ${borderX} ${borderY}`,
      },
      {
        right: 1144,
        y: 246,
        title: "Height",
        hooks: ["--sk-button-height"],
        arrow: ({ x, centerY }, { heightMeasureX, heightCenterY }) => `M${x} ${centerY}C${x - 35} ${centerY} ${heightMeasureX + 20} 296 ${heightMeasureX} ${heightCenterY}`,
      },
      {
        center: 600,
        y: 438,
        title: "Width",
        hooks: ["--sk-button-width"],
        arrow: ({ centerX, y }, { widthMeasureY }) => `M${centerX} ${y}C${centerX} 414 ${centerX} 397 ${centerX} ${widthMeasureY}`,
      },
      {
        x: 74,
        y: 472,
        title: "Content inset",
        hooks: ["--sk-button-padding-x", "--sk-button-gap"],
        arrow: ({ right, centerY }, { iconBaseX, iconBaseY }) => `M${right} ${centerY}C${right + 46} ${centerY - 8} 472 374 ${iconBaseX} ${iconBaseY}`,
      },
      {
        right: 1144,
        y: 452,
        title: "Label",
        hooks: ["--sk-button-fg", "--sk-button-font-size", "--sk-button-font-weight"],
        arrow: ({ x, centerY }, { labelBaseX, labelBaseY }) => `M${x} ${centerY}C${x - 56} ${centerY - 18} 706 372 ${labelBaseX} ${labelBaseY}`,
      },
      {
        center: 780,
        y: 540,
        title: "Surface",
        hooks: ["--sk-button-bg", "--sk-button-shadow"],
        arrow: ({ centerX, y }, { surfaceTargetX, surfaceY }) => `M${centerX} ${y}C${centerX} 512 704 510 704 480V410C704 388 660 374 ${surfaceTargetX} ${surfaceY}`,
      },
    ],
  },
};

const escapeXml = (value) =>
  value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

function noteHeight({ hooks }) {
  return 38 + hooks.length * 17;
}

function noteWidth({ title, hooks }) {
  const titleWidth = title.length * TITLE_TEXT_ADVANCE;
  const hookWidth = Math.max(...hooks.map((hook) => hook.length * HOOK_TEXT_ADVANCE));

  return Math.ceil(Math.max(titleWidth, hookWidth) + CARD_PADDING_INLINE * 2);
}

function resolveNote(note) {
  const width = noteWidth(note);
  const height = noteHeight(note);
  const x = note.right === undefined ? (note.center === undefined ? note.x : note.center - width / 2) : note.right - width;

  return { ...note, x, width, height, right: x + width, centerX: x + width / 2, centerY: note.y + height / 2 };
}

function renderArrows(notes, features) {
  return notes.map((note) => `<path d="${note.arrow(note, features)}" class="arrow" marker-end="url(#arrowhead)" />`).join("\n");
}

function renderCard({ x, y, width, height, title, hooks }) {
  return `
    <g class="hook-card-group" data-hook-card="${escapeXml(title)}">
      <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="10" class="hook-card" />
      <text x="${x + CARD_PADDING_INLINE}" y="${y + 21}" class="card-title">${escapeXml(title)}</text>
      ${hooks.map((hook, index) => `<text x="${x + CARD_PADDING_INLINE}" y="${y + 41 + index * 17}" class="hook">${escapeXml(hook)}</text>`).join("\n")}
    </g>
  `;
}

function renderButton({ button, notes }) {
  const { x, y, width, height, radius, label } = button;
  const scale = height / PRIMARY_ICON_BUTTON.height;
  const focusRingWidth = 2 * scale;
  const focusRingOffset = 2 * scale;
  const focusInset = focusRingOffset + focusRingWidth / 2;
  const focusX = x - focusInset;
  const focusY = y - focusInset;
  const iconSize = PRIMARY_ICON_BUTTON.iconSize * scale;
  const iconX = x + (PRIMARY_ICON_BUTTON.borderWidth + PRIMARY_ICON_BUTTON.paddingInline) * scale;
  const iconY = y + (height - iconSize) / 2;
  const labelFontSize = PRIMARY_ICON_BUTTON.fontSize * scale;
  const labelX = iconX + iconSize + PRIMARY_ICON_BUTTON.gap * scale;
  const labelY = y + height / 2 + labelFontSize * 0.36;
  const labelWidth = PRIMARY_ICON_BUTTON.labelWidth * scale;
  const widthMeasureY = y + height + 32;
  const heightMeasureX = x + width + 28;
  const features = {
    focusX,
    focusY,
    radiusX: x + width,
    radiusY: y,
    borderX: x,
    borderY: y + height / 2,
    heightMeasureX,
    heightCenterY: y + height / 2,
    widthMeasureY,
    iconBaseX: iconX + iconSize / 2,
    iconBaseY: iconY + (21 / 24) * iconSize + 5,
    labelBaseX: labelX + labelWidth / 2,
    labelBaseY: labelY + 8,
    surfaceTargetX: x + width / 2,
    surfaceY: y + height + 12,
  };
  const resolvedNotes = notes.map(resolveNote);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="640" viewBox="0 0 1200 640" role="img" aria-labelledby="title description">
  <title id="title">Button anatomy</title>
  <desc id="description">Button primario real con icono Lucide de descarga y etiqueta. El tamaño, radio, padding, gap, tipografía, colores y sombra siguen el Button documentado; las tarjetas muestran sus styling hooks.</desc>
  <defs>
    <filter id="soft-shadow" x="-20%" y="-30%" width="140%" height="180%">
      <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#17233a" flood-opacity="0.12" />
    </filter>
    <filter id="button-shadow" x="-15%" y="-35%" width="130%" height="190%">
      <feDropShadow in="SourceGraphic" dx="0" dy="${scale}" stdDeviation="${scale}" flood-color="#000000" flood-opacity="0.5" result="button-shadow-small" />
      <feDropShadow in="SourceGraphic" dx="0" dy="${scale}" stdDeviation="${scale * 1.5}" flood-color="#000000" flood-opacity="0.5" result="button-shadow-large" />
      <feMerge>
        <feMergeNode in="button-shadow-small" />
        <feMergeNode in="button-shadow-large" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="6.5" refY="4" orient="auto-start-reverse" markerUnits="strokeWidth">
      <path d="M0 0L8 4L0 8Z" fill="#2676d9" />
    </marker>
    <marker id="measure-arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto-start-reverse" markerUnits="strokeWidth">
      <path d="M0 0L6 3L0 6Z" fill="#8a99ad" />
    </marker>
  </defs>
  <style>
    .hook-card { fill: #ffffff; stroke: #c3ccd9; stroke-width: 1.25; filter: url(#soft-shadow); }
    .card-title { fill: #516071; font: 700 12px ui-sans-serif, system-ui, sans-serif; letter-spacing: 0.1px; }
    .hook { fill: #172033; font: 700 11px ui-monospace, SFMono-Regular, Menlo, monospace; }
    .button-surface { fill: ${PRIMARY_ICON_BUTTON.background}; }
    .focus-ring { fill: none; stroke: ${PRIMARY_ICON_BUTTON.focus}; stroke-linejoin: round; }
    .button-label { fill: ${PRIMARY_ICON_BUTTON.foreground}; font-family: Inter, system-ui, sans-serif; font-weight: 500; letter-spacing: 0; }
    .button-icon { fill: none; stroke: ${PRIMARY_ICON_BUTTON.foreground}; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
    .arrow { fill: none; stroke: #2676d9; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
    .measure { fill: none; stroke: #8a99ad; stroke-width: 1.25; stroke-linecap: round; stroke-linejoin: round; }
  </style>
  <rect width="1200" height="640" fill="#f4f7fc" />
  <path d="M0 174C252 104 450 166 606 120C806 61 1000 146 1200 78V0H0Z" fill="#e9f1ff" opacity="0.72" />
  <path d="M0 578C272 504 396 586 622 530C830 478 1028 554 1200 504V640H0Z" fill="#eef4ff" opacity="0.8" />
  <rect x="24" y="24" width="1152" height="592" rx="22" fill="#ffffff" fill-opacity="0.78" stroke="#dce3ed" stroke-width="1" />
  <rect x="${focusX}" y="${focusY}" width="${width + focusInset * 2}" height="${height + focusInset * 2}" rx="${radius + focusInset}" class="focus-ring" stroke-width="${focusRingWidth}" />
  <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}" class="button-surface" filter="url(#button-shadow)" />
  <g class="button-icon" transform="translate(${iconX} ${iconY}) scale(${iconSize / 24})">
    <path d="M12 15V3" />
    <path d="M21 15V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V15" />
    <path d="M7 10L12 15L17 10" />
  </g>
  <text x="${labelX}" y="${labelY}" class="button-label" style="font-size: ${labelFontSize}px" textLength="${labelWidth}" lengthAdjust="spacing">${escapeXml(label)}</text>
  <path d="M${x} ${widthMeasureY}H${x + width}" class="measure" marker-start="url(#measure-arrowhead)" marker-end="url(#measure-arrowhead)" />
  <path d="M${x} ${y + height}V${widthMeasureY + 8}M${x + width} ${y + height}V${widthMeasureY + 8}" class="measure" />
  <path d="M${heightMeasureX} ${y}V${y + height}" class="measure" marker-start="url(#measure-arrowhead)" marker-end="url(#measure-arrowhead)" />
  <path d="M${x + width} ${y}H${heightMeasureX + 8}M${x + width} ${y + height}H${heightMeasureX + 8}" class="measure" />
  ${renderArrows(resolvedNotes, features)}
  ${resolvedNotes.map(renderCard).join("\n")}
</svg>
`;
}

await mkdir(outputDirectory, { recursive: true });
await Promise.all(
  Object.values(diagrams).map(({ file, ...diagram }) => writeFile(resolve(outputDirectory, file), renderButton(diagram))),
);
