export const avatarMessages = {
  es: {
    "demo.avatar.label": "Avatares de ejemplo",
    "demo.avatar.imageLabel": "Avatares con foto",
    "demo.avatar.sizesLabel": "Tamaños de avatar",
    "demo.avatar.colorsLabel": "Avatares de colores",
    "demo.avatar.colorPersonName": "Avatar {letter}",
    "demo.avatar.groupLabel": "Avatares apilados",
    "demo.avatar.profileRole": "Matemática, Máquina Analítica",
    "demo.avatar.personOne": "Persona 1",
    "demo.avatar.personTwo": "Persona 2",
    "demo.avatar.personThree": "Persona 3",

    "avatar.description": "Avatar: ImageFrame o iniciales, AvatarGroup con colapso +N y componente React.",
    "avatar.betaBadge": "Beta",
    "avatar.lede":
      'Avatar es el token visual de una persona o entidad: una foto recortada con <strong>ImageFrame</strong> (1/1, cover, pill) o, sin imagen, las dos primeras letras del nombre. <strong>AvatarGroup</strong> apila un conjunto y colapsa el excedente en un contador «+N».',
    "avatar.body":
      'Con imagen, el avatar anida <code>sk-image-frame</code> y el <code>&lt;img alt&gt;</code> aporta la semántica. Sin ella, el contenedor toma <code>role="img"</code> y las iniciales quedan decorativas. En React, <code>avatarInitials(name)</code> deriva el fallback cuando no pasas hijos: dos palabras → primera letra de cada una; una sola → los dos primeros caracteres.',
    "avatar.imagesTitle": "Con imagen",
    "avatar.imagesBody":
      'Con <code>src</code>, el avatar recorta la foto dentro de <strong>ImageFrame</strong> (1/1, cover, pill); el <code>&lt;img alt&gt;</code> aporta la semántica.',
    "avatar.sizesTitle": "Tamaños",
    "avatar.sizesBody":
      'Cuatro tamaños. <code>sm</code> / <code>md</code> / <code>lg</code> van sobre la escala de controles, la misma que usa Button; <code>xl</code> (64px) queda fuera de esa rampa a propósito, porque es el retrato de una ficha de perfil y no un control. Se mide como <code>calc(var(--size-control-lg) * 4 / 3)</code>, así que la densidad lo sigue alcanzando igual que a los otros tres.',
    "avatar.colorsTitle": "Colores",
    "avatar.colorsBody":
      'El fondo y la tinta son hooks de estilo (<code>--sk-avatar-bg</code> / <code>--sk-avatar-fg</code>): tintar un avatar por persona es lo más común que hace una app con ellos. Dieciséis identidades, cuatro por cada tamaño, cada una de un color distinto de la paleta base, con el mismo anillo que usa <strong>AvatarGroup</strong> para separar sus discos.',
    "avatar.groupTitle": "Avatares apilados",
    "avatar.groupBody":
      '<strong>AvatarGroup</strong> superpone un conjunto y colapsa el excedente en un contador «+N».',
    "avatar.groupMaxBody":
      'En React no hace falta contarlos a mano: <code>max</code> recorta los avatares visibles y colapsa el resto en el contador. El árbol de arriba escribe el excedente a mano porque el contrato lo expone como un slot (<code>overflow</code>), y eso es justamente lo que deja componer el mismo grupo sin JavaScript; <code>max</code> es el atajo que React construye encima.',
    "avatar.groupMaxNote": "cuatro hijos y max={3}: se ven tres, el cuarto se convierte en «+1»",
    "avatar.profileTitle": "En composición",
    "avatar.profileBody":
      'Todo lo de arriba son especímenes: discos en fila, que es como se compara una escala o dieciséis tintes, y no como se escribe una interfaz. Esta es la pieza real, la misma que publica el ejemplo <code>hero-with-testimonial</code>: un <strong>Inline</strong> con el avatar al lado de un <strong>Stack</strong> de dos <strong>Text</strong>, nombre sobre rol. Van en dos <code>Text</code> separados y no en una sola cadena con coma, porque un lector de pantalla los anuncia como dos datos distintos, en el mismo orden en que los toma la vista. A <code>md</code>, esta misma pieza es el encabezado de un comentario o una fila de lista: la forma no cambia con el tamaño.',
    "avatar.test1": "Sin imagen, deriva las iniciales del nombre (dos palabras → una letra de cada una).",
    "avatar.test2": "Con un solo nombre, usa sus dos primeros caracteres.",
    "avatar.test3": "Con <code>src</code>, la imagen se renderiza dentro de ImageFrame.",
    "avatar.test4": "AvatarGroup limita los avatares visibles y colapsa el resto en un contador «+N».",
    "avatar.test5":
      'El tamaño <code>xl</code> se serializa en <code>data-size</code> sobre el disco, tanto con iniciales como con foto.',
    "avatar.test6": "Con <code>label</code>, AvatarGroup se anuncia como un grupo con nombre.",
    "avatar.test7":
      "Sin <code>label</code> sigue siendo un grupo: cada avatar ya anuncia su propio nombre.",
  },
  en: {
    "demo.avatar.label": "Example avatars",
    "demo.avatar.imageLabel": "Photo avatars",
    "demo.avatar.sizesLabel": "Avatar sizes",
    "demo.avatar.colorsLabel": "Colored avatars",
    "demo.avatar.colorPersonName": "Avatar {letter}",
    "demo.avatar.groupLabel": "Stacked avatars",
    "demo.avatar.profileRole": "Mathematician, Analytical Engine",
    "demo.avatar.personOne": "Person 1",
    "demo.avatar.personTwo": "Person 2",
    "demo.avatar.personThree": "Person 3",

    "avatar.description": "Avatar: ImageFrame or initials, AvatarGroup with +N collapse, and a React component.",
    "avatar.betaBadge": "Beta",
    "avatar.lede":
      'Avatar is the visual token for a person or entity: a cropped photo with <strong>ImageFrame</strong> (1/1, cover, pill), or, with no image, the first two letters of the name. <strong>AvatarGroup</strong> stacks a set and collapses the overflow into a "+N" counter.',
    "avatar.body":
      'With an image, the avatar nests <code>sk-image-frame</code> and the <code>&lt;img alt&gt;</code> carries the semantics. Without one, the container takes <code>role="img"</code> and the initials stay decorative. In React, <code>avatarInitials(name)</code> derives the fallback when you pass no children: two words → first letter of each; a single word → its first two characters.',
    "avatar.imagesTitle": "With an image",
    "avatar.imagesBody":
      'With <code>src</code>, the avatar crops the photo inside <strong>ImageFrame</strong> (1/1, cover, pill); the <code>&lt;img alt&gt;</code> carries the semantics.',
    "avatar.sizesTitle": "Sizes",
    "avatar.sizesBody":
      'Four sizes. <code>sm</code> / <code>md</code> / <code>lg</code> ride the control scale, the same one Button uses; <code>xl</code> (64px) sits off that ramp on purpose, because it is a profile card\'s portrait rather than a control. It measures as <code>calc(var(--size-control-lg) * 4 / 3)</code>, so density still reaches it the way it reaches the other three.',
    "avatar.colorsTitle": "Colors",
    "avatar.colorsBody":
      'Background and ink are styling hooks (<code>--sk-avatar-bg</code> / <code>--sk-avatar-fg</code>): tinting an avatar per person is the most ordinary thing an app does with them. Sixteen identities, four at each size, each a different color off the base palette, ringed the same way <strong>AvatarGroup</strong> separates its own overlapping discs.',
    "avatar.groupTitle": "Stacked avatars",
    "avatar.groupBody":
      '<strong>AvatarGroup</strong> overlaps a set and collapses the overflow into a "+N" counter.',
    "avatar.groupMaxBody":
      'In React you do not have to count them yourself: <code>max</code> caps the visible avatars and collapses the rest into the counter. The tree above writes its overflow by hand because the contract exposes it as a slot (<code>overflow</code>), which is exactly what lets the same group be composed with no JavaScript at all; <code>max</code> is the shorthand React builds on top of it.',
    "avatar.groupMaxNote": 'four children and max={3}: three show, the fourth becomes "+1"',
    "avatar.profileTitle": "In a composition",
    "avatar.profileBody":
      'Everything above is a specimen: discs in a bare row, which is how you compare a size ramp or sixteen tints, and not how you write an interface. This is the real piece, the same one the <code>hero-with-testimonial</code> example publishes: an <strong>Inline</strong> with the avatar beside a <strong>Stack</strong> of two <strong>Text</strong>s, name over role. They are two separate <code>Text</code>s rather than one string with a comma, because a screen reader announces them as two distinct facts, in the same order a sighted reader\'s eye takes them. At <code>md</code> this same piece is a comment header or a list row: the shape does not change with the size.',
    "avatar.test1": "With no image, derives initials from the name (two words → one letter from each).",
    "avatar.test2": "With a single name, uses its first two characters.",
    "avatar.test3": "With <code>src</code>, the image renders inside ImageFrame.",
    "avatar.test4": "AvatarGroup caps visible avatars and collapses the rest into a \"+N\" counter.",
    "avatar.test5":
      'The <code>xl</code> size serializes onto <code>data-size</code> on the disc, with initials and with a photo alike.',
    "avatar.test6": "With <code>label</code>, AvatarGroup announces itself as a named group.",
    "avatar.test7":
      "Without <code>label</code> it is still a group: each avatar already announces its own name.",
  },
} as const;
