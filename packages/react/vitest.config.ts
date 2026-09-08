import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, "dist/**"],
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
    /*
     * 15s, contra el default de 5s de Vitest, porque ese default está pensado para un test unitario
     * que corre en milisegundos y acá casi ninguno lo es: montan un componente en jsdom y manejan
     * una máquina de Zag, cuyos listeners se enganchan detrás de cadenas `raf` + `raf` +
     * `setTimeout(0)`, así que cada `waitFor` espera varios turnos del event loop de verdad.
     *
     * MEDIDO, no elegido a ojo. Con la máquina tranquila el test más lento de este paquete tarda
     * 2575ms: ya el 51% del presupuesto de 5s, un margen de 2x. Con otra cosa usando la CPU (una
     * corrida de Playwright al lado, un build) los mismos tests pasan de 13 a 249 por encima de
     * 500ms, con picos de 35s. Ahí seis tests distintos empezaron a fallar por timeout en cada
     * corrida, nunca los mismos, en componentes sin relación entre sí: accordion, calendar, select,
     * sidebar, storage, y a la siguiente color-picker, date-picker, tooltip. Eso no es un bug, es
     * contención, y un suite que da rojo según lo que esté corriendo al lado enseña a ignorar el rojo.
     *
     * NO ESCONDE UN CUELGUE: un test genuinamente colgado no termina nunca, así que 15s en vez de 5s
     * sólo cambia cuánto se espera antes de decirlo, no si se dice. Lo que sí compra es que el
     * resultado deje de depender de la carga de la máquina.
     */
    testTimeout: 15_000,
  },
});
