/*
 * El renderer de iconos de React.
 *
 * React renderiza, no hidrata (decisión 14), por eso aquí hay un componente y en @skryensya/vanilla no
 * hay nada. No es una omisión: la capa vanilla existe para el comportamiento que la plataforma no da,
 * y un icono no tiene comportamiento. Un consumidor de vanilla escribe el `<svg>` a mano; el markup
 * contract se documenta y nunca se envía (decisión 8).
 */
import { renderIconBox, type IconData, type IconSet, type IconSize, type StableIconName } from "@skryensya/core/icon";
import { phosphorIcons } from "@skryensya/icons-phosphor";
import { createContext, useContext, type ReactNode, type SVGAttributes } from "react";

/*
 * El set enlazado. Va por contexto y no por prop porque los componentes fundacionales (select, tile,
 * sidebar) consumen roles adentro y pasárselos sería drilling por todo el árbol.
 *
 * Y va por contexto y no por un registro global de módulo porque el sitio, el consumidor real
 * (decisión 12), va a querer mostrar dos sets en una misma página, y una variable de módulo solo
 * puede tener uno.
 *
 * El default es Phosphor: `<Icon name="close" />` dibuja sin configuración (decisión 15, revisada).
 * El precio es que Phosphor, y solo Phosphor, viaja en el bundle de todo consumidor de React, igual
 * que `brands/default.scss` viaja en core. Salirse del default sigue siendo opt-in: se instala
 * `@skryensya/icons-lucide` o `@skryensya/icons-material` y se envuelve el árbol en
 * `<IconSetProvider set={…}>`. Esos dos NO se empaquetan hasta que se los importa.
 */
const IconSetContext = createContext<IconSet>(phosphorIcons);

export type IconSetProviderProps = {
  /** El set que ocupa el vocabulario estable. Enlazarlo es lo mismo que elegir una marca. */
  set: IconSet;
  children: ReactNode;
};

export function IconSetProvider({ set, children }: IconSetProviderProps) {
  return <IconSetContext.Provider value={set}>{children}</IconSetContext.Provider>;
}

type IconBaseProps = Omit<
  SVGAttributes<SVGSVGElement>,
  // el renderer las escribe; dejarlas pasar deja al consumidor romper la accesibilidad y el viewBox
  "children" | "dangerouslySetInnerHTML" | "role" | "aria-label" | "aria-hidden" | "focusable" | "viewBox"
> & {
  /**
   * El nombre accesible. Con label el icono es contenido (`role="img"`); sin label es decorativo
   * (`aria-hidden`).
   *
   * Un icono adentro de un control con texto es decorativo: el texto ya nombra la acción. Un icono
   * SOLO adentro de un botón también: el nombre accesible es del botón (`aria-label`), no del svg.
   * El label aquí es para el icono que se para solo y significa algo por sí mismo.
   */
  label?: string;
  size?: IconSize;
};

/*
 * `name` o `data`, nunca los dos, la unión discriminada ES la distinción que la propuesta original
 * repartía entre <Icon> y <SetIcon> (decisión 15).
 *
 *   name → un rol del sistema, portable, sobrevive un cambio de set
 *   data → geometría del proyecto, acoplada a propósito, y del consumidor
 *
 * No hay un SetIcon porque sería el sistema tipando el vocabulario de un inquilino (decisión 2). La
 * app que quiera nombres para sus iconos escribe su propio wrapper de tres líneas sobre `data`.
 */
export type IconProps = IconBaseProps &
  ({ name: StableIconName; data?: never } | { data: IconData; name?: never });

export function Icon({ name, data, label, size = "md", className, ...props }: IconProps) {
  // El contexto siempre tiene un set: Phosphor por defecto, o el que enlace un IconSetProvider más
  // arriba. `data` no lee el contexto, es geometría del proyecto, portable sin set (decisión 15).
  const set = useContext(IconSetContext);
  const icon = name !== undefined ? set[name] : data!;

  // La caja se calcula una vez, en core, como dato: presentation son los attrs del set (sin las llaves
  // que la caja se reserva), box es lo que el binding manda. Este componente es sólo el adapter a JSX.
  const { presentation, box, body } = renderIconBox({ icon, size, label, className });

  // presentation primero (fill/stroke), luego los props del consumidor, luego la caja, que gana. En
  // JSX el último spread pisa, así que este orden reproduce la precedencia exacta: un set no puede
  // tocar el viewBox ni la a11y, y el consumidor sí puede pisar fill/stroke pero no el contrato.
  const boxProps: Record<string, string> = {};
  for (const [k, v] of box) boxProps[k === "class" ? "className" : k] = v;

  return (
    <svg
      {...Object.fromEntries(presentation)}
      {...props}
      {...boxProps}
      // El body es confiable por contrato: geometría autorada o de build, nunca de un usuario ni de
      // una API (decisión 15, "el costo dicho"). Hoy eso es una convención de tipo, no una regla que
      // el validador ejecute.
      dangerouslySetInnerHTML={{ __html: body }}
    />
  );
}
