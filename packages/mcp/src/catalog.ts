import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// packages/mcp/src -> repo root -> docs/ai/schemas
const SCHEMAS_DIR = path.resolve(__dirname, "../../../docs/ai/schemas");
const IGNORED_FILES = new Set(["_meta.json", "_invariants.json"]);

export interface SurfaceEntry {
  id: string;
  surface: string;
  use: string;
  element: string;
  requires?: string[];
  forbids?: string[];
}

export interface ComponentSchema {
  id: string;
  [key: string]: unknown;
}

let cachedIndex: SurfaceEntry[] | null = null;
let cachedSchemas: Map<string, ComponentSchema> | null = null;

async function loadAll(): Promise<{ index: SurfaceEntry[]; schemas: Map<string, ComponentSchema> }> {
  if (cachedIndex && cachedSchemas) {
    return { index: cachedIndex, schemas: cachedSchemas };
  }

  const files = await readdir(SCHEMAS_DIR);
  const index: SurfaceEntry[] = [];
  const schemas = new Map<string, ComponentSchema>();

  for (const file of files) {
    if (!file.endsWith(".json") || IGNORED_FILES.has(file)) continue;

    const raw = await readFile(path.join(SCHEMAS_DIR, file), "utf-8");
    const schema = JSON.parse(raw) as ComponentSchema;
    schemas.set(schema.id, schema);

    const surfaces = (schema.surfaces ?? {}) as Record<
      string,
      { use: string; element: string; requires?: string[]; forbids?: string[] }
    >;

    for (const [surface, def] of Object.entries(surfaces)) {
      index.push({
        id: schema.id,
        surface,
        use: def.use,
        element: def.element,
        requires: def.requires,
        forbids: def.forbids,
      });
    }
  }

  cachedIndex = index;
  cachedSchemas = schemas;
  return { index, schemas };
}

/** Every {id, surface, use} in the catalog. Cheap: no props, meanings, rules or examples. */
export async function listSurfaces(): Promise<SurfaceEntry[]> {
  const { index } = await loadAll();
  return index;
}

/** The full composition guide for one component id, as authored in docs/ai/schemas. */
export async function getSchema(id: string): Promise<ComponentSchema | undefined> {
  const { schemas } = await loadAll();
  return schemas.get(id);
}

export async function listIds(): Promise<string[]> {
  const { schemas } = await loadAll();
  return [...schemas.keys()];
}
