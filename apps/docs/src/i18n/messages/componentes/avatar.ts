export const avatarMessages = {
  es: {
    "demo.avatar.label": "Avatares de ejemplo",
    "demo.avatar.imageLabel": "Avatares con foto",
    "demo.avatar.sizesLabel": "Tamaños de avatar",
    "demo.avatar.colorsLabel": "Avatares de colores",
    "demo.avatar.colorPersonName": "Avatar {letter}",
    "demo.avatar.groupLabel": "Avatares apilados",
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
      'Tres tamaños, <code>sm</code> / <code>md</code> / <code>lg</code>, la misma escala que Button.',
    "avatar.colorsTitle": "Colores",
    "avatar.colorsBody":
      'El fondo y la tinta son hooks de estilo (<code>--sk-avatar-bg</code> / <code>--sk-avatar-fg</code>): tintar un avatar por persona es lo más común que hace una app con ellos. Dieciséis identidades, cada una de un color distinto de la paleta base, con el mismo anillo que usa <strong>AvatarGroup</strong> para separar sus discos.',
    "avatar.groupTitle": "Avatares apilados",
    "avatar.groupBody":
      '<strong>AvatarGroup</strong> superpone un conjunto y colapsa el excedente en un contador «+N».',
    "avatar.test1": "Sin imagen, deriva las iniciales del nombre (dos palabras → una letra de cada una).",
    "avatar.test2": "Con un solo nombre, usa sus dos primeros caracteres.",
    "avatar.test3": "Con <code>src</code>, la imagen se renderiza dentro de ImageFrame.",
    "avatar.test4": "AvatarGroup limita los avatares visibles y colapsa el resto en un contador «+N».",
  },
  en: {
    "demo.avatar.label": "Example avatars",
    "demo.avatar.imageLabel": "Photo avatars",
    "demo.avatar.sizesLabel": "Avatar sizes",
    "demo.avatar.colorsLabel": "Colored avatars",
    "demo.avatar.colorPersonName": "Avatar {letter}",
    "demo.avatar.groupLabel": "Stacked avatars",
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
      'Three sizes, <code>sm</code> / <code>md</code> / <code>lg</code>, the same scale Button uses.',
    "avatar.colorsTitle": "Colors",
    "avatar.colorsBody":
      'Background and ink are styling hooks (<code>--sk-avatar-bg</code> / <code>--sk-avatar-fg</code>): tinting an avatar per person is the most ordinary thing an app does with them. Sixteen identities, each a different color off the base palette, ringed the same way <strong>AvatarGroup</strong> separates its own overlapping discs.',
    "avatar.groupTitle": "Stacked avatars",
    "avatar.groupBody":
      '<strong>AvatarGroup</strong> overlaps a set and collapses the overflow into a "+N" counter.',
    "avatar.test1": "With no image, derives initials from the name (two words → one letter from each).",
    "avatar.test2": "With a single name, uses its first two characters.",
    "avatar.test3": "With <code>src</code>, the image renders inside ImageFrame.",
    "avatar.test4": "AvatarGroup caps visible avatars and collapses the rest into a \"+N\" counter.",
  },
} as const;
