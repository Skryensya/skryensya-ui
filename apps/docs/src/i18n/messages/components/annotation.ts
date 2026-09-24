export const annotationMessages = {
  es: {
    "annotation.description":
      "Un marco que numera las partes de lo que tiene adentro: cada número va en un margen con una línea guía hasta su parte, los nombres en una leyenda debajo, y el dibujo entero sobre un canvas con zoom.",
    "annotation.betaBadge": "Beta",
    "annotation.lede":
      "Un diagrama de composición tiene un solo trabajo: señalar un pedazo de algo que ya está dibujado y decir cómo se llama. La solución de siempre es una etiqueta en <code>position: absolute</code> encima de la pieza, que tapa justo lo que nombra, o una leyenda numerada abajo sin nada dibujado entre el número y la parte, que obliga a buscar cada número sobre la muestra. Aquí el sujeto ocupa el centro de una grilla y los <strong>números</strong> los márgenes: el solape no se evita, no se puede representar. Cada número tiene su guía, que termina en un anillo que <em>rodea</em> la parte entera con el radio que esa parte ya tiene (la misma forma que dibuja <code>:focus-visible</code>), o en un bracket a lo largo de ella si la parte es un área. Los nombres van en una leyenda debajo, y leer una entrada enciende su número, su guía y su parte a la vez.",

    "annotation.whenTitle": "Cuándo usarlo",
    "annotation.whenBody1":
      "Cuando hay que mostrar la anatomía de algo: las partes de un componente, las piezas de una composición, los pasos de un armado. El sujeto va centrado y el marco no mira adentro, sólo mide: puede ser cualquier árbol del catálogo. Cada entrada apunta con un selector CSS resuelto <em>dentro</em> del sujeto (<code>.sk-tile__trigger</code>), y gana la primera coincidencia.",
    "annotation.whenBody2":
      "No es <a href=\"/componentes/tooltip\">Tooltip</a>: eso es chrome flotante que aparece al pasar el puntero y se va; esto está siempre dibujado. Tampoco es el <code>hint</code> de <a href=\"/componentes/form-field\">FormField</a>, que además queda enlazado por <code>aria-describedby</code> a un control real. Y no dibuja grafos: ancla etiquetas a partes de una sola cosa, no cajas y flechas entre nodos.",

    "annotation.anatomyTitle": "El ejemplo: la anatomía de un Accordion",
    "annotation.anatomyBody":
      "Un Accordion entero, con las dos secciones que hacen falta para ver todas sus partes (una abierta, para que exista <code>sk-tile__expandable-content</code>, y una cerrada, para ver el otro estado del chevron). Las <strong>áreas</strong> (el acordeón, la sección, su trigger y su panel) llevan un bracket en el margen derecho, anidados hacia afuera: un contenedor siempre queda por fuera de lo que contiene. Las <strong>cosas</strong> (el título, la descripción, el chevron) llevan anillo, desde el margen más cercano. Es el mismo diagrama que muestra la página de Accordion.",
    "annotation.anatomyNote":
      "Falta una parte a propósito: <code>sk-accordion__trigger-heading</code> es <code>display: contents</code> (lleva el <code>role=\"heading\"</code> sin meter una caja entre la sección y su botón), y algo sin caja no tiene dónde recibir una guía. El contrato lo resuelve solo, <code>isPointable</code> deja el número y descarta la guía, pero un número que apunta a la nada en la demo que enseña el componente se lee como un error y no como una regla.",
    "annotation.anatomyLabel": "Anatomía de Accordion",
    "annotation.anatomyPreviewLabel": "Accordion, parte por parte",
    "annotation.anatomyHint": "Abrí y cerrá las secciones: las anotaciones siguen al Accordion.",
    "annotation.demoQuestion1": "¿Cuánto tarda el envío?",
    "annotation.demoDescription1": "Despachos y plazos",
    "annotation.demoAnswer1": "Entre tres y cinco días hábiles.",
    "annotation.demoQuestion2": "¿Puedo devolver una compra?",
    "annotation.demoDescription2": "Cambios y devoluciones",
    "annotation.demoAnswer2": "Sí, dentro de los treinta días.",

    "annotation.sidesTitle": "Los cuatro márgenes",
    "annotation.ringPlacementTitle": "Adentro o afuera del borde, y cuánto",
    "annotation.ringPlacementBody":
      "<code>ringPlacement</code> elige de qué lado del borde de la parte va su anillo, <code>ringDistance</code> cuántos píxeles y <code>ringRadius</code> cuánto redondea la esquina. Ese redondeo no se escribe casi nunca: por defecto cada anillo toma el <code>border-radius</code> de la parte que envuelve, y queda concéntrico con ella, porque lo que el anillo dice es que es el contorno de eso que tiene adentro y ningún navegador dibujó nunca ese contorno cuadrado alrededor de una píldora. Escribirlo, en el marco o en una etiqueta, impone una sola esquina para todas las marcas que tiene abajo: es lo que quiere un diagrama cuyas partes tienen formas distintas y cuyas marcas no deberían. <code>inset</code> (el default) no deja dudas de a qué elemento pertenece la marca: dibujado por fuera, en una composición apretada, un anillo se pisa con el del vecino, que es exactamente lo que pasaba entre <code>sk-tile__title</code> y <code>sk-tile__chevron</code> en el Accordion de arriba. <code>offset</code> es para el caso contrario, y el Stat de aquí abajo es justo ese: sus partes son líneas de texto sueltas, así que un anillo por dentro cae sobre las letras y se lee como una caja rayada sobre la palabra en vez de una marca alrededor. Se pone en el <strong>marco</strong>, y una etiqueta suelta puede pisarlo. Lo segundo empezó como un no: un diagrama cuyas marcas apuntan de dos maneras le pide a quien lee que aprenda dos convenciones para un solo dibujo. Eso vale cuando las partes se parecen entre sí, y se cae cuando no: el Accordion de arriba nombra una tarjeta entera, un botón y una sola línea de descripción, y el anillo por dentro que está perfecto en los dos primeros le pasa por encima a las letras del tercero. Por eso las dos etiquetas que nombran texto suelto en ese diagrama, <code>sk-tile__title</code> y <code>sk-tile__description</code>, son las únicas con <code>ringPlacement: \"offset\"</code> propio.",
    "annotation.sidesBody":
      "<code>side</code> es lógico, como todo el resto del sistema: <code>inline-start</code>, <code>inline-end</code>, <code>block-start</code> y <code>block-end</code>, así que los dos primeros se dan vuelta solos en RTL. Es un <strong>pedido</strong>, no una garantía: la hoja coloca el número y el binding lee dónde cayó, y lo escribe de vuelta en <code>data-sk-side</code>.",
    "annotation.sidesLabel": "Anatomía de Stat",
    "annotation.keyMeaning":
      "el bloque del que son las partes",
    "annotation.keyTitle": "La leyenda",
    "annotation.keyBody":
      "El slot <code>key</code> deja una línea abajo a la izquierda sobre el dibujo entero, no sobre una parte: de qué es la muestra, o qué significa una convención que el dibujo usa. Los números van a los puntos medios de los cuatro bordes, así que las esquinas quedan libres por construcción: la línea no puede chocar con ninguno, tenga el diagrama los números que tenga. El demo de arriba la usa.",
    "annotation.legendTitle":
      "Números en el margen, nombres abajo",
    "annotation.legendBody":
      "Es la única forma que tiene el componente, y cada mitad resuelve un problema distinto. Los nombres de parte en los márgenes le cobraban su ancho al sujeto: diez nombres podían dejarle un tercio del marco, y en un teléfono los márgenes tenían que colapsar en racimos cuyas guías cruzaban la muestra entera. Un número ocupa una burbuja, así que los márgenes caben en cualquier pantalla y el dibujo nunca cambia de forma. Lo que la leyenda numerada de siempre hace mal, obligar a buscar cada número sobre la muestra, acá no pasa: la guía y la marca siguen dibujadas, y al pasar el puntero o enfocar una entrada se encienden juntos su número, su guía y su parte. El número es un contador de CSS, no texto: es la posición de la entrada, y una copia escrita a mano podría no coincidir.",
    "annotation.canvasTitle":
      "Sobre un canvas",
    "annotation.canvasBody":
      "El marco vive dentro de un <code>Canvas</code>: se diseña a su propio ancho y se muestra ajustado, así que en un teléfono se ve el mismo dibujo, más chico, en vez de uno reacomodado. Para acercarse a una parte: los botones de la esquina, <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + rueda o el pellizco del trackpad, dos dedos en pantalla táctil, o <kbd>+</kbd>/<kbd>-</kbd>/<kbd>0</kbd> con el visor enfocado. Nunca le quita el scroll a la página: un dedo y la rueda sola siguen siendo de la página. La leyenda queda afuera del canvas, sin escalar. Los textos del canvas son <code>zoomInLabel</code>, <code>zoomOutLabel</code>, <code>fitLabel</code> y los slots <code>touchHint</code> y <code>wheelHint</code>.",
    "annotation.zoomInLabel": "Acercar",
    "annotation.zoomOutLabel": "Alejar",
    "annotation.fitLabel": "Ajustar a la vista",
    "annotation.touchHint": "Usa dos dedos para mover el diagrama",
    "annotation.wheelHint": "Usa Ctrl + scroll para hacer zoom",
    "annotation.sidesPreviewLabel":
      "Un número por margen",
    "annotation.statLabel": "Ingresos",
    "annotation.statChange": "12%",

    "annotation.pluralTitle": "Un nombre para varias cosas",
    "annotation.pluralBody":
      "Casi todos los nombres de un diagrama son singulares: una raíz, un trigger, un panel. Los de un componente que <em>se repite</em> no. <code>sk-breadcrumb__item</code> no es la primera miga, son <strong>todas</strong> las que siguen visibles, y un dibujo que le pone anillo a la de más a la izquierda y deja el resto pelado dice algo falso sobre la parte. Con <code>match: \"all\"</code> la entrada nombra cada coincidencia de su selector: cada miga lleva su propia burbuja con su propia guía, y todas muestran el <strong>mismo número</strong>. El número es lo que dice que son un solo nombre; la leyenda tiene una sola entrada para ellas, y al leerla se encienden todas juntas. El trail angosto también deja sus ancestros intermedios detrás de <code>sk-breadcrumb__collapse-trigger</code>: ese control es singular y se nombra aparte. <code>sk-breadcrumb__current</code> queda singular a propósito: un trail tiene exactamente una página actual. El mismo dibujo enseña las dos clases de nombre.",
    "annotation.pluralLabel": "Anatomía de Breadcrumb",
    "annotation.pluralPreviewLabel": "Migas visibles y niveles colapsados",
    "annotation.crumbNav": "Ruta",
    "annotation.crumbCollapsed": "Mostrar niveles ocultos",
    "annotation.crumb1": "Inicio",
    "annotation.crumb2": "Catálogo",
    "annotation.crumb3": "Pantalones",
    "annotation.crumb4": "Chinos",
    "annotation.crumb5": "Chino azul",
    "annotation.elbowTitle": "La línea guía, y por qué nunca dobla dos veces",
    "annotation.elbowBody":
      "Sólo hay tres direcciones posibles: recto sobre el eje, recto atravesándolo, y 45 grados. Con eso alcanza <strong>uno o dos tramos, siempre</strong>: si la distancia a lo largo alcanza para cubrir la del cruce, es un tramo recto y una diagonal; si no, es la diagonal primero y el resto recto. La demostración está en el comentario de <code>leaderPoints</code>. Aquí las cuatro piezas están una al lado de la otra, así que los cuatro números quieren el mismo milímetro del margen: el reparto los abre en abanico y cada guía tiene que doblar para volver. Es la única manera de <em>ver</em> el codo.",
    "annotation.elbowLabel": "Una fila de Badges",
    "annotation.elbowPreviewLabel": "Cuatro guías que tienen que doblar",
    "annotation.chip1": "Nuevo",
    "annotation.chip2": "Listo",
    "annotation.chip3": "En pausa",
    "annotation.chip4": "Vencido",

    "annotation.runtimeTitle": "Por qué tiene runtime",
    "annotation.runtimeBody1":
      "Dónde va una etiqueta no es un valor que se pueda escribir al componer: sale de dónde <em>cayó</em> su parte, que sale del layout del sujeto, que cambia cuando se redimensiona el contenedor, cuando el sujeto reflowea o cuando llega una tipografía. Es la misma línea que separa a todo contrato con máquina de los patrones puramente CSS de al lado: un hecho de runtime, no uno escrito a mano.",
    "annotation.runtimeBody2":
      "Así que cada binding mide y <code>@skryensya/core/annotation</code> decide. El enhancer de Vanilla y el componente de React observan el marco, el sujeto y cada número con un <code>ResizeObserver</code>, y vuelven a pasar una vez más cuando <code>document.fonts.ready</code> resuelve. Escriben un <code>translate</code> por número, el <code>d</code> de cada guía y el rectángulo de cada anillo. Ninguno escribe colocación: eso es de la hoja, y por eso un consumidor puede mover los números con su propio media query sin tocar una línea de JavaScript.",

    "annotation.optionsTitle": "Opciones",
    "annotation.optionsBody":
      "Del marco: <code>label</code> (nombra el diagrama y lo convierte en un <code>group</code>), <code>inert</code> (activado por defecto: el sujeto es una muestra, no toma puntero, ni foco, ni teclado), <code>ringPlacement</code>, <code>ringDistance</code> y <code>ringRadius</code>, y los textos del canvas. De cada entrada: <code>for</code>, el selector que resuelve adentro del sujeto; <code>side</code>, el margen que pide; <code>mark</code>, <code>ring</code> para una cosa o <code>bracket</code> para un área; y <code>match</code>. Un selector inválido le cuesta su guía a esa entrada y a ninguna otra.",

    "annotation.cssTitle": "Hooks de estilo",
    "annotation.cssBody":
      "El número y la leyenda heredan la familia tipográfica a propósito, porque un nombre no siempre es una clase. En esta página sí, así que las demos piden la familia monoespaciada con el hook, declarado en <code>.sk-annotated-figure</code> para que llegue a la leyenda. El acento se gasta en la anotación que se está leyendo y en nada más: en reposo todo es un gris suave, un pelo de trazo con alfa (<code>--sk-annotation-ring-color-rest</code>, <code>--sk-annotation-ring-width</code>) para que el aparato quede por encima de la muestra sin pisarla; al pasar el puntero por un número o por una entrada de la leyenda (o enfocarla) aparecen su anillo, su guía y su burbuja, en acento, juntos. Y el sujeto va en <code>grayscale</code> (<code>--sk-annotated-subject-filter</code>), para que en un diagrama el color signifique una sola cosa: anotación. Si el diagrama es <em>sobre</em> el color (una paleta, los tonos de un Callout), se pone en <code>none</code>. <code>--sk-annotated-gap</code> es el <code>gap</code> de la grilla: como las tres columnas son <code>auto</code> y van centradas como grupo, es la distancia entre cada número y lo que nombra.",
    "annotation.ringTitle": "El anillo es un anillo de foco",
    "annotation.ringBody":
      "La guía no termina en un punto: termina <strong>rodeando la parte entera</strong>, con un rectángulo redondeado dibujado justo por fuera de su caja y con el radio que esa parte ya tiene. Es exactamente lo que dibuja <code>:focus-visible</code>, y eso es el argumento: quien lee ya sabe que esa forma significa \"esta\". Antes fueron dos formas y las dos estaban mal. Un punto lleno sobre el borde tapa justo lo que se está pidiendo mirar, y nombra un <em>punto</em> cuando lo que se nombra es un elemento. Un círculo hueco arregla lo de tapar y no lo de apuntar: adentro del borde quedaba atravesando la palabra \"Revenue\" en un Stat, y afuera, en una fila de chips a 8px, la marca del tercero caía sobre el cuarto. En los dos casos hay que adivinar a qué elemento pertenece un círculo chico por lo cerca que quedó, que es justo la pregunta que el diagrama viene a contestar. Un contorno no tiene esa ambigüedad: lo marcado es lo que está adentro.",

    "annotation.a11yP1":
      "El marco es un <code>&lt;div&gt;</code> pelado salvo que le pases <code>label</code>: ahí toma <code>role=\"group\"</code> con ese nombre. Un grupo sin nombre es un nivel más de anidación que un lector de pantalla anuncia y que nadie pidió.",
    "annotation.revealTitle": "Una marca por vez",
    "annotation.revealBody":
      "En reposo no hay anillos: sólo las guías, en gris, dicen adónde apunta cada número. Pasa el puntero por un número, por su entrada en la leyenda o por la parte que nombra (o llega con Tab: las entradas de la leyenda son enfocables justo por esto) y aparece su anillo, en acento, junto con su guía. Siete anillos a la vez sobre un Accordion son una jaula encima del sujeto, y además contestan algo que nadie preguntó: \"¿de qué parte habla este nombre?\" es una pregunta sobre <em>un</em> nombre. El emparejamiento lo hace el binding, no la hoja: el número, la entrada y la marca viven en subárboles distintos, así que ningún selector llega de uno al otro, ni siquiera <code>:has()</code>, que sólo selecciona ancestros.",
    "annotation.a11yP2":
      "<code>inert</code> saca al sujeto del árbol de accesibilidad entero, y eso es deliberado: la alternativa (<code>pointer-events: none</code> más <code>tabindex=\"-1\"</code>) deja a quien navega con lector de pantalla recorriendo un acordeón completo que no responde, que es peor que no encontrarlo. Por eso el contrato exige <code>label</code> cuando <code>inert</code> está puesto: con la muestra afuera, el nombre del grupo es lo único que queda para decir de qué son las partes. Las guías y las burbujas son <code>aria-hidden</code>: un \"3\" suelto no dice nada en voz alta. Lo que se lee y se enfoca es la leyenda, una lista ordenada con una entrada enfocable (<code>tabindex=\"0\"</code>) por parte, y eso es el precio de mostrar una marca por vez: un anillo que sólo aparece con el puntero es información que quien navega con teclado no alcanza. El visor del canvas también es enfocable, para el zoom con teclado.",

    "annotation.contractItem1":
      "En HTML: una figura <code>&lt;div class=\"sk-annotated-figure\" data-sk-annotated&gt;</code> con un canvas adentro (<code>.sk-canvas</code> &gt; visor &gt; contenido &gt; <code>.sk-annotated</code>), y en el marco un <code>.sk-annotated__subject</code>, un <code>&lt;span class=\"sk-annotation\" data-for data-side aria-hidden&gt;</code> vacío por parte y un <code>&lt;svg class=\"sk-annotated__leaders\"&gt;</code> vacío; debajo del canvas, un <code>&lt;ol class=\"sk-annotated__legend\"&gt;</code> con los nombres en el mismo orden. El enhancer lo monta solo, y se monta <strong>último</strong> de toda la tabla: un marco que mide antes de que el sujeto se enhancee dibuja contra cajas que están por cambiar.",
    "annotation.contractItem2":
      "En React: <code>&lt;Annotated subject={…} annotations={[…]} /&gt;</code>. Las entradas son datos, no hijos, y eso es parte del contrato: como hijos se podrían poner en cualquier lado, incluido encima del sujeto, que es lo único que esto existe para hacer imposible.",
    "annotation.contractItem3":
      "La hoja es <code>components/annotation.css</code>. Toda la geometría (los tramos, el reparto en el margen, el lado resuelto) vive en <code>@skryensya/core/annotation</code> y la comparten las dos bindings: son funciones puras sobre rectángulos, sin DOM, y es donde están los tests que importan.",

    "annotation.test1": "Los cuatro márgenes se nombran lógicamente, así que se dan vuelta solos en RTL.",
    "annotation.test2": "Sólo reconoce esos cuatro: un nombre físico no es algo que se autore.",
    "annotation.test3": "Una guía a la misma altura que su parte es un solo tramo recto.",
    "annotation.test4": "Con lugar de sobra, va recta y después dobla 45 grados.",
    "annotation.test5": "Cuando los dos ejes coinciden, colapsa a una sola diagonal pura.",
    "annotation.test6": "Cuando el eje del cruce es más largo, toma la diagonal primero y termina recto.",
    "annotation.test7": "Nunca necesita más de dos tramos, en ninguna dirección ni sobre ningún eje.",
    "annotation.test8": "La misma regla, espejada sobre el eje de bloque.",
    "annotation.test9": "Una guía sin largo no se dibuja.",
    "annotation.test10": "Escribe datos de path que un navegador puede volver a leer.",
    "annotation.test11": "Lee el margen de las cajas medidas, no del pedido escrito a mano.",
    "annotation.test12": "Da vuelta los dos márgenes inline en un marco de derecha a izquierda.",
    "annotation.test13": "Si la etiqueta solapa al sujeto en los dos ejes, manda el pedido.",
    "annotation.test14": "Deja cada etiqueta donde pidió cuando no choca con ninguna.",
    "annotation.test15": "Separa lo que se solaparía, y sólo lo que haga falta.",
    "annotation.test16": "Respeta el orden de los targets, no el de autoría: dos guías nunca se cruzan.",
    "annotation.test17": "Vuelve a meter adentro una tanda que se pasó del extremo lejano.",
    "annotation.test18": "Si las etiquetas simplemente no entran, las empaqueta desde el principio.",
    "annotation.test19": "Sube la etiqueta a la altura de su parte y dibuja un solo tramo recto.",
    "annotation.test20": "Una etiqueta sin target queda en flujo y no dibuja guía.",
    "annotation.test21": "Una etiqueta sin target queda fuera del reparto: no empuja a las que sí apuntan.",
    "annotation.test22": "Reparte dos etiquetas cuyos targets casi coinciden.",
    "annotation.test23": "Dobla una vez cuando la etiqueta no pudo llegar a la altura de su parte.",
    "annotation.test24": "En el margen de bloque sale hacia abajo y se desliza de costado.",
    "annotation.test25": "Un marco de derecha a izquierda lee sus márgenes al revés.",
    "annotation.test26": "Redondea todas las coordenadas: dos bindings del mismo ancho escriben la misma cadena.",

    "annotation.test27": "Sube cada etiqueta a la altura de la parte que nombra.",
    "annotation.test28": "Dibuja un path y un punto por etiqueta, en el orden de las etiquetas.",
    "annotation.test29": "Escribe de vuelta en qué margen cayó realmente la etiqueta.",
    "annotation.test30": "Un selector roto le cuesta su guía a esa etiqueta y a ninguna otra.",
    "annotation.test31": "Busca el target sólo adentro del sujeto, nunca en el resto de la página.",
    "annotation.test32": "Vuelve a medir cuando el marco cambia de tamaño, y sigue a la parte que se movió.",
    "annotation.test33": "Reconstruye la caja en flujo desde el offset que escribió: una segunda pasada no acumula.",
    "annotation.test34": "Una pasada que decide lo mismo dos veces no escribe nada.",
    "annotation.test35": "Observa el marco, la muestra y cada etiqueta.",
    "annotation.test36": "Deja de medir cuando se limpia.",
    "annotation.test37": "Un marco al que le falta una parte no hace nada, en vez de tirar un error.",
    "annotation.test38": "Se monta una sola vez por raíz escrita a mano.",

    "annotation.test39": "Renderiza la muestra, una etiqueta por entrada y un overlay donde dibujar.",
    "annotation.test40": "Sin <code>label</code> deja el marco sin nombre en vez de agregar un grupo anónimo.",
    "annotation.test41": "Por defecto congela la muestra, y nunca las etiquetas con ella.",
    "annotation.test86": "La muestra es una muestra: <code>inert</code>, y nada adentro queda como parada de Tab.",
    "annotation.test87": "Si se niega <code>inert</code>, la muestra sigue viva.",
    "annotation.test42": "Sube cada etiqueta a la altura de la parte que nombra.",
    "annotation.test43": "Dibuja el mismo path que el enhancer, como los mismos dos elementos planos.",
    "annotation.test44": "Escribe de vuelta en qué margen cayó realmente la etiqueta.",
    "annotation.test45": "Un selector roto le cuesta su guía a esa etiqueta y a ninguna otra.",
    "annotation.test46": "Se estabiliza en vez de girar en falso: una pasada que no decide nada nuevo no re-renderiza.",
    "annotation.test47": "Reconstruye la caja en flujo desde el offset que pintó: una segunda pasada no acumula.",
    "annotation.test48": "Deja de medir cuando se desmonta.",
    "annotation.test49": "Un target sin caja (un <code>display: contents</code>) cuenta como no tener target.",
    "annotation.test50": "Una caja finita sigue siendo señalable: la regla es no tener área, no no tener grosor.",
    "annotation.test51": "Sobrevive a una segunda pasada que corre antes de que la primera haya commiteado.",
    "annotation.test52": "Si la etiqueta está en una esquina, donde las dos lecturas son ciertas, gana el pedido.",
    "annotation.test53": "Igual reclasifica a una etiqueta que quedó lejos del lado que había pedido.",
    "annotation.test54": "La guía frena antes del anillo en vez de meterse adentro.",
    "annotation.test55": "Come más allá del codo cuando el último tramo es más corto que el recorte.",
    "annotation.test56": "No dibuja línea cuando el recorte es más largo que toda la guía: el anillo solo alcanza.",
    "annotation.test57": "Nombra los dos lados del borde de una parte, y sólo esos dos.",
    "annotation.test58": "Convierte un lado y una distancia en un solo inset con signo.",
    "annotation.test59": "Una distancia negativa se lee como magnitud, nunca como un anillo dado vuelta.",
    "annotation.test60": "Cae en la distancia por defecto si el número no es un número.",
    "annotation.test61": "Con <code>offset</code> dibuja el anillo por fuera de la parte.",
    "annotation.test62": "La distancia se puede elegir, para cualquiera de los dos lados.",
    "annotation.test63": "Nunca da vuelta una parte demasiado fina para meterle el anillo adentro; hacia afuera no hay límite.",
    "annotation.test64": "Cada anillo toma la esquina de la parte que envuelve.",
    "annotation.test88": "Dibujado por fuera, esa esquina se abre en vez de cerrarse: el anillo queda concéntrico con la parte.",
    "annotation.test89": "Una parte que no reporta esquina cae en un radio compartido, así una caja medida a secas igual se dibuja.",
    "annotation.test65": "Recorta el radio en una parte demasiado chica para sostenerlo.",
    "annotation.test66": "La guía llega hasta el borde del anillo, y se le puede pedir que quede despegada.",
    "annotation.test72": "Una etiqueta suelta puede pisar el lado del anillo que eligió el marco.",
    "annotation.test73": "El marco puede imponer un solo radio para todos los anillos, y una etiqueta suelta puede pisarlo.",
    "annotation.test90": "El anillo toma la esquina de la parte que envuelve, y el marco la puede pisar.",
    "annotation.test74": "Con <code>match: \"all\"</code> nombra cada coincidencia, una guía por cada una desde la misma etiqueta.",
    "annotation.test75": "Se pone a la altura del centro de todo lo que nombra, no del primero.",
    "annotation.test76": "Descarta las coincidencias sin caja y se queda con el resto.",
    "annotation.test77": "Por defecto sigue tomando sólo la primera coincidencia.",
    "annotation.test78": "Abre las guías de una etiqueta a lo largo de su borde, en vez de arrancarlas todas del mismo punto.",
    "annotation.test79": "Reparte esos orígenes en el orden de los targets, así las guías de una etiqueta nunca se cruzan.",
    "annotation.test80": "Un nombre singular sigue saliendo del medio de su borde.",
    "annotation.test81": "Ignora las coincidencias que caen en una copia de medición oculta a accesibilidad.",
    "annotation.test82": "Igual nombra un target que es <code>aria-hidden</code> en sí: un separador decorativo sigue siendo una parte.",
    "annotation.test83": "Dibuja la guía de un target que aparece solo después de la primera medición.",
    "annotation.test84": "Recupera una parte que sólo consigue su caja después de la primera pasada.",
    "annotation.test85": "Observa el marco, la muestra, cada etiqueta y cada parte que nombra.",
    "annotation.test67": "Dibuja una marca por etiqueta: una guía y un anillo, en el orden de las etiquetas.",
    "annotation.test68": "Mantiene una marca por etiqueta aunque una no apunte a nada: el emparejamiento es por índice.",
    "annotation.test69": "Muestra una marca por vez, emparejada con la etiqueta que se está leyendo.",
    "annotation.test70": "También aparece con el foco, así las marcas se alcanzan sin puntero.",
    "annotation.test71": "Dibuja las mismas marcas que el enhancer, con la misma forma.",
  },
  en: {
    "annotation.description":
      "A frame that numbers the parts of whatever is inside it: each number sits in a margin with a leader line to its part, the names in a legend below, and the whole drawing on a zoomable canvas.",
    "annotation.betaBadge": "Beta",
    "annotation.lede":
      "A composition diagram has one job: point at a piece of something already drawn and say what it is. The usual answer is a label in <code>position: absolute</code> over the specimen, which covers the very thing it names, or a numbered legend underneath with nothing drawn between number and part, which sends the reader hunting for each number on the specimen. Here the subject sits in the centre of a grid and the <strong>numbers</strong> hold the margins: overlap is not avoided, it is unrepresentable. Each number has its leader, ending in a ring that <em>outlines</em> the whole part with that part's own corner radius (the same shape <code>:focus-visible</code> draws), or in a bracket along it when the part is an area. The names live in a legend below, and reading an entry lights its number, its leader and its part together.",

    "annotation.whenTitle": "When to use it",
    "annotation.whenBody1":
      "When the anatomy is the point: the parts of a component, the pieces of a composition, the steps of an assembly. The subject is centred and the frame never looks inside it, it only measures, so it can be any tree in the catalogue. Each entry points with a CSS selector resolved <em>inside</em> the subject (<code>.sk-tile__trigger</code>), and the first match wins.",
    "annotation.whenBody2":
      "It is not <a href=\"/components/tooltip\">Tooltip</a>: that is floating chrome that appears on hover and leaves; this is always drawn. Nor is it <a href=\"/components/form-field\">FormField</a>'s <code>hint</code>, which is also tied by <code>aria-describedby</code> to a real control. And it draws no graphs: it anchors labels to parts of one thing, not boxes and arrows between nodes.",

    "annotation.anatomyTitle": "The example: an Accordion's anatomy",
    "annotation.anatomyBody":
      "A whole Accordion, with the two sections it takes to show every part it has (one open, so <code>sk-tile__expandable-content</code> exists at all, and one closed, for the chevron's other state). The <strong>areas</strong> (the accordion, the section, its trigger and its panel) get brackets in the right margin, nested outward: a container always sits outside what it contains. The <strong>things</strong> (the title, the description, the chevron) get rings, from the nearest margin. It is the same diagram the Accordion page shows.",
    "annotation.anatomyNote":
      "One part is missing on purpose: <code>sk-accordion__trigger-heading</code> is <code>display: contents</code> (it carries <code>role=\"heading\"</code> without inserting a box between a section and its button), and something with no box has nowhere to take a leader. The contract handles it by itself, <code>isPointable</code> keeps the number and drops the leader, but a number pointing at nothing in the very demo that teaches the component reads as a bug rather than as a rule.",
    "annotation.anatomyLabel": "Accordion anatomy",
    "annotation.anatomyPreviewLabel": "Accordion, part by part",
    "annotation.anatomyHint": "Open and close sections: the annotations follow the Accordion.",
    "annotation.demoQuestion1": "How long does shipping take?",
    "annotation.demoDescription1": "Dispatch and delivery times",
    "annotation.demoAnswer1": "Between three and five business days.",
    "annotation.demoQuestion2": "Can I return a purchase?",
    "annotation.demoDescription2": "Exchanges and returns",
    "annotation.demoAnswer2": "Yes, within thirty days.",

    "annotation.sidesTitle": "The four margins",
    "annotation.ringPlacementTitle": "Inside or outside the edge, and by how much",
    "annotation.ringPlacementBody":
      "<code>ringPlacement</code> picks which side of a part's edge its ring sits on, <code>ringDistance</code> how many pixels and <code>ringRadius</code> how rounded the corner is. That last one is hardly ever written: by default every ring takes the <code>border-radius</code> of the part it wraps and stays concentric with it, because what a ring claims is that it is the outline of the thing inside it, and no browser has ever drawn that outline square around a pill. Writing it, on the frame or on one label, imposes a single corner on every mark underneath: which is what a diagram wants when its parts are different shapes and its marks should not be. <code>inset</code> (the default) leaves no doubt which element a mark belongs to: drawn outside, in a dense composition, a ring meets its neighbour's, which is exactly what happened between <code>sk-tile__title</code> and <code>sk-tile__chevron</code> in the Accordion above. <code>offset</code> is for the opposite case, and the Stat below is precisely it: its parts are single lines of text, so an inset ring lands on the glyphs and reads as a box ruled over the word rather than a mark around it. It is set on the <strong>frame</strong>, and a single label can override it. The second half started as a no: a diagram whose marks point two different ways asks the reader to learn two conventions for one drawing. That holds while the parts are alike, and breaks when they are not: the Accordion above names a whole card, a button and one line of description, and the inset ring that is exactly right on the first two runs across the glyphs of the third. Which is why the two labels naming loose text in that diagram, <code>sk-tile__title</code> and <code>sk-tile__description</code>, are the only ones carrying their own <code>ringPlacement: \"offset\"</code>.",
    "annotation.sidesBody":
      "<code>side</code> is logical, like everything else in the system: <code>inline-start</code>, <code>inline-end</code>, <code>block-start</code> and <code>block-end</code>, so the first two swap themselves in RTL. It is a <strong>request</strong>, not a guarantee: the stylesheet places the number and the binding reads back where it landed, into <code>data-sk-side</code>.",
    "annotation.sidesLabel": "Stat anatomy",
    "annotation.keyMeaning":
      "the block these are parts of",
    "annotation.keyTitle": "The key",
    "annotation.keyBody":
      "The <code>key</code> slot leaves one line in the bottom-left about the whole drawing rather than about a part: what the specimen is, or what a convention the drawing uses stands for. Numbers go to the midpoints of the four edges, so the corners are free by construction: the line cannot collide with one, however many numbers a diagram has. The demo above uses it.",
    "annotation.legendTitle":
      "Numbers in the margin, names below",
    "annotation.legendBody":
      "It is the only form the component has, and each half fixes a different problem. Part names in the margins charged the subject its width: ten names could leave it a third of the frame, and on a phone the margins had to collapse into clusters whose leaders crossed the whole specimen. A number is one bubble wide, so the margins fit any screen and the drawing never changes shape. What the usual numbered legend gets wrong, sending the reader hunting for each number on the specimen, does not happen here: the leader and the mark are still drawn, and hovering or focusing an entry lights its number, its leader and its part together. The number is a CSS counter, not text: it is the entry's position, and a hand-typed copy could disagree with it.",
    "annotation.canvasTitle":
      "On a canvas",
    "annotation.canvasBody":
      "The frame lives inside a <code>Canvas</code>: laid out at its own width and shown fitted, so a phone sees the same drawing, smaller, instead of a rearranged one. To get close to a part: the buttons in the corner, <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + wheel or a trackpad pinch, two fingers on a touch screen, or <kbd>+</kbd>/<kbd>-</kbd>/<kbd>0</kbd> with the viewport focused. It never takes the page's scroll: one finger and a plain wheel still belong to the page. The legend stays outside the canvas, unscaled. The canvas's copy is <code>zoomInLabel</code>, <code>zoomOutLabel</code>, <code>fitLabel</code> and the <code>touchHint</code> and <code>wheelHint</code> slots.",
    "annotation.zoomInLabel": "Zoom in",
    "annotation.zoomOutLabel": "Zoom out",
    "annotation.fitLabel": "Fit to view",
    "annotation.touchHint": "Use two fingers to move the diagram",
    "annotation.wheelHint": "Use Ctrl + scroll to zoom",
    "annotation.sidesPreviewLabel":
      "One number per margin",
    "annotation.statLabel": "Revenue",
    "annotation.statChange": "12%",

    "annotation.pluralTitle": "One name for several things",
    "annotation.pluralBody":
      "Almost every name in a diagram is singular: one root, one trigger, one panel. The names of a component that <em>repeats</em> are not. <code>sk-breadcrumb__item</code> is not the first crumb, it is <strong>all</strong> of the ones that remain visible, and a drawing that rings the leftmost and leaves the rest bare says something false about the part. With <code>match: \"all\"</code> an entry names every match of its selector: each crumb gets its own bubble with its own leader, and they all show the <strong>same number</strong>. The number is what says they are one name; the legend has one entry for them, and reading it lights them all together. The narrow trail also puts its middle ancestors behind <code>sk-breadcrumb__collapse-trigger</code>: that control is singular and gets its own entry. <code>sk-breadcrumb__current</code> stays singular on purpose: a trail has exactly one current page. The same drawing shows both kinds of name.",
    "annotation.pluralLabel": "Breadcrumb anatomy",
    "annotation.pluralPreviewLabel": "Visible crumbs and collapsed levels",
    "annotation.crumbNav": "Trail",
    "annotation.crumbCollapsed": "Show hidden levels",
    "annotation.crumb1": "Home",
    "annotation.crumb2": "Catalogue",
    "annotation.crumb3": "Trousers",
    "annotation.crumb4": "Chinos",
    "annotation.crumb5": "Blue chino",
    "annotation.elbowTitle": "The leader, and why it never turns twice",
    "annotation.elbowBody":
      "There are only three possible headings: straight along the axis, straight across it, and 45 degrees. That is enough for <strong>one or two segments, always</strong>: if the distance along covers the distance across, it is one straight run and a diagonal; if not, the diagonal goes first and the rest is straight. The proof is in <code>leaderPoints</code>'s own comment. Here the four pieces sit side by side, so all four numbers want the same millimetre of the margin: the distribution fans them out and every leader has to turn to get back. It is the only way to <em>see</em> the knee.",
    "annotation.elbowLabel": "A row of Badges",
    "annotation.elbowPreviewLabel": "Four leaders that have to turn",
    "annotation.chip1": "New",
    "annotation.chip2": "Done",
    "annotation.chip3": "On hold",
    "annotation.chip4": "Overdue",

    "annotation.runtimeTitle": "Why it has a runtime",
    "annotation.runtimeBody1":
      "Where a label goes is not a value anyone can set at compose time: it follows from where its part <em>landed</em>, which follows from the subject's own layout, which changes when the container is resized, when the subject reflows, when a webfont arrives. That is the same line separating every contract with a machine from the CSS-only patterns beside it: a runtime fact, not an authored one.",
    "annotation.runtimeBody2":
      "So each binding measures and <code>@skryensya/core/annotation</code> decides. The Vanilla enhancer and the React component both watch the frame, the subject and every number with a <code>ResizeObserver</code>, and run one more pass when <code>document.fonts.ready</code> resolves. They write a <code>translate</code> per number, each leader's <code>d</code> and each ring's rectangle. Neither writes placement: that is the stylesheet's, which is what lets a consumer move the numbers with their own media query without a line of JavaScript.",

    "annotation.optionsTitle": "Options",
    "annotation.optionsBody":
      "On the frame: <code>label</code> (names the diagram and makes it a <code>group</code>), <code>inert</code> (on by default: the subject is a specimen, no pointer, no focus, no keyboard), <code>ringPlacement</code>, <code>ringDistance</code> and <code>ringRadius</code>, and the canvas's copy. On each entry: <code>for</code>, the selector resolved inside the subject; <code>side</code>, the margin it asks for; <code>mark</code>, <code>ring</code> for a thing or <code>bracket</code> for an area; and <code>match</code>. An invalid selector costs that entry its leader and no other.",

    "annotation.cssTitle": "Styling hooks",
    "annotation.cssBody":
      "The number and the legend inherit their type family on purpose, because a name is not always a class. On this page it is, so the demos ask for the code family through the hook, declared on <code>.sk-annotated-figure</code> so it reaches the legend. The accent is spent on the annotation being read and nowhere else: at rest everything is a soft grey, a hairline with alpha in it (<code>--sk-annotation-ring-color-rest</code>, <code>--sk-annotation-ring-width</code>) so the apparatus sits over the specimen without sitting on it; hovering a number or a legend entry (or focusing the entry) brings up its ring, its leader and its bubble, in accent, together. And the specimen is rendered in <code>grayscale</code> (<code>--sk-annotated-subject-filter</code>), so that colour in a diagram means exactly one thing: annotation. A diagram that is <em>about</em> colour (a palette, a Callout's tones) sets it to <code>none</code>. <code>--sk-annotated-gap</code> is the grid's own <code>gap</code>: with all three columns <code>auto</code> and centred as a group, it is the distance between each number and what it names.",
    "annotation.ringTitle": "The ring is a focus ring",
    "annotation.ringBody":
      "A leader does not end in a point: it ends by <strong>outlining the whole part</strong>, a rounded rectangle drawn just outside that element's box with the element's own corner radius. It is exactly what <code>:focus-visible</code> draws, and that is the argument: the reader already knows the shape means \"this one\". Two earlier shapes were built and both were wrong. A filled dot on the edge covers the very thing the reader was asked to look at, and it names a <em>point</em> when the thing being named is an element. A hollow circle fixes the covering and not the aim: inside the edge it struck through the middle of the word \"Revenue\" on a Stat, and outside, on a row of chips 8px apart, the mark for the third landed on the fourth. Both times you have to infer which element a small circle belongs to from how close it happens to be, which is precisely the question the diagram exists to answer. An outline has no such ambiguity: the marked thing is whatever is inside it.",

    "annotation.a11yP1":
      "The frame is a bare <code>&lt;div&gt;</code> unless you pass <code>label</code>, and then it takes <code>role=\"group\"</code> with that name. An unnamed group is one more level of nesting a screen reader announces and nobody asked for.",
    "annotation.revealTitle": "One mark at a time",
    "annotation.revealBody":
      "At rest there are no rings: only the leaders, in grey, say where each number points. Hover a number, its legend entry or the part it names (or Tab to it: the legend entries are focusable for exactly this reason) and its ring appears, in accent, along with its leader. Seven rings at once on an Accordion is a cage laid over the specimen, and it answers a question nobody asked: \"which part is this name about?\" is a question about <em>one</em> name. The pairing is the binding's job, not the stylesheet's: the number, the entry and the mark live in different subtrees, so no selector reaches from one to the other, not even <code>:has()</code>, which only ever selects an ancestor.",
    "annotation.a11yP2":
      "<code>inert</code> takes the whole subject out of the accessibility tree, and that is deliberate: the alternative (<code>pointer-events: none</code> plus <code>tabindex=\"-1\"</code>) walks a screen-reader user through a complete accordion that refuses to respond, which is worse than not meeting it at all. That is why the contract requires <code>label</code> whenever <code>inert</code> is set: with the specimen out, the group's name is the only thing left to say what the parts are parts of. The leaders and the bubbles are <code>aria-hidden</code>: a bare \"3\" says nothing out loud. What is read and focused is the legend, an ordered list with one focusable entry (<code>tabindex=\"0\"</code>) per part, and that is the price of showing one mark at a time: a ring that only appears under the pointer is information a keyboard reader cannot reach. The canvas viewport is focusable too, for keyboard zoom.",

    "annotation.contractItem1":
      "In HTML: a figure <code>&lt;div class=\"sk-annotated-figure\" data-sk-annotated&gt;</code> holding a canvas (<code>.sk-canvas</code> &gt; viewport &gt; content &gt; <code>.sk-annotated</code>), and in the frame a <code>.sk-annotated__subject</code>, one empty <code>&lt;span class=\"sk-annotation\" data-for data-side aria-hidden&gt;</code> per part and an empty <code>&lt;svg class=\"sk-annotated__leaders\"&gt;</code>; under the canvas, an <code>&lt;ol class=\"sk-annotated__legend\"&gt;</code> with the names in the same order. The enhancer mounts it by itself, and it mounts <strong>last</strong> of the whole table: a frame that measures before its subject is enhanced draws against boxes that are about to change.",
    "annotation.contractItem2":
      "In React: <code>&lt;Annotated subject={…} annotations={[…]} /&gt;</code>. The entries are data, not children, and that is part of the contract: as children they could be put anywhere, including over the subject, which is the one thing this exists to make impossible.",
    "annotation.contractItem3":
      "The stylesheet is <code>components/annotation.css</code>. All the geometry (the segments, the distribution along a margin, the resolved side) lives in <code>@skryensya/core/annotation</code> and both bindings share it: pure functions over rectangles, no DOM, and where the tests that matter are.",

    "annotation.test1": "Names the four margins logically, so they swap themselves in RTL.",
    "annotation.test2": "Recognises only those four: a physical name is not something anyone authors.",
    "annotation.test3": "A leader level with its part is one straight segment.",
    "annotation.test4": "With room to spare it runs straight and then turns 45 degrees.",
    "annotation.test5": "When the two axes match it collapses to a single pure diagonal.",
    "annotation.test6": "When the cross axis is longer it takes the diagonal first and finishes straight.",
    "annotation.test7": "Never needs more than two segments, in either direction, on either axis.",
    "annotation.test8": "The same rule, mirrored on the block axis.",
    "annotation.test9": "A leader with no length is not drawn.",
    "annotation.test10": "Writes path data a browser can read back.",
    "annotation.test11": "Reads the margin off the measured boxes, not off the authored request.",
    "annotation.test12": "Swaps the two inline margins in a right-to-left frame.",
    "annotation.test13": "Keeps the request when the label overlaps the subject on both axes.",
    "annotation.test14": "Leaves every label exactly where it asked when nothing collides.",
    "annotation.test15": "Pushes apart what would overlap, and only by what it takes.",
    "annotation.test16": "Keeps the targets' own order, not the authoring order: no two leaders cross.",
    "annotation.test17": "Pulls a run that overflowed the far end back inside.",
    "annotation.test18": "Packs from the start when the labels simply do not fit.",
    "annotation.test19": "Lifts a label level with its target and draws one straight segment.",
    "annotation.test20": "A label with no target stays in flow and draws no leader.",
    "annotation.test21": "A targetless label stays out of the distribution: it never pushes one that points somewhere.",
    "annotation.test22": "Distributes two labels whose targets nearly coincide.",
    "annotation.test23": "Turns once when the label could not reach its target's level.",
    "annotation.test24": "In a block margin it leaves downward and slides sideways.",
    "annotation.test25": "A right-to-left frame reads its margins the other way round.",
    "annotation.test26": "Rounds every coordinate, so two bindings of the same width write the same string.",

    "annotation.test27": "Lifts each label level with the part it names.",
    "annotation.test28": "Draws one path and one dot per label, in the labels' own order.",
    "annotation.test29": "Writes back which margin the label actually landed in.",
    "annotation.test30": "Costs one bad selector its own leader and nothing else.",
    "annotation.test31": "Finds a target only inside the subject, never elsewhere on the page.",
    "annotation.test32": "Re-measures when the frame resizes, and follows the part that moved.",
    "annotation.test33": "Reconstructs the flow box from the offset it wrote, so a second pass does not compound.",
    "annotation.test34": "Writes nothing at all when a pass decides the same thing twice.",
    "annotation.test35": "Watches the frame, the specimen and every label.",
    "annotation.test36": "Stops measuring once cleaned up.",
    "annotation.test37": "Does nothing, rather than throwing, on a frame that lost a part.",
    "annotation.test38": "Mounts once per authored root.",

    "annotation.test39": "Renders the specimen, one label each, and an overlay to draw into.",
    "annotation.test40": "Leaves the frame unnamed rather than adding an anonymous group.",
    "annotation.test41": "Makes the specimen inert by default, and never the labels with it.",
    "annotation.test86": "The specimen is a specimen: <code>inert</code>, and nothing inside it is a tab stop.",
    "annotation.test87": "Leaves the specimen live when <code>inert</code> is refused.",
    "annotation.test42": "Lifts each label level with the part it names.",
    "annotation.test43": "Draws the same path the enhancer draws, as the same two flat elements.",
    "annotation.test44": "Writes back which margin the label actually landed in.",
    "annotation.test45": "Costs one bad selector its own leader and nothing else.",
    "annotation.test46": "Settles instead of spinning: a pass that decides nothing new renders nothing new.",
    "annotation.test47": "Reconstructs the flow box from the offset it painted, so a second pass does not compound.",
    "annotation.test48": "Stops measuring once unmounted.",
    "annotation.test49": "A target with no box (a <code>display: contents</code> part) counts as no target.",
    "annotation.test50": "A hairline target stays pointable: the rule is no area, not no thickness.",
    "annotation.test51": "Survives a second pass that runs before the first one has committed.",
    "annotation.test52": "A label in a corner, where both readings are true, keeps the side it asked for.",
    "annotation.test53": "Still reclassifies a label that ended up nowhere near the side it asked for.",
    "annotation.test54": "The leader stops short of the ring rather than running into it.",
    "annotation.test55": "Eats past a knee when the last segment is too short to absorb the trim.",
    "annotation.test56": "Draws no line when the trim is longer than the whole leader: the ring alone will do.",
    "annotation.test57": "Names the two sides of a part's edge, and only those two.",
    "annotation.test58": "Turns a placement and a distance into one signed inset.",
    "annotation.test59": "Reads a negative distance as a magnitude, never as an inverted ring.",
    "annotation.test60": "Falls back to the default distance on a number that is not one.",
    "annotation.test61": "With <code>offset</code> it draws the ring outside the part.",
    "annotation.test62": "The distance can be chosen, in either direction.",
    "annotation.test63": "Never inverts a part too thin to inset, and has no such limit going outward.",
    "annotation.test64": "A ring takes the corner of the part it wraps.",
    "annotation.test88": "Drawn outside, that corner opens up instead of closing: the ring stays concentric with the part.",
    "annotation.test89": "A part that reports no corner falls back to one shared radius, so a bare measured box still draws.",
    "annotation.test65": "Clamps the radius on a part too small to hold it.",
    "annotation.test66": "The leader meets the ring's edge, and can be asked to stand off it instead.",
    "annotation.test72": "A single label can override the ring placement the frame chose.",
    "annotation.test73": "The frame can impose one radius on every ring, and a single label can override it.",
    "annotation.test90": "The ring takes the corner of the part it wraps, and the frame can override it.",
    "annotation.test74": "With <code>match: \"all\"</code> it names every match, one leader each from the same label.",
    "annotation.test75": "It sits level with the middle of everything it names, not with the first of them.",
    "annotation.test76": "Drops the matches that have no box, and keeps the rest.",
    "annotation.test77": "Still takes only the first match by default.",
    "annotation.test78": "Spreads a label's leaders along its edge instead of starting them all at one point.",
    "annotation.test79": "Hands those origins out in the targets' own order, so a label's leaders never cross.",
    "annotation.test80": "A singular name still leaves from the middle of its edge.",
    "annotation.test81": "Ignores matches that fall inside an accessibility-hidden measurement copy.",
    "annotation.test82": "Still names a target that is itself <code>aria-hidden</code>: a decorative separator is a part.",
    "annotation.test83": "Draws a leader for a target that only appears after the first measurement.",
    "annotation.test84": "Recovers a part that only gets its box after the first pass.",
    "annotation.test85": "Watches the frame, the specimen, every label and every part it names.",
    "annotation.test67": "Draws one mark per label: a leader and a ring, in the labels' own order.",
    "annotation.test68": "Keeps one mark per label even when one points at nothing: the pairing is by index.",
    "annotation.test69": "Reveals one mark at a time, paired with the label being read.",
    "annotation.test70": "Reveals on focus too, so the marks are reachable without a pointer.",
    "annotation.test71": "Draws the same marks the enhancer draws, in the same shape.",
  },
} as const;
