/*
 * Las machines compartidas, una sola fuente para los dos bindings.
 *
 * Un componente con estado tiene UNA máquina de estados, no dos. Antes vivía duplicada: React la
 * tomaba de Zag y la capa vanilla la reimplementaba a mano, pineadas sólo por los `*Parts` const. Acá
 * core re-exporta las machines de Zag, que son framework-agnósticas, como todo lo demás de core, para
 * que React (`@zag-js/react`) y la capa vanilla (`@zag-js/svelte`) adapten LA MISMA máquina. Ese es el
 * corte de "una machine, dos adapters": el comportamiento tiene un solo dueño, y el contrato de parts
 * se verifica contra la máquina en vez de duplicarse en un fixture.
 *
 * COSTO, dicho: esto hace que `@skryensya/core` tenga `dependencies`, las de `@zag-js/*`. La invariante
 * "core no tiene deps" (que sostenía, entre otras cosas, el argumento de por qué un set de iconos no
 * puede vivir en core) deja de ser cierta. Se acepta porque una machine NO es un inquilino: no nombra
 * una marca ni un proveedor, es comportamiento agnóstico de plataforma, que es exactamente lo que core
 * publica. La geometría de un icono sigue sin poder vivir acá; una máquina sí. Ver ADR-0024.
 */

export * as tabs from "@zag-js/tabs";
export * as carousel from "@zag-js/carousel";
export * as collapsible from "@zag-js/collapsible";
export * as accordion from "@zag-js/accordion";
export * as checkbox from "@zag-js/checkbox";
export * as radioGroup from "@zag-js/radio-group";
export * as select from "@zag-js/select";
export * as tooltip from "@zag-js/tooltip";
export * as combobox from "@zag-js/combobox";
export * as datePicker from "@zag-js/date-picker";
export * as fileUpload from "@zag-js/file-upload";
export * as menu from "@zag-js/menu";
export * as numberInput from "@zag-js/number-input";
export * as treeView from "@zag-js/tree-view";
