export const imageFrameMessages = {
  es: {
    "demo.imageFrame.alt": "Paisaje de demostración",
    "demo.imageFrame.aspectLabel": "Proporciones de ImageFrame",
    "demo.imageFrame.fitLabel": "Modos de object-fit",
    "demo.imageFrame.positionLabel": "Anclas de recorte",

    "imageFrame.description": "ImageFrame: marco que recorta y posiciona media con aspect-ratio, object-fit y object-position.",
    "imageFrame.lede":
      'ImageFrame es el <strong>marco de media</strong>: una caja que fija un aspect ratio, recorta con radio/borde y decide cómo llena la imagen (<code>object-fit</code>) y desde dónde (<code>object-position</code>). No es un componente de imagen con CDN ni un Avatar: es el pattern que Card, Tile y galerías reutilizan en vez de copiar <code>aspect-ratio</code> a mano. Para tipo sobre la foto, compón con <a href="/gradients">Gradientes</a> (<code>sk-media-gradient</code>).',
    "imageFrame.aspectTitle": "Aspect",
    "imageFrame.aspectBody":
      "<code>data-aspect</code> es la caja, no el archivo. Con <code>cover</code> (por defecto) la media rellena y se recorta; con <code>auto</code> el marco sigue la medida intrínseca del media.",
    "imageFrame.fitTitle": "Fit",
    "imageFrame.fitBody":
      "Misma caja <code>1/1</code>, distinto <code>data-fit</code>: <code>cover</code> recorta, <code>contain</code> letterboxa (se ve el fondo del marco), <code>fill</code> estira.",
    "imageFrame.positionTitle": "Position",
    "imageFrame.positionBody":
      "Con <code>cover</code>, <code>data-position</code> elige el ancla del recorte. El demo concentra un disco arriba-izquierda y un bloque abajo-derecha para que el ancla se note.",
    "imageFrame.reactBody":
      '<code>src</code> / <code>alt</code> pintan un <code>img</code> con la clase media. Para <code>picture</code> o <code>video</code>, pasa hijos con <code>className="sk-image-frame__media"</code> (o deja el <code>img</code>/<code>video</code> como hijo directo: el CSS también los alcanza).',
    "imageFrame.contractItem1":
      "Raíz: <code>sk-image-frame</code>. Media: <code>sk-image-frame__media</code>, o <code>img</code>/<code>video</code>/<code>picture &gt; img</code> hijo directo.",
    "imageFrame.contractItem2":
      "<code>data-aspect</code>: <code>auto</code>, <code>1/1</code>, <code>4/3</code>, <code>3/2</code>, <code>16/9</code>, <code>3/4</code>, <code>2/3</code>, <code>9/16</code>.",
    "imageFrame.contractItem3":
      "<code>data-fit</code>: <code>cover</code> (default), <code>contain</code>, <code>fill</code>, <code>none</code>, <code>scale-down</code>.",
    "imageFrame.contractItem4":
      "<code>data-position</code>: <code>center</code> (default), <code>top</code>, <code>bottom</code>, <code>left</code>, <code>right</code>, y las cuatro esquinas (<code>top-left</code>, …).",
    "imageFrame.contractItem5":
      "<code>data-radius</code>: <code>none</code>, <code>top</code>, <code>control</code>, <code>surface</code>, <code>pill</code> (default).",
    "imageFrame.contractItem6": "<code>data-border</code>: <code>none</code> (default), <code>subtle</code>, <code>default</code>.",
    "imageFrame.contractItem7":
      "Hooks: <code>--sk-image-frame-aspect</code>, <code>--sk-image-frame-fit</code>, <code>--sk-image-frame-position</code>, <code>--sk-image-frame-radius</code>, <code>--sk-image-frame-border-*</code>, <code>--sk-image-frame-bg</code>.",
    "imageFrame.test1": "Traduce las props de geometría a atributos <code>data-*</code> en la raíz autorada.",
    "imageFrame.test2": "Renderiza un <code>img</code> desde <code>src</code>/<code>alt</code> cuando no se pasan hijos.",
    "imageFrame.test3": "Mantiene un caption junto al medio de <code>src</code>.",
  },
  en: {
    "demo.imageFrame.alt": "Demonstration landscape",
    "demo.imageFrame.aspectLabel": "ImageFrame aspect ratios",
    "demo.imageFrame.fitLabel": "object-fit modes",
    "demo.imageFrame.positionLabel": "Crop anchors",

    "imageFrame.description": "ImageFrame: a frame that crops and positions media with aspect-ratio, object-fit and object-position.",
    "imageFrame.lede":
      'ImageFrame is the <strong>media frame</strong>: a box that fixes an aspect ratio, crops with a radius/border, and decides how the image fills it (<code>object-fit</code>) and from where (<code>object-position</code>). It is not a CDN image component or an Avatar: it is the pattern Card, Tile, and galleries reuse instead of copying <code>aspect-ratio</code> by hand. For type over the photo, compose with <a href="/en/gradients">Gradients</a> (<code>sk-media-gradient</code>).',
    "imageFrame.aspectTitle": "Aspect",
    "imageFrame.aspectBody":
      "<code>data-aspect</code> is the box, not the file. With <code>cover</code> (the default) the media fills and gets cropped; with <code>auto</code> the frame follows the media's own intrinsic size.",
    "imageFrame.fitTitle": "Fit",
    "imageFrame.fitBody":
      "Same <code>1/1</code> box, different <code>data-fit</code>: <code>cover</code> crops, <code>contain</code> letterboxes (the frame's own background shows), <code>fill</code> stretches.",
    "imageFrame.positionTitle": "Position",
    "imageFrame.positionBody":
      "With <code>cover</code>, <code>data-position</code> picks the crop's anchor. The demo puts a disc in the top-left and a block in the bottom-right so the anchor stands out.",
    "imageFrame.reactBody":
      '<code>src</code> / <code>alt</code> paint an <code>img</code> with the media class. For <code>picture</code> or <code>video</code>, pass children with <code>className="sk-image-frame__media"</code> (or leave the <code>img</code>/<code>video</code> as a direct child: the CSS reaches those too).',
    "imageFrame.contractItem1":
      "Root: <code>sk-image-frame</code>. Media: <code>sk-image-frame__media</code>, or a direct-child <code>img</code>/<code>video</code>/<code>picture &gt; img</code>.",
    "imageFrame.contractItem2":
      "<code>data-aspect</code>: <code>auto</code>, <code>1/1</code>, <code>4/3</code>, <code>3/2</code>, <code>16/9</code>, <code>3/4</code>, <code>2/3</code>, <code>9/16</code>.",
    "imageFrame.contractItem3":
      "<code>data-fit</code>: <code>cover</code> (default), <code>contain</code>, <code>fill</code>, <code>none</code>, <code>scale-down</code>.",
    "imageFrame.contractItem4":
      "<code>data-position</code>: <code>center</code> (default), <code>top</code>, <code>bottom</code>, <code>left</code>, <code>right</code>, and the four corners (<code>top-left</code>, …).",
    "imageFrame.contractItem5":
      "<code>data-radius</code>: <code>none</code>, <code>top</code>, <code>control</code>, <code>surface</code>, <code>pill</code> (default).",
    "imageFrame.contractItem6": "<code>data-border</code>: <code>none</code> (default), <code>subtle</code>, <code>default</code>.",
    "imageFrame.contractItem7":
      "Hooks: <code>--sk-image-frame-aspect</code>, <code>--sk-image-frame-fit</code>, <code>--sk-image-frame-position</code>, <code>--sk-image-frame-radius</code>, <code>--sk-image-frame-border-*</code>, <code>--sk-image-frame-bg</code>.",
    "imageFrame.test1": "Maps geometry props to data attributes on the authored root.",
    "imageFrame.test2": "Renders a media img from src/alt when children are omitted.",
    "imageFrame.test3": "Keeps a caption beside the src media.",
  },
} as const;
