export { emit, emitMarkup, emitReact, EmitError, type Binding } from "./emit.js";
export { buildManifest, canonical, SCHEMA_VERSION, type ManifestBuild } from "./manifest.js";
export { readOverlays, type ContractSemantics, type SignatureSemantics } from "./overlay.js";
export { checkBindingConformance, type ConformanceProblem } from "./conformance.js";
export {
  contractIds,
  contracts,
  getContract,
  getSignature,
  signatureOptions,
  type ContractId,
} from "./registry.js";
export {
  isUsageTree,
  slotItems,
  slotsOf,
  type OptionInput,
  type SlotContent,
  type UsageTree,
} from "./usage-tree.js";
export {
  validateUsageTree,
  type Problem,
  type Severity,
  type ValidationResult,
} from "./validate.js";
