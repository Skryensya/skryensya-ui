export const statMessages = {
  es: {
    "demo.stat.summary": "Resumen del negocio",
    "demo.stat.income": "Ingresos",
    "demo.stat.orders": "Pedidos",
    "demo.stat.cancellations": "Cancelaciones",
    "demo.stat.versus": "vs. mes anterior",
    "demo.stat.relative": "Rendimiento relativo",
    "demo.stat.cumulative": "Acumulado del período",
    "demo.stat.activity": "Actividad",
    "demo.stat.increases": "Aumenta",
    "demo.stat.decreases": "Disminuye",
    "demo.stat.stable": "Estable",

    "statPage.description": "Stat: métrica de titular con label, valor tabular y cambio coloreado por tendencia.",
    "statPage.lede":
      "Stat es una métrica de titular: label tenue, valor grande en mono tabular, y un cambio opcional. La <strong>tendencia</strong> colorea el cambio con independencia de su signo, «bajar» es bueno para churn y «subir» es bueno para ingresos, así que el consumidor decide qué dirección es positiva.",
    "statPage.anatomyBody":
      "Este diagrama nombra la etiqueta, el valor y el cambio. El espécimen está congelado; las métricas vivas empiezan abajo.",
    "statPage.anatomyLabel": "Anatomía de Stat",
    "statPage.anatomyPreviewLabel": "Stat, parte por parte",
    "statPage.cardTitle": "Stat Card",
    "statPage.cardBody":
      '<a href="/componentes/card#stat-card">Card</a> no añade otra variante a Stat: <a href="/components/box">Box</a> aporta la superficie y Grid organiza la colección. La flecha baja en cancelaciones, pero <code>trend="up"</code> comunica que ese cambio es favorable.',
    "statPage.animateTitle": "Animar el valor",
    "statPage.animateBody":
      "El count-up es <strong>opt-in</strong>: el mismo Stat Card, con <code>animate</code> / <code>data-animate</code> y un valor numérico. Sin él el markup sigue estático. La duración sale de <code>--motion-count-duration</code>; con <code>prefers-reduced-motion</code> salta al final.",
    "statPage.animateLabel": "Stat Cards animadas",
    "statPage.animateNote": "Mismo card · animate + format / data-count",
    "statPage.test1": "Colorea el cambio según la tendencia, no según el signo.",
    "statPage.test2": "Omite el elemento de cambio cuando no se pasa ninguno.",
    "statPage.test3": "Cuenta un valor numérico hacia arriba cuando <code>animate</code> está activo.",
  },
  en: {
    "demo.stat.summary": "Business summary",
    "demo.stat.income": "Income",
    "demo.stat.orders": "Orders",
    "demo.stat.cancellations": "Cancellations",
    "demo.stat.versus": "vs. previous month",
    "demo.stat.relative": "Relative performance",
    "demo.stat.cumulative": "Period total",
    "demo.stat.activity": "Activity",
    "demo.stat.increases": "Increases",
    "demo.stat.decreases": "Decreases",
    "demo.stat.stable": "Stable",

    "statPage.description": "Stat: a headline metric with a label, a tabular value, and a trend-colored change.",
    "statPage.lede":
      "Stat is a headline metric: a dim label, a large tabular-mono value, and an optional change. <strong>Trend</strong> colors the change independent of its sign. \"down\" is good for churn and \"up\" is good for revenue, so the consumer decides which direction is positive.",
    "statPage.anatomyBody":
      "This diagram names the label, the value, and the change. The specimen is frozen; the live metrics start below.",
    "statPage.anatomyLabel": "Stat anatomy",
    "statPage.anatomyPreviewLabel": "Stat, part by part",
    "statPage.cardTitle": "Stat Card",
    "statPage.cardBody":
      '<a href="/en/components/card#stat-card">Card</a> adds no extra variant to Stat: <a href="/en/components/box">Box</a> supplies the surface and Grid organizes the collection. The arrow points down on cancellations, but <code>trend="up"</code> communicates that the change is favorable.',
    "statPage.animateTitle": "Animating the value",
    "statPage.animateBody":
      "The count-up is <strong>opt-in</strong>: the same Stat Card, with <code>animate</code> / <code>data-animate</code> and a numeric value. Without it, the markup stays static. The duration comes from <code>--motion-count-duration</code>; under <code>prefers-reduced-motion</code> it jumps straight to the end.",
    "statPage.animateLabel": "Animated Stat Cards",
    "statPage.animateNote": "Same card · animate + format / data-count",
    "statPage.test1": "Colors the change by trend, not by sign.",
    "statPage.test2": "Omits the change element when no change is given.",
    "statPage.test3": "Counts a numeric value up when animate is on.",
  },
} as const;
