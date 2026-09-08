/*
 * NO CONSUMER. Nothing in `src/` reads these keys: the page they documented is gone and its
 * copy was left behind. Kept here rather than deleted in the move, so the deletion is its own
 * reviewable change instead of a silent loss inside a 9,800-line refactor.
 */
export const themeToggleMessages = {
  es: {

    "themeTogglePage.description": "Theme Toggle: cicla el modo de color system → claro → oscuro y re-tematiza con color-scheme.",
    "themeTogglePage.lede":
      'Theme Toggle cicla el <strong>modo de color</strong> (system → claro → oscuro → system). Es un Button ghost icon-only con tres caras apiladas; al hacer clic escribe <code>data-scheme</code> y <code>color-scheme</code> en <code>&lt;html&gt;</code> para que <code>light-dark()</code> re-tematice. El tamaño es el del Button: <strong>md</strong> (por defecto) o <code>data-size="sm"</code> / <code>size="sm"</code>. La persistencia la pone la app.',
    "themeTogglePage.previewNote": "md · sm",
    "themeTogglePage.contractItem1":
      "Las caras usan los roles estables <code>mode-system</code>, <code>mode-light</code> y <code>mode-dark</code>, marcadas con <code>data-sk-theme-toggle-icon</code>.",
    "themeTogglePage.contractItem2": "El enhancer aplica el modo en <code>document.documentElement</code> y dispara <code>sk-theme-toggle-change</code> con <code>detail.value</code>.",
    "themeTogglePage.contractItem3":
      'Un script FOUC en el <code>&lt;head&gt;</code> debe leer la preferencia guardada y pintar <code>data-scheme</code> / <code>color-scheme</code> antes del primer paint (ver <a href="/first-component">Primer componente</a>).',
    "themeTogglePage.test1": "Monta una sola vez y recorre sistema → claro → oscuro al hacer click.",
    "themeTogglePage.test2": "Dispara <code>sk-theme-toggle-change</code> con el nuevo modo.",
    "themeTogglePage.test3": "Mantiene sincronizados todos los ThemeToggle cuando uno cambia.",
  },
  en: {

    "themeTogglePage.description": "Theme Toggle: cycles color mode system → light → dark and re-themes with color-scheme.",
    "themeTogglePage.lede":
      "Theme Toggle cycles the <strong>color mode</strong> (system → light → dark → system). It is a ghost, icon-only Button with three stacked faces; on click it writes <code>data-scheme</code> and <code>color-scheme</code> on <code>&lt;html&gt;</code> so <code>light-dark()</code> re-themes. Its size is Button's own: <strong>md</strong> (default) or <code>data-size=\"sm\"</code> / <code>size=\"sm\"</code>. Persistence is the app's job.",
    "themeTogglePage.previewNote": "md · sm",
    "themeTogglePage.contractItem1":
      "The faces use the stable <code>mode-system</code>, <code>mode-light</code>, and <code>mode-dark</code> roles, marked with <code>data-sk-theme-toggle-icon</code>.",
    "themeTogglePage.contractItem2": "The enhancer applies the mode on <code>document.documentElement</code> and fires <code>sk-theme-toggle-change</code> with <code>detail.value</code>.",
    "themeTogglePage.contractItem3":
      'A FOUC script in the <code>&lt;head&gt;</code> must read the stored preference and paint <code>data-scheme</code> / <code>color-scheme</code> before the first paint (see <a href="/en/first-component">First component</a>).',
    "themeTogglePage.test1": "Mounts once and cycles system → light → dark on click.",
    "themeTogglePage.test2": "Dispatches sk-theme-toggle-change with the new mode.",
    "themeTogglePage.test3": "Keeps every ThemeToggle in sync when one cycles.",
  },
} as const;
