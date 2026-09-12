export const navbarMessages = {
  es: {
    "demo.navbar.nav": "Principal",
    "demo.navbar.home": "Inicio",
    "demo.navbar.projects": "Proyectos",
    "demo.navbar.reports": "Reportes",
    "demo.navbar.team": "Equipo",
    "demo.navbar.invite": "Invitar",
    "demo.navbar.newProject": "Nuevo proyecto",

    "navbarPage.description": "Navbar: la barra, con la lista de navegación como pattern horizontal.",
    "navbarPage.lede":
      "Navbar es la <strong>barra</strong>: superficie, marca y un lugar para acciones. No tiene máquina y no la necesita, es un <code>&lt;header&gt;</code> con links, y todo eso lo envía la plataforma.",
    "navbarPage.anatomyBody":
      "Este diagrama nombra el brand, la nav huésped y las actions. El espécimen está congelado; los Navbar vivos empiezan abajo.",
    "navbarPage.anatomyLabel": "Anatomía de Navbar",
    "navbarPage.anatomyPreviewLabel": "Navbar, parte por parte",
    "navbarPage.linksTitle": "Los links no son del navbar",
    "navbarPage.linksBody":
      "Son el pattern <a href=\"/nav-list\"><code>nav-list</code></a> en horizontal, la misma estructura que hospeda el sidebar en vertical. Que dos componentes necesiten esta estructura exacta es lo que la vuelve un pattern y no un componente: antes el navbar y el sidebar tenían cada uno su lista, con las mismas reglas escritas dos veces y libres de divergir.",
    "navbarPage.currentTitle": "La página actual es de la plataforma",
    "navbarPage.currentBody":
      'El link actual se marca con <code>aria-current="page"</code>, que el consumidor ya tiene que escribir para los lectores de pantalla. Los styling hooks lo siguen en vez de pedir una clase modificadora, y un <code>state</code> lo escribe una máquina; aquí no hay ninguna.',
    "navbarPage.test1": "Usa un landmark <code>header</code> y deja la navegación a su hijo NavList.",
  },
  en: {
    "demo.navbar.nav": "Primary",
    "demo.navbar.home": "Home",
    "demo.navbar.projects": "Projects",
    "demo.navbar.reports": "Reports",
    "demo.navbar.team": "Team",
    "demo.navbar.invite": "Invite",
    "demo.navbar.newProject": "New project",

    "navbarPage.description": "Navbar: the bar, with the navigation list as a horizontal pattern.",
    "navbarPage.lede":
      "Navbar is the <strong>bar</strong>: a surface, a brand mark, and a place for actions. It has no machine and needs none: it is a <code>&lt;header&gt;</code> with links, and the platform ships all of that.",
    "navbarPage.anatomyBody":
      "This diagram names the brand, the guest nav and the actions. The specimen is frozen; the live Navbars begin below.",
    "navbarPage.anatomyLabel": "Navbar anatomy",
    "navbarPage.anatomyPreviewLabel": "Navbar, part by part",
    "navbarPage.linksTitle": "The links do not belong to the navbar",
    "navbarPage.linksBody":
      "They are the <a href=\"/en/nav-list\"><code>nav-list</code></a> pattern, laid out horizontally, the same structure that hosts the sidebar vertically. That two components need this exact structure is what makes it a pattern rather than a component: before, the navbar and the sidebar each had their own list, with the same rules written twice and free to drift apart.",
    "navbarPage.currentTitle": "The current page belongs to the platform",
    "navbarPage.currentBody":
      'The current link is marked with <code>aria-current="page"</code>, which the consumer already has to write for screen readers. The styling hooks follow it instead of asking for a modifier class, and a <code>state</code> would be written by a machine; there is none here.',
    "navbarPage.test1": "Uses a header landmark while leaving navigation to its NavList child.",
  },
} as const;
