export const diagramMessages = {
  es: {
    "diagram.anatomyLabel": "Anatomía de Diagram",
    "diagram.anatomyPreviewLabel": "Diagram, parte por parte",
    "diagram.anatomyBody": "Los nodos y la lista de aristas se escriben; los conectores, sus líneas y sus puntas los dibuja el enhancer a partir de las aristas. Por eso la lista de aristas está oculta a la vista y lo que se anilla es la capa de conectores.",
    "diagram.description":
      "Cajas y flechas: nodos de HTML normal en una grilla, y aristas que dicen sólo de dónde a dónde. El runtime mide y dibuja los recorridos.",
    "diagram.betaBadge": "Beta",
    "diagram.lede":
      "Annotation nombra las partes de <strong>una</strong> cosa ya dibujada. Diagram dice cómo se relacionan <strong>varias</strong>. Son las dos mitades de lo que sirve un dibujo en documentación, y esta es la segunda: un marco con dos colecciones, <code>nodes</code> y <code>edges</code>, y nada más. Quien compone escribe cajas de HTML y pares <code>from</code>/<code>to</code>; el runtime mide dónde cayó cada caja y de ahí salen los recorridos, los codos, las puntas de flecha y dónde se apoya cada etiqueta. Ninguna coordenada se escribe a mano.",

    "diagram.whenTitle": "Cuándo usarlo",
    "diagram.whenBody1":
      "Cuando lo que hay que explicar es una <em>relación</em>: qué pasa después de qué, qué decide una bifurcación, en qué estados puede estar algo y cómo se pasa de uno a otro. Está pensado para diagramas chicos, los que aparecen adentro de un texto: un flujo, un if/else, un árbol de decisión de dos niveles, una máquina de estados con un ciclo.",
    "diagram.whenBody2":
      "No es <a href=\"/componentes/annotation\">Annotation</a>, que ancla etiquetas a un selector adentro de un sujeto y no dibuja un grafo. No es <a href=\"/componentes/process-list\">ProcessList</a> ni <a href=\"/componentes/steps\">Steps</a>: una secuencia sin ramas y sin ciclos es una lista, y ponerle líneas no la explica mejor. Y no es una librería de grafos: no resuelve disposición, no hay zoom, no hay arrastre, no hay fuerza dirigida. Si el grafo viene de datos y hay que explorarlo, esto no es lo que hace falta.",

    "diagram.modelTitle": "Dos sustantivos, y ningún tipo de diagrama",
    "diagram.modelBody":
      "La API entera son <strong>nodos</strong> y <strong>aristas</strong>. Un nodo tiene un nombre (<code>node</code>) y contenido HTML; una arista tiene <code>from</code> y <code>to</code>, y opcionalmente una etiqueta. No existe <code>type=\"flowchart\"</code> ni <code>type=\"state-machine\"</code>, a propósito: los cuatro dibujos de esta página salen de las mismas dos colecciones, y un contrato que ofreciera esos modos estaría afirmando una diferencia de renderizado que no existe, y le debería un quinto modo a la primera persona cuyo dibujo quedara entre dos. Lo único que cambia cómo se dibuja un nodo es su forma, y lo único que hace que un dibujo sea un ciclo es que una arista apunte hacia arriba.",

    "diagram.flowTitle": "Un flujo lineal",
    "diagram.flowBody":
      "El piso: una columna, cuatro nodos, tres aristas. Los extremos son <code>terminal</code> (una píldora: ahí empieza y ahí termina) y el medio son <code>process</code>. No hay <code>columns</code> en este ejemplo porque una columna es lo que ya dice la hoja de estilos, y escribir <code>columns: 1</code> enseñaría un valor que no cambia nada. Las aristas sin etiqueta no dibujan ninguna cápsula: la mayoría de un flujo lineal no tiene nada que decir entre un paso y el siguiente.",
    "diagram.flowPreviewLabel": "Publicar una nota",
    "diagram.flowLabel": "Flujo de publicación",
    "diagram.flowNode1": "Borrador",
    "diagram.flowNode2": "Revisión editorial",
    "diagram.flowNode3": "Programar",
    "diagram.flowNode4": "Publicado",
    "diagram.flowEdge": "aprobado",

    "diagram.branchTitle": "Un if/else",
    "diagram.branchBody":
      "Dos columnas, y el tronco (<code>terminal</code> y <code>decision</code>) las abarca a las dos con <code>span: 2</code>. Eso es todo lo que hace falta para que la bifurcación quede centrada sobre sus dos ramas: grilla CSS común, no un concepto de diagramas. Fíjate de dónde salen las dos aristas del rombo: de sus <em>caras</em> inferiores, no de su vértice de abajo ni del borde de la caja que lo contiene. Es la misma regla que usa cualquier otro nodo (repartir los orígenes a lo largo del contorno que mira hacia ese lado), y en un rombo esa regla produce sola el dibujo que tiene todo diagrama de flujo. La última arista, <code>retry</code>, vuelve desde el login hacia la pregunta: un ciclo, en un dibujo que nadie llamaría máquina de estados.",
    "diagram.branchPreviewLabel": "Una petición autenticada",
    "diagram.branchLabel": "Flujo de autenticación",
    "diagram.branchNode1": "Petición",
    "diagram.branchNode2": "¿Sesión válida?",
    "diagram.branchNode3": "Panel",
    "diagram.branchNode4": "Ingreso",
    "diagram.branchYes": "sí",
    "diagram.branchNo": "no",
    "diagram.branchRetry": "reintenta",

    "diagram.treeTitle": "Un árbol de decisión",
    "diagram.treeBody":
      "Lo mismo, un nivel más abajo, y sin una sola opción que el ejemplo anterior no haya usado ya. Cuatro columnas, una hoja por columna, y cada pregunta abarca el par que gobierna. Así se dibuja un árbol acá: un nodo abarca las ramas que tiene debajo. No hay <code>depth</code>, no hay <code>parent</code>, no hay anidamiento en los datos, porque un árbol no es otra clase de diagrama, y en el momento en que el contrato dijera que sí, le debería una respuesta a cada dibujo que está a mitad de camino. El selector de pantalla abre en teléfono, donde cuatro hojas seguidas no entran: la hoja de estilos del propio ejemplo (la pestaña <strong>CSS</strong>) baja una fila cada segunda hoja y achata los dos rombos, y con eso una caja puede ser más ancha que su columna sin tocar a la de al lado. La composición no cambió en nada: se reacomodó la grilla, y los recorridos, las puntas de flecha y las etiquetas se recalcularon desde donde quedó cada caja.",
    "diagram.treePreviewLabel": "Triaje de un reclamo",
    "diagram.treeLabel": "Triaje de un reclamo",
    "diagram.treeNode1": "Reclamo",
    "diagram.treeNode2": "¿Está pagado?",
    "diagram.treeNode3": "¿Ya se despachó?",
    "diagram.treeNode4": "¿Cómo pagó?",
    "diagram.treeLeaf1": "Reclamo al correo",
    "diagram.treeLeaf2": "Redespachar",
    "diagram.treeLeaf3": "Ver transferencia",
    "diagram.treeLeaf4": "Ver el cobro",
    "diagram.treeYes": "sí",
    "diagram.treeNo": "no",
    "diagram.treeTransfer": "transferencia",
    "diagram.treeCard": "tarjeta",

    "diagram.canvasTitle": "En un canvas",
    "diagram.canvasBody":
      "La otra respuesta al mismo árbol en un teléfono es no reacomodarlo. Envuelto en un <code>Canvas</code>, el diagrama se compone a su ancho de escritorio (cada columna con su nodo más ancho, <code>--sk-diagram-canvas-inline-size</code>) y se muestra ajustado: se ve entero y chico, y quien lee hace zoom en la rama que le interesa. Sin hoja de estilos propia, sin container queries. Los conectores se miden en las coordenadas del dibujo y no en las de la pantalla, así que el zoom no vuelve a trazar nada.",
    "diagram.canvasPreviewLabel": "Triaje de un reclamo, en un canvas",
    "diagram.stateTitle": "Una máquina de estados, con su ciclo",
    "diagram.stateBody":
      "El mismo dibujo con aristas que apuntan <strong>hacia arriba</strong>. <code>ready → idle</code> (invalidar) y <code>failed → loading</code> (reintentar) tienen su destino más arriba que su origen, y por eso no toman el camino directo: el camino directo es el corredor por donde ya bajan las aristas de ida, y una línea de vuelta dibujada ahí no se distingue de la línea por la que vuelve. Salen por el margen, suben y entran por el mismo lado, que es como se dibuja «y vuelve a empezar» desde siempre. Las dos vueltas van por márgenes distintos, y eso tampoco se pide: la de la derecha es la preferida, y la otra cede sólo porque su recorrido hasta ese margen atravesaría al vecino que no es ninguno de sus extremos. Acá ida y vuelta entre <code>loading</code> y <code>failed</code> son dos aristas porque tienen dos nombres distintos; una relación que corre en los dos sentidos y se llama de una sola manera es <code>arrow: \"both\"</code>, una línea con punta en cada punta.",
    "diagram.statePreviewLabel": "El ciclo de vida de una consulta",
    "diagram.stateLabel": "Estados de una consulta",
    "diagram.stateNode1": "Inactiva",
    "diagram.stateNode2": "Cargando",
    "diagram.stateNode3": "Lista",
    "diagram.stateNode4": "Con error",
    "diagram.stateFetch": "pedir",
    "diagram.stateResolve": "resuelve",
    "diagram.stateReject": "rechaza",
    "diagram.stateRetry": "reintentar",
    "diagram.stateInvalidate": "invalidar",

    "diagram.processTitle": "Un proceso que se abre y se vuelve a juntar",
    "diagram.processBody":
      "Ni una opción nueva, y eso es la demo. Lo que agrega al dibujo es <strong>tráfico</strong>: dos aristas salen de un mismo nodo y dos llegan a otro, así que tanto la apertura como el cierre tienen que repartir sus orígenes a lo largo del lado que comparten. Es la misma regla que usa el rombo para sus dos caras; acá corre sobre un rectángulo común, que es donde se ve más fácil. Ninguna de las cinco aristas tiene etiqueta: en un proceso, casi nunca hay algo que decir entre un paso y el siguiente.",
    "diagram.processPreviewLabel": "Despachar un pedido",
    "diagram.processLabel": "Despacho de un pedido",
    "diagram.processNode1": "Pedido recibido",
    "diagram.processNode2": "Cobrar",
    "diagram.processNode3": "Preparar el bulto",
    "diagram.processNode4": "Empaquetar",
    "diagram.processNode5": "Despachado",

    "diagram.modelTitleDiagram": "Relaciones entre cosas, no pasos en el tiempo",
    "diagram.modelBodyDiagram":
      "La otra mitad de para qué sirve un diagrama, y el único ejemplo cuyas aristas apuntan a algo más chico que un nodo. Muestra tres cosas que ninguno de arriba. La primera: un <strong>nodo puede ser un registro</strong>. El slot <code>rows</code> pone líneas con nombre bajo una raya, que es una clase con sus miembros o una tabla con sus columnas; es un slot y no una forma porque lo que importa es que esas filas <em>se pueden nombrar</em>, y una silueta no puede llevar eso.",
    "diagram.modelBodyDiagram2":
      "La segunda: una <strong>arista puede apuntar a una fila</strong>. <code>fromRow</code> y <code>toRow</code> hacen que el conector toque el costado del nodo a la altura de esa fila, así que el dibujo dice <em>qué columna</em> se une con cuál en vez de «estas dos tienen algo que ver». Esa es toda la diferencia entre un bosquejo y un esquema: acá las tres aristas son claves foráneas, cada una sale de la columna que guarda la referencia y llega a la columna referenciada, y leyendo el dibujo se puede escribir el <code>join</code>. Una arista anclada entra siempre por el costado, porque una fila tiene alto y no ancho; si los dos nodos comparten columna no hay costado que mire al otro, y entonces el ancla se descarta en vez de mentir. La tercera: <code>arrow: \"none\"</code>, porque una asociación no es una secuencia y no pasa nada «después».",
    "diagram.modelWarn":
      "Y hay que decir qué <em>no</em> es, porque es la mitad del valor de tenerlo acá: son <strong>registros y líneas de asociación, no UML</strong>. No hay triángulo hueco para la herencia, ni rombo para la composición, ni estereotipos, ni marcas de visibilidad. Un diagrama de secuencia directamente no se puede expresar: sus líneas de vida no son nodos y sus mensajes no son aristas entre nodos. Si hace falta notación UML completa, esto no es la herramienta, y agregarle esas puntas de flecha sería empezar a deberle una a cada notación que existe.",
    "diagram.modelPreviewLabel": "Claves foráneas de un pedido",
    "diagram.modelDiagramLabel": "Modelo de pedidos",

    "diagram.modelMany": "N a 1",
    "diagram.modelOne": "N a 1",

    "diagram.logicTitle": "Una regla, evaluada",
    "diagram.logicBody":
      "El espejo del if/else de más arriba, y vale la pena tenerlo al lado. Todas las decisiones de esta página se <em>abren</em>; esta se <strong>cierra</strong>: dos conectores llegan a las dos caras <em>superiores</em> del rombo, por la misma regla que manda dos afuera por las de abajo. El contrato no distingue una condición de una conclusión: lo que hace que esto se lea como lógica es que lleguen dos cosas y salga una respuesta, y esa es una forma que compuso quien lo escribió, no un modo que alguien eligió.",
    "diagram.logicPreviewLabel": "Autorizar una petición",
    "diagram.logicLabel": "Regla de autorización",
    "diagram.logicNode1": "Hay token",
    "diagram.logicNode2": "El scope alcanza",
    "diagram.logicNode3": "¿Las dos?",
    "diagram.logicNode4": "Adelante",
    "diagram.logicNode5": "403",
    "diagram.logicYes": "sí",
    "diagram.logicNo": "no",

    "diagram.gateTitle": "Compuertas lógicas",
    "diagram.gateBody":
      "Las tres formas de prosa (<code>process</code>, <code>decision</code>, <code>terminal</code>) existen porque se entienden sin leyenda. Las siete compuertas entran por la misma puerta, desde el otro lado: <code>and</code>, <code>or</code>, <code>xor</code>, <code>nand</code>, <code>nor</code>, <code>xnor</code> y <code>not</code> no son una caja que <em>significa</em> AND, son el símbolo que la norma (IEEE 91 / IEC 60617-12) le asigna a la conjunción, y quien lee la notación lo lee sin leyenda mientras que a quien no la lee no lo iba a salvar un rectángulo más redondeado.",
    "diagram.gateBody2":
      "Una compuerta <strong>no tiene adentro</strong>: el símbolo <em>es</em> el operador, así que las palabras del nodo siguen siendo obligatorias pero la hoja de estilos las recorta. Son lo que anuncia un lector de pantalla y lo que cita la lista de rutas; un texto escrito adentro de una compuerta es algo que ningún esquemático dibujó nunca. Y sus puertos los fija la notación, no la grilla: los operandos llegan al plano de atrás y el resultado sale de la punta, siempre, así que tres aristas que salen de una compuerta salen del <em>mismo</em> punto, que es como se dibuja un fan-out. Lo único que un esquemático sí escribe sobre una compuerta es su designador (<code>U1</code>, <code>G3</code>), y para eso está el slot <code>designator</code>: se dibuja <em>debajo</em> de la caja y no se mide, porque la caja es de donde sale cada puerto y un texto en el flujo correría la punta fuera del símbolo. Cuelga dentro del espacio entre rangos, y la hoja de estilos le reserva ahí una línea de texto, y otra debajo del último rango, así que no hay nada que ajustar: un dibujo sin designadores queda espaciado exactamente igual que antes.",
    "diagram.gatePreviewLabel": "Un semisumador",
    "diagram.gateLabel": "Semisumador",
    "diagram.gateSum": "Suma",
    "diagram.gateCarry": "Acarreo",
    "diagram.gateBody3":
      "Esto es lo único que los dibujos de más arriba no hacen: <strong>una señal leída dos veces</strong>. <code>A</code> y <code>B</code> alimentan las dos compuertas, así que cuatro cables salen de dos cajas y llegan a cuatro tercios distintos de dos planos de atrás, y los dos que se cruzan se cruzan porque el circuito se cruza. Todo lo de arriba en esta página es un árbol. Las aristas van con <code>arrow: \"none\"</code>, que es la notación y no un gusto: un esquemático dibuja cables, no flechas, porque la dirección ya la lleva el símbolo, que tiene atrás y punta.",
    "diagram.gateRuleTitle": "La misma regla, en la notación",
    "diagram.gateRuleBody":
      "El dibujo de arriba le pregunta a un rombo «¿las dos?» y deja salir dos respuestas. Este dice lo mismo con un AND, le agrega la cláusula que el rombo no podía sostener sin una segunda pregunta (<code>NOT revocado</code>), y deja los operandos como cajas <code>process</code> y el desenlace como <code>terminal</code>. Esa mezcla es el punto: las compuertas no son un segundo componente con marco propio, así que una regla puede ser mitad prosa y mitad notación sin que nada se convierta en otra cosa.",
    "diagram.gateRuleBody2":
      "El inversor está en su propia columna y eso sostiene el dibujo, no lo ordena. Los operandos de una compuerta llegan por atrás, así que todo cable entre compuertas tiene que ir hacia adelante: uno que vuelve dobla a mitad de camino entre sus dos puntas, y si las dos compuertas comparten columna ese punto cae adentro de las dos y el cable pasa por debajo del símbolo que alimentaba. Poner cada operador en una columna posterior a la de lo que lo alimenta es el orden en el que un esquemático se dibuja igual. Un latch de compuertas cruzadas es el dibujo que esto no hace.",
    "diagram.gateRulePreviewLabel": "Autorizar una petición, con compuertas",
    "diagram.gateRuleLabel": "Regla de autorización en compuertas",
    "diagram.gateRevoked": "Revocado",

    "diagram.infraTitle": "Un diagrama de infraestructura",
    "diagram.infraBody":
      "Necesita exactamente una cosa que los de arriba no: poder decir que algunas de estas cajas están <em>adentro</em> de algo. El slot <code>zones</code> es eso, y es la versión más chica que es honesta: una zona <strong>no acomoda nada</strong>. La grilla pone los nodos donde los pone y la zona traza un borde alrededor de donde cayeron los que la nombraron, así que acá tampoco hay una sola coordenada, y un dibujo que tu media query reacomoda se lleva sus regiones con él.",
    "diagram.infraBody2":
      "El <strong>anidamiento lo declara la zona, no el nodo</strong>. Cada nodo nombra la región más interna en la que está y se detiene; <code>within</code> dice el resto. Mover la subred privada a otra VPC es una edición, no una por instancia, y eso es todo el argumento para separar las dos cosas. El borde de afuera se dibuja más afuera que el de adentro porque la zona sabe cuántas tiene abajo: sin eso, una VPC cuyo único contenido son sus subredes sale exactamente del tamaño de ellas y los tres bordes se pisan.",
    "diagram.infraBody3":
      "Las marcas van en el slot <code>logo</code> del nodo, que acepta un <strong>árbol</strong> y no una ruta: acá son <code>ImageFrame</code> apuntando a un SVG, y podrían ser un PNG, un <code>Icon</code> del set instalado (el Visitante lo es, justamente para mostrar que la caja no distingue) o cualquier otra cosa que el catálogo sepa dibujar. Lo único que aporta el componente es esa caja, del mismo tamaño para todo el dibujo: veinte nodos con veinte imágenes dimensionadas a mano son veinte oportunidades de que una quede de otra altura, y una fila de logos que no se ponen de acuerdo se lee como una fila de cosas que no son parecidas. <code>fit: \"contain\"</code> y <code>radius: \"none\"</code> son la regla para una marca y no para una foto: un logo recortado o redondeado es un logo alterado.",
    "diagram.infraBody4":
      "<strong>Las marcas de acá son inventadas</strong>, como todas las de este sitio. Los íconos de servicios de los proveedores reales son marcas registradas con sus propios términos, y la documentación de un design system es el último lugar donde deberían andar redistribuyéndose de contrabando: lo que esta página demuestra es el <em>slot</em>, y un slot se demuestra igual de bien con una marca que no es de nadie. Para un diagrama interno, se descarga el paquete oficial del proveedor y se cambia el <code>src</code>.",
    "diagram.infraPreviewLabel": "Una aplicación en una VPC",
    "diagram.infraLabel": "Infraestructura de la aplicación",
    "diagram.infraZone1": "VPC",
    "diagram.infraZone2": "Subred pública",
    "diagram.infraZone3": "Subred privada",
    "diagram.infraNode1": "Visitante",
    "diagram.infraNode2": "CDN",
    "diagram.infraNode3": "Balanceador",
    "diagram.infraNode4": "API",
    "diagram.infraNode5": "Worker",
    "diagram.infraNode6": "Base de datos",
    "diagram.infraHttps": "https",

    "diagram.awsTitle": "Lo mismo, con nombres de servicios reales",
    "diagram.awsBody":
      "Tres niveles de región, siete cajas y seis relaciones, y ni una opción que los dibujos de arriba no hayan usado ya. Lo que agrega es <strong>profundidad</strong>: <em>AWS Cloud</em> contiene una <em>VPC</em> que contiene dos subredes, y cada borde se dibuja más afuera que el de adentro porque una zona cuenta cuántas tiene anidadas debajo.",
    "diagram.awsBody2":
      "S3 es el nodo que hace que valga la pena dibujarlo: está <strong>dentro de la nube y fuera de la VPC</strong>, que es donde vive de verdad, y lo único que le permite al dibujo decir eso es que las dos regiones son cajas separadas en vez de un atributo de anidamiento sobre el nodo. La cola usa <code>arrow: \"both\"</code> porque se le encola y se le consulta: dibujarlo como dos líneas pondría dos trazos en un corredor diciendo una sola cosa. Y las marcas son las mismas inventadas del dibujo anterior: los íconos de servicio reales son marcas registradas con sus términos, los <em>nombres</em> son el vocabulario que cualquiera buscaría y no lo son.",
    "diagram.awsPreviewLabel": "Una aplicación web en AWS",
    "diagram.awsLabel": "Arquitectura en AWS",
    "diagram.awsZone1": "AWS Cloud",
    "diagram.awsZone2": "VPC",
    "diagram.awsZone3": "Subred pública",
    "diagram.awsZone4": "Subred privada",
    "diagram.awsNode1": "Usuarios",
    "diagram.awsJobs": "trabajos",
    "diagram.awsSnapshots": "snapshots",

    "diagram.layoutTitle": "La disposición es tu grilla, no un algoritmo",
    "diagram.layoutBody":
      "Los nodos son ítems de una grilla CSS normal, y toda la API de disposición son dos números: <code>columns</code> en el marco y <code>span</code> en un nodo. Con eso salen las formas de esta página. Cualquier otra cosa es <code>grid-area</code> en tu propia hoja, contra <code>.sk-diagram__node</code>, sin nada en el medio. Esa decisión es la que mantiene chico al componente: resolver la disposición a partir de la lista de aristas es lo que convierte esto en una librería de grafos. Y como los conectores se calculan desde las cajas que <em>produjo</em> la disposición, un diagrama que tu media query reacomoda se vuelve a trazar solo. Probá cambiar el ancho del preview.",

    "diagram.shapesTitle": "Tres formas, y ninguna más",
    "diagram.shapesBody":
      "<code>process</code> es una caja, y es el default porque casi todo nodo es un paso. <code>decision</code> es un rombo, que es la única forma del dibujo técnico que se lee como «acá se bifurca» sin que nadie te la explique. <code>terminal</code> es una píldora, o sea una caja sin nada filoso: así se distingue un extremo de un paso, otra vez sin leyenda. Todas las demás (el cilindro del almacenamiento, el paralelogramo de la entrada, el hexágono de la preparación) son convenciones que hay que enseñarle a quien lee, y por eso no están. La forma no cambia el comportamiento de nada: lo que hace que un nodo sea una decisión es que salgan dos aristas de él, y eso ya lo dicen las aristas.",

    "diagram.routingTitle": "Dónde toca cada línea",
    "diagram.routingBody":
      "Un conector sale por el lado del nodo que mira hacia su destino y llega por el opuesto, siempre en ángulos rectos, con el codo <em>a mitad de camino</em> entre las dos filas: así los conectores de varios hermanos se apoyan en un mismo riel en vez de escalonarse. Cuando varias líneas comparten un lado, sus orígenes se reparten a lo largo de él, ordenados por dónde está el otro extremo, de manera que dos líneas del mismo nodo nunca se cruzan. Y el contorno por el que se reparten es el de la <strong>forma</strong>, no el de la caja: es por eso que la geometría conoce el rombo, y es lo único que la forma cambia además de la pintura.",

    "diagram.runtimeTitle": "Por qué necesita un runtime",
    "diagram.runtimeBody1":
      "Por lo mismo que Annotation: por dónde pasa un conector se sigue de dónde <em>cayeron</em> dos cajas, que se sigue de la grilla, del ancho del contenedor, de la tipografía que llegó tarde y de la traducción que salió más larga. Ninguna de esas cosas se puede escribir al componer. Así que cada binding mide y el módulo puro de <code>@skryensya/core/diagram</code> decide: el mismo reparto de tres partes que usan <code>hotkey</code> y Annotation, con la geometría en un solo lugar.",
    "diagram.runtimeBody2":
      "Se vuelve a medir cuando cambia el tamaño del marco, de la grilla o de cualquier nodo, y una vez más cuando terminan de cargar las tipografías. Las etiquetas de las aristas no se observan a propósito: se centran sobre un punto con un <code>transform</code> en sus propias unidades, así que cuánto miden no cambia nada de lo que se calcula.",

    "diagram.progressiveTitle": "Sin JavaScript",
    "diagram.progressiveBody":
      "Toda posición de una arista es una medición, así que antes de la primera pasada no hay con qué ubicarla. En vez de amontonar las etiquetas en la esquina del marco y que después salten, la hoja de estilos las deja en <strong>flujo normal</strong> hasta que el binding escribe <code>data-sk-placed</code>: sin JavaScript, con el script todavía cargando o con el script roto, se lee la lista de nodos y debajo la fila de palabras que hay sobre las relaciones. No es el dibujo, y es hasta donde un dibujo de relaciones puede degradar con honestidad: lo que se pierde es qué nodo une cada arista con cuál. La alternativa era que cada arista trajera escritos los nombres de sus dos extremos, que es el grafo escrito dos veces y, por lo tanto, el grafo contradiciéndose.",

    "diagram.a11yP1":
      "Una línea SVG no es información, así que el overlay entero es <code>aria-hidden</code>: exponerlo anunciaría «gráfico» cuatro veces sin decir nada. Lo que sí se anuncia es la <strong>lectura</strong> del dibujo. El binding escribe adentro de cada nodo una lista, visualmente oculta, con una línea por cada arista que sale de él: la etiqueta de la arista, una coma, y el nodo al que llega.",
    "diagram.a11yP2":
      "Va anidada adentro del nodo del que sale, y ahí está toda la decisión. Una lista plana debajo del dibujo tendría que decir hacia dónde apunta cada relación, y las únicas maneras de decirlo son una palabra («hacia», «luego») en un idioma que el componente no puede conocer, o una flecha tipográfica que unos lectores anuncian, otros saltean y otros leen según la configuración de puntuación de quien escucha. El anidamiento lo dice por estructura: estas son las salidas de <em>este</em> nodo. La coma es puntuación, no vocabulario: es la misma marca en los dos idiomas y todo lector hace la pausa.",
    "diagram.a11yP3":
      "El marco es un <code>group</code> con nombre, y <code>label</code> es obligatorio: un diagrama no tiene encabezado propio, así que sin nombre queda una lista de cuatro palabras sueltas en medio del texto. Los nodos son un <code>&lt;ul&gt;</code>, para que quien escucha sepa cuántos son antes de empezar. Y no hay ninguna interacción: nada tiene <code>:hover</code>, nada toma foco y nada entra en el orden de tabulación. Annotation sí necesita revelar una marca por vez, porque una etiqueta en un margen y un anillo en un overlay son dos elementos que nada en pantalla emparienta; acá la línea entre dos nodos está dibujada siempre, así que el emparejamiento <em>es</em> el dibujo.",

    "diagram.cssTitle": "Los styling hooks que vas a tocar",
    "diagram.cssBody":
      "El resto vive en la tabla de Referencia. Estos son los que cambian el carácter del dibujo: la separación entre filas, que es el tramo vertical de todos los conectores, y por lo tanto lo que decide si se lee como pasos o como una pila; el ancho máximo de un nodo, que es lo que impide que una traducción larga convierta tres columnas en seis filas; y el color del conector, que es cromo y no contenido.",

    "diagram.optionsTitle": "Las opciones",
    "diagram.optionsBody":
      "En el marco: <code>label</code> (obligatorio) y <code>columns</code>. En un nodo: <code>node</code>, <code>shape</code> y <code>span</code>. En una arista: <code>from</code>, <code>to</code> y <code>arrow</code>. Eso es todo, y la tabla de Referencia lo lista con sus valores.",

    "diagram.contractItem1":
      "<code>from</code> y <code>to</code> nombran entradas de <code>nodes</code>, y el validador lo verifica al componer: una arista que apunta a un nodo que no existe es el error de autoría que este componente realmente tiene.",
    "diagram.contractItem2":
      "Una arista que no se puede trazar (porque nombra un nodo ausente, o porque sus extremos todavía no tienen caja) queda marcada con <code>data-sk-orphan</code> y no se dibuja. El hueco se conserva en el overlay: el emparejamiento entre una arista y su dibujo es por índice, y una lista más corta le daría a cada conector la etiqueta del de al lado.",
    "diagram.contractItem3":
      "Los conectores, las puntas de flecha y las listas de lectura son <code>systemOwned</code>: los escribe el binding después de medir, y el emisor de markup deja el overlay vacío. En los nodos y en las aristas no hay nada que un autor no haya escrito.",
  },
  en: {
    "diagram.anatomyLabel": "Diagram anatomy",
    "diagram.anatomyPreviewLabel": "Diagram, part by part",
    "diagram.anatomyBody": "The nodes and the edge list are authored; the connectors, their lines and their arrowheads are drawn by the enhancer from the edges. That is why the edge list is visually hidden and the connector layer is what gets ringed.",
    "diagram.description":
      "Boxes and arrows: nodes of ordinary HTML in a grid, and edges that say only which way they run. The runtime measures and draws the routes.",
    "diagram.betaBadge": "Beta",
    "diagram.lede":
      "Annotation names the parts of <strong>one</strong> thing already drawn. Diagram says how <strong>several</strong> relate. They are the two halves of what a documentation drawing is ever for, and this is the second: a frame with two collections, <code>nodes</code> and <code>edges</code>, and nothing else. An author writes HTML boxes and <code>from</code>/<code>to</code> pairs; the runtime measures where each box landed and the routes, the elbows, the arrowheads and the label positions all follow from that. No coordinate is written by hand.",

    "diagram.whenTitle": "When to use it",
    "diagram.whenBody1":
      "When what needs explaining is a <em>relationship</em>: what happens after what, what a branch turns on, which states a thing can be in and how it gets between them. It is built for the small diagrams that turn up inside prose: a flow, an if/else, a two-level decision tree, a state machine with a cycle.",
    "diagram.whenBody2":
      "It is not <a href=\"/components/annotation\">Annotation</a>, which anchors labels to a selector inside a subject and draws no graph. It is not <a href=\"/components/process-list\">ProcessList</a> or <a href=\"/components/steps\">Steps</a>: a sequence with no branches and no cycles is a list, and drawing lines between its items does not explain it better. And it is not a graph library: no layout solver, no zoom, no dragging, no force simulation. If the graph comes from data and has to be explored, this is not the thing.",

    "diagram.modelTitle": "Two nouns, and no kind of diagram",
    "diagram.modelBody":
      "The whole API is <strong>nodes</strong> and <strong>edges</strong>. A node has a name (<code>node</code>) and HTML content; an edge has <code>from</code> and <code>to</code>, and optionally a label. There is no <code>type=\"flowchart\"</code> and no <code>type=\"state-machine\"</code>, on purpose: all four drawings on this page come out of the same two collections, and a contract offering those modes would be claiming a difference in rendering that does not exist, then owing a fifth mode to the first person whose drawing was between two of them. The only thing that changes how a node is drawn is its shape, and the only thing that makes a drawing a cycle is an edge pointing upward.",

    "diagram.flowTitle": "A linear flow",
    "diagram.flowBody":
      "The floor: one column, four nodes, three edges. The ends are <code>terminal</code> (a pill: this is where it starts and where it stops) and the middle is <code>process</code>. There is no <code>columns</code> in this example because one column is what the stylesheet already says, and writing <code>columns: 1</code> would teach a value that changes nothing. An unlabelled edge draws no chip at all: most of a linear flow has nothing to say between one step and the next.",
    "diagram.flowPreviewLabel": "Publishing a post",
    "diagram.flowLabel": "Publishing flow",
    "diagram.flowNode1": "Draft",
    "diagram.flowNode2": "Editorial review",
    "diagram.flowNode3": "Schedule",
    "diagram.flowNode4": "Published",
    "diagram.flowEdge": "approved",

    "diagram.branchTitle": "An if/else",
    "diagram.branchBody":
      "Two columns, and the trunk (the <code>terminal</code> and the <code>decision</code>) covers both with <code>span: 2</code>. That is all it takes to centre a branch over its two children: ordinary CSS Grid, not a diagram concept. Look at where the rhombus's two edges leave from: its lower <em>faces</em>, not its south vertex and not the bounding box's bottom edge. It is the same rule every other node uses (spread the origins along whatever outline faces that side), and on a rhombus that rule produces the drawing every flowchart has ever used, with nothing anywhere knowing what an if/else is. The last edge, <code>retry</code>, runs from the login back up to the question: a cycle, in a drawing nobody would call a state machine.",
    "diagram.branchPreviewLabel": "An authenticated request",
    "diagram.branchLabel": "Authentication flow",
    "diagram.branchNode1": "Request",
    "diagram.branchNode2": "Session valid?",
    "diagram.branchNode3": "Dashboard",
    "diagram.branchNode4": "Sign in",
    "diagram.branchYes": "yes",
    "diagram.branchNo": "no",
    "diagram.branchRetry": "retry",

    "diagram.treeTitle": "A decision tree",
    "diagram.treeBody":
      "The same thing, one level deeper, and not one option the example above did not already use. Four columns, one leaf per column, and each question spans the pair it governs. That is the whole of how a tree is drawn here: a node spans the branches below it. There is no <code>depth</code>, no <code>parent</code>, no nesting in the data, because a tree is not a different kind of diagram, and the moment the contract said it was, it would owe an answer to every drawing that is halfway to one. The screen picker opens on a phone, where four leaves across do not fit: the demo's own stylesheet (the <strong>CSS</strong> tab) drops every second leaf a row and flattens the two diamonds, which lets a box be wider than its column without ever meeting the one beside it. Nothing in the composition changed: the grid re-flowed, and the routes, the arrowheads and the labels were recomputed from where each box landed.",
    "diagram.treePreviewLabel": "Triaging a complaint",
    "diagram.treeLabel": "Triaging a complaint",
    "diagram.treeNode1": "Complaint",
    "diagram.treeNode2": "Paid for?",
    "diagram.treeNode3": "Shipped yet?",
    "diagram.treeNode4": "Paid how?",
    "diagram.treeLeaf1": "Carrier claim",
    "diagram.treeLeaf2": "Reship it",
    "diagram.treeLeaf3": "Check transfer",
    "diagram.treeLeaf4": "Review charge",
    "diagram.treeYes": "yes",
    "diagram.treeNo": "no",
    "diagram.treeTransfer": "transfer",
    "diagram.treeCard": "card",

    "diagram.canvasTitle": "On a canvas",
    "diagram.canvasBody":
      "The other answer to the same tree on a phone is not to re-flow it at all. Wrapped in a <code>Canvas</code>, the diagram is laid out at its desktop width (every column at its widest node, <code>--sk-diagram-canvas-inline-size</code>) and shown fitted: whole and small, and the reader zooms into the branch they care about. No stylesheet of its own, no container queries. The connectors are measured in the drawing's coordinates rather than the screen's, so zooming never re-routes anything.",
    "diagram.canvasPreviewLabel": "Triaging a complaint, on a canvas",
    "diagram.stateTitle": "A state machine, and its cycle",
    "diagram.stateBody":
      "The same drawing with edges pointing <strong>upward</strong>. <code>ready → idle</code> (invalidate) and <code>failed → loading</code> (retry) have their target above their source, so they do not take the direct route: the direct route is the corridor the forward edges are already running down, and a return line drawn through it is indistinguishable from the line it is returning along. They step out through the margin, climb, and come back in on the same side, which is how a state chart has always drawn \"and then it starts over\". The two returns take different margins, and that is not asked for either: the right-hand one is preferred, and the other yields only because its run out to that margin would pass through the neighbour that is neither of its own ends. Here the trip out and the trip back between <code>loading</code> and <code>failed</code> are two edges because they have two different names; a relationship that runs both ways under ONE name is <code>arrow: \"both\"</code>, a single line with a head at each end.",
    "diagram.statePreviewLabel": "A query's lifecycle",
    "diagram.stateLabel": "Query states",
    "diagram.stateNode1": "Idle",
    "diagram.stateNode2": "Loading",
    "diagram.stateNode3": "Ready",
    "diagram.stateNode4": "Failed",
    "diagram.stateFetch": "fetch",
    "diagram.stateResolve": "resolves",
    "diagram.stateReject": "rejects",
    "diagram.stateRetry": "retry",
    "diagram.stateInvalidate": "invalidate",

    "diagram.processTitle": "A process that splits and rejoins",
    "diagram.processBody":
      "Not one new option, and that is the demo. What it adds to the drawing is <strong>traffic</strong>: two edges leave one node and two arrive at another, so both the fan-out and the fan-in have to spread their origins along the side they share. It is the same rule the rhombus uses for its two faces; here it runs on an ordinary rectangle, which is where it is easier to see. None of the five edges carries a label: in a process there is usually nothing to say between one step and the next.",
    "diagram.processPreviewLabel": "Fulfilling an order",
    "diagram.processLabel": "Order fulfilment",
    "diagram.processNode1": "Order placed",
    "diagram.processNode2": "Charge the card",
    "diagram.processNode3": "Pick the items",
    "diagram.processNode4": "Pack",
    "diagram.processNode5": "Shipped",

    "diagram.modelTitleDiagram": "Relationships between things, not steps through time",
    "diagram.modelBodyDiagram":
      "The other half of what a diagram is for, and the only example whose edges point at something smaller than a node. It shows three things none of the ones above do. First: a <strong>node can be a record</strong>. The <code>rows</code> slot puts named lines under a rule, which is a class with its members or a table with its columns; it is a slot and not a shape because what matters is that those rows are <em>nameable</em>, and a silhouette cannot carry that.",
    "diagram.modelBodyDiagram2":
      "Second: an <strong>edge can point at a row</strong>. <code>fromRow</code> and <code>toRow</code> land the connector on the node's own side at that row's height, so the drawing says <em>which column</em> joins to which instead of \"these two are related somehow\". That is the whole difference between a sketch and a schema: all three edges here are foreign keys, each leaving the column that holds the reference and arriving at the column it references, and you can write the <code>join</code> off the picture. An anchored edge always comes in from the side, because a row has a height and no width; when two nodes share a column there is no side facing the other one, so the anchor is dropped rather than faked. Third: <code>arrow: \"none\"</code>, because an association is not a sequence and nothing happens \"next\".",
    "diagram.modelWarn":
      "And what it is <em>not</em> is half the reason it is here: these are <strong>records and association lines, not UML</strong>. There is no hollow triangle for inheritance, no diamond for composition, no stereotypes and no visibility markers. A sequence diagram is not expressible at all: its lifelines are not nodes and its messages are not edges between them. If you need full UML notation this is not the tool, and bolting those arrowheads on would start owing one to every notation there is.",
    "diagram.modelPreviewLabel": "An order's foreign keys",
    "diagram.modelDiagramLabel": "Order model",

    "diagram.modelMany": "many to 1",
    "diagram.modelOne": "many to 1",

    "diagram.logicTitle": "A rule, evaluated",
    "diagram.logicBody":
      "The mirror of the if/else above, and worth having beside it. Every decision on this page so far fans <em>out</em>; this one fans <strong>in</strong>: two connectors arrive on the rhombus's two <em>upper</em> faces, by exactly the rule that sends two out of its lower ones. The contract cannot tell a condition from a conclusion. What makes this read as logic is that two things arrive and one answer leaves, and that is a shape its author composed rather than a mode anyone selected.",
    "diagram.logicPreviewLabel": "Authorizing a request",
    "diagram.logicLabel": "Authorization rule",
    "diagram.logicNode1": "Token present",
    "diagram.logicNode2": "Scope covers it",
    "diagram.logicNode3": "Both true?",
    "diagram.logicNode4": "Allow",
    "diagram.logicNode5": "403",
    "diagram.logicYes": "yes",
    "diagram.logicNo": "no",

    "diagram.gateTitle": "Logic gates",
    "diagram.gateBody":
      "The three prose shapes (<code>process</code>, <code>decision</code>, <code>terminal</code>) exist because they read without a legend. The seven gates get in through the same door from the other side: <code>and</code>, <code>or</code>, <code>xor</code>, <code>nand</code>, <code>nor</code>, <code>xnor</code> and <code>not</code> are not a box that <em>means</em> AND, they are the symbol the standard (IEEE 91 / IEC 60617-12) assigns to conjunction, and a reader who knows the notation reads it with no legend while a reader who does not would not have been saved by a rounder rectangle.",
    "diagram.gateBody2":
      "A gate has <strong>no inside</strong>: the silhouette <em>is</em> the operator, so a node's words are still required but the stylesheet clips them. They are what a screen reader announces and what the route list quotes; a word written inside a gate is a thing no schematic has ever drawn. Its ports are the notation's rather than the grid's, too: operands arrive on the back plane and the result leaves the nose, always, so three edges leaving a gate leave from the <em>same</em> point, which is how fan-out is drawn. The one thing a schematic does write on a gate is its designator (<code>U1</code>, <code>G3</code>), which is what the <code>designator</code> slot is for: it is drawn <em>under</em> the box and never measured, because the box is what every port comes from and text in flow would take the nose off the symbol. It hangs into the rank gap as a result, and the stylesheet reserves a line of caption for it there and below the last rank, so there is nothing to tune: a drawing with no designators is spaced exactly as it was.",
    "diagram.gatePreviewLabel": "A half adder",
    "diagram.gateLabel": "Half adder",
    "diagram.gateSum": "Sum",
    "diagram.gateCarry": "Carry",
    "diagram.gateBody3":
      "This is the one thing the drawings above do not do: <strong>a signal read twice</strong>. <code>A</code> and <code>B</code> feed both gates, so four wires leave two boxes and arrive on four different thirds of two back planes, and the two that cross do so because the circuit crosses. Everything above it on this page is a tree. The edges carry <code>arrow: \"none\"</code>, which is the notation and not a preference: a schematic draws wires, not arrows, because the symbol already carries the direction - it has a back and a nose.",
    "diagram.gateRuleTitle": "The same rule, in the notation",
    "diagram.gateRuleBody":
      "The drawing above asks one rhombus \"are both true?\" and lets two answers out. This one says the same thing with an AND, adds the clause the rhombus could not hold without a second question (<code>NOT revoked</code>), and keeps the operands as ordinary <code>process</code> boxes and the outcome as a <code>terminal</code>. That mixture is the point: gates are not a second component with a frame of their own, so a rule can be half prose and half notation without anything being converted.",
    "diagram.gateRuleBody2":
      "The inverter is in a column of its own, and that holds the drawing up rather than tidying it. A gate's operands arrive on its back plane, so every wire between gates has to run forward: one that runs back turns halfway between its two ends, and when the two gates share a column that point is inside them both and the wire is drawn under the symbol it was feeding. Putting each operator in a column after the ones feeding it is the order a schematic is drawn in anyway. A cross-coupled latch is the drawing this does not do.",
    "diagram.gateRulePreviewLabel": "Authorizing a request, with gates",
    "diagram.gateRuleLabel": "Authorization rule in gates",
    "diagram.gateRevoked": "Revoked",

    "diagram.infraTitle": "An infrastructure diagram",
    "diagram.infraBody":
      "It needs exactly one thing none of the ones above do: a way to say that some of these boxes are <em>inside</em> something. The <code>zones</code> slot is that, and it is the smallest version of it that is honest: a zone <strong>lays nothing out</strong>. The grid puts the nodes where it puts them and a zone traces a boundary around wherever the ones that named it landed, so there is no coordinate here either, and a drawing your media query re-arranges takes its regions with it.",
    "diagram.infraBody2":
      "<strong>Nesting is declared by the zone, not by the node</strong>. Each node names the innermost region it is in and stops; <code>within</code> says the rest. Moving the private subnet into a different VPC is one edit rather than one per instance, and that is the whole argument for splitting the two. An outer boundary draws further out than the one inside it because a zone knows how many are nested below it: without that, a VPC whose only contents are its subnets comes out exactly their size and all three borders land on each other.",
    "diagram.infraBody3":
      "The marks go in the node's <code>logo</code> slot, which takes a <strong>tree</strong> and not a path: here they are <code>ImageFrame</code> pointing at an SVG, and they could be a PNG, an <code>Icon</code> from whichever set is installed (the Visitor is one, precisely to show the box does not care) or anything else the catalogue renders. All the component supplies is that box, one size for the whole drawing: twenty nodes with twenty hand-sized images are twenty chances for one to be a different height, and a rank of logos that do not agree reads as a rank of things that are not alike. <code>fit: \"contain\"</code> and <code>radius: \"none\"</code> together are the rule for a MARK as opposed to a photograph: a logo cropped or rounded is a logo altered.",
    "diagram.infraBody4":
      "<strong>The marks here are invented</strong>, like every other brand on this site. Real providers' service icons are trademarks with their own terms, and a design system's documentation is the last place that should be quietly redistributing someone else's: what this page demonstrates is the <em>slot</em>, and a slot is demonstrated just as well by a mark nobody owns. For an internal diagram, download the provider's official package and change the <code>src</code>.",
    "diagram.infraPreviewLabel": "An app inside a VPC",
    "diagram.infraLabel": "Application infrastructure",
    "diagram.infraZone1": "VPC",
    "diagram.infraZone2": "Public subnet",
    "diagram.infraZone3": "Private subnet",
    "diagram.infraNode1": "Visitor",
    "diagram.infraNode2": "CDN",
    "diagram.infraNode3": "Load balancer",
    "diagram.infraNode4": "API",
    "diagram.infraNode5": "Worker",
    "diagram.infraNode6": "Database",
    "diagram.infraHttps": "https",

    "diagram.awsTitle": "The same thing, with real service names",
    "diagram.awsBody":
      "Three levels of region, seven boxes and six relationships, and not one option the drawings above have not already used. What it adds is <strong>depth</strong>: <em>AWS Cloud</em> holds a <em>VPC</em> which holds two subnets, and each boundary draws further out than the one inside it because a zone counts what is nested below it.",
    "diagram.awsBody2":
      "S3 is the node that makes that worth drawing: it is <strong>inside the cloud and outside the VPC</strong>, which is where it actually lives, and the only reason the picture can say so is that the two regions are separate boxes rather than one nesting attribute on a node. The queue uses <code>arrow: \"both\"</code> because it is pushed to and polled from: drawing that as two lines would put two strokes in one corridor saying one thing. And the marks are the same invented ones the drawing above uses: real service icons are trademarks with their own terms, while the <em>names</em> are the vocabulary anyone would search for and are not.",
    "diagram.awsPreviewLabel": "A web application on AWS",
    "diagram.awsLabel": "AWS architecture",
    "diagram.awsZone1": "AWS Cloud",
    "diagram.awsZone2": "VPC",
    "diagram.awsZone3": "Public subnet",
    "diagram.awsZone4": "Private subnet",
    "diagram.awsNode1": "Users",
    "diagram.awsJobs": "jobs",
    "diagram.awsSnapshots": "snapshots",

    "diagram.layoutTitle": "The layout is your grid, not an algorithm",
    "diagram.layoutBody":
      "The nodes are items in an ordinary CSS grid, and the whole layout API is two numbers: <code>columns</code> on the frame and <code>span</code> on a node. Those cover the shapes on this page. Anything past them is <code>grid-area</code> in your own stylesheet, against <code>.sk-diagram__node</code>, with nothing in between. That decision is what keeps the component small: solving the layout from the edge list is what turns this into a graph library. And because the connectors are computed from the boxes that layout <em>produced</em>, a diagram your own media query re-arranges re-routes itself. Try changing the preview's width.",

    "diagram.shapesTitle": "Three shapes, and no more",
    "diagram.shapesBody":
      "<code>process</code> is a box, and it is the default because most nodes are just a step. <code>decision</code> is a rhombus, the one shape in technical drawing that reads as \"a branch happens here\" on sight. <code>terminal</code> is a pill, which is to say a box with nothing sharp about it: that is how a reader tells an endpoint from a step, again with no legend. Every other silhouette (the cylinder for storage, the parallelogram for input, the hexagon for preparation) is a convention the reader has to have been taught, which is why none of them is here. The shape changes no behaviour: what makes a node a decision is that two edges leave it, and the edges already say so.",

    "diagram.routingTitle": "Where each line touches",
    "diagram.routingBody":
      "A connector leaves through the side of its node that faces the destination and arrives on the opposite one, always at right angles, turning <em>halfway</em> between the two ranks: that is what makes several siblings' connectors share one rail instead of forming a staircase. When several lines share a side their origins are spread along it, ordered by where each far end sits, so two lines from one node never cross. And the outline they spread along is the <strong>shape</strong>'s, not the box's: that is why the geometry knows about the rhombus, and it is the only thing a shape changes besides paint.",

    "diagram.runtimeTitle": "Why it needs a runtime",
    "diagram.runtimeBody1":
      "For Annotation's reason: where a connector runs follows from where two boxes <em>landed</em>, which follows from the grid, the container's width, the font that arrived late and the translation that was longer. None of those is a value anyone can set at compose time. So each binding measures and the pure module in <code>@skryensya/core/diagram</code> decides: the same three-way split <code>hotkey</code> and Annotation use, with the geometry in exactly one place.",
    "diagram.runtimeBody2":
      "It re-measures when the frame, the grid or any node changes size, and once more when the webfonts land. The edge labels are deliberately not observed: each is centred on a point by a <code>transform</code> in its own units, so how wide one turns out to be changes nothing that is computed.",

    "diagram.progressiveTitle": "Without JavaScript",
    "diagram.progressiveBody":
      "Every edge's position is a measurement, so before the first pass there is nothing to position it with. Rather than pile the labels in the frame's corner and let them jump, the stylesheet keeps them in <strong>normal flow</strong> until the binding writes <code>data-sk-placed</code>: with no JavaScript, with the script still loading, or with it broken, a reader gets the nodes as a list and the words on the relationships as a row beneath them. It is not the drawing, and it is as far as a drawing of relationships can honestly degrade: what is lost is which node an edge joins to which. The alternative was for every edge to carry the names of both its ends, which is the graph written twice and therefore the graph disagreeing with itself.",

    "diagram.a11yP1":
      "An SVG line is not information, so the whole overlay is <code>aria-hidden</code>: exposing it would announce \"graphic\" four times and say nothing. What IS announced is the <strong>reading</strong> of the drawing. The binding writes a visually hidden list inside each node, one line per edge that leaves it: the edge's label, a comma, and the node it reaches.",
    "diagram.a11yP2":
      "It is nested inside the node the edge leaves, and that placement is the whole design. A flat list below the drawing would have to say which way each relationship points, and the only ways to say it are a word (\"to\", \"then\") in a language this component cannot know, or an arrow glyph that some readers announce, others skip and others read according to the listener's punctuation settings. Nesting says it structurally: these are the ways out of <em>this</em> node. The comma is punctuation rather than vocabulary: it is the same mark in both languages, and every reader pauses on it.",
    "diagram.a11yP3":
      "The frame is a named <code>group</code>, and <code>label</code> is required: a diagram has no heading of its own, so an unnamed one is a list of four loose words in the middle of the prose. The nodes are a <code>&lt;ul&gt;</code>, so a listener knows how many there are before they start. And there is no interaction at all: nothing has a <code>:hover</code> state, nothing takes focus, nothing enters the tab order. Annotation does have to reveal one mark at a time, because a label in a gutter and a ring in an overlay are two elements nothing on screen relates; here the line between two nodes is drawn permanently, so the pairing <em>is</em> the drawing.",

    "diagram.cssTitle": "The styling hooks you will reach for",
    "diagram.cssBody":
      "The rest are in the Reference table. These are the ones that change the character of the drawing: the row gap, which is the vertical run of every connector and therefore what decides whether it reads as steps or as a stack; a node's maximum measure, which is what keeps a long translation from turning three columns into six rows; and the connector colour, which is chrome and not content.",

    "diagram.optionsTitle": "The options",
    "diagram.optionsBody":
      "On the frame: <code>label</code> (required) and <code>columns</code>. On a node: <code>node</code>, <code>shape</code> and <code>span</code>. On an edge: <code>from</code>, <code>to</code> and <code>arrow</code>. That is all of them, and the Reference table lists them with their values.",

    "diagram.contractItem1":
      "<code>from</code> and <code>to</code> name entries of <code>nodes</code>, and the validator checks it at compose time: an edge pointing at a node that does not exist is the authoring mistake this component really has.",
    "diagram.contractItem2":
      "An edge that cannot be routed (it names a missing node, or its ends have no box yet) is marked <code>data-sk-orphan</code> and is not drawn. The gap is kept in the overlay: the pairing between an edge and its drawing is by index, and a shorter list would hand every connector the label above it.",
    "diagram.contractItem3":
      "The connectors, the arrowheads and the reading lists are <code>systemOwned</code>: the binding writes them after measuring, and the markup emitter leaves the overlay empty. Nothing in the nodes or the edges is anything an author did not write.",
  },
} as const;
