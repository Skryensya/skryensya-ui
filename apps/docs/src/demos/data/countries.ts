/*
 * THE COUNTRY LIST, once per language, as DATA rather than as translation keys.
 *
 * Every other word in a demo lives in `i18n/ui.ts` as a `demo.*` key, and this one deliberately
 * does not: 194 keys whose only job is to pair two proper nouns would be a dictionary pretending to
 * be a translation table, and nobody would ever read it. A list is a list.
 *
 * THE TWO LISTS HAD DRIFTED when they were lifted out of the pages: 194 names in Spanish and 195 in
 * English, no duplicates on either side. Neither page could notice, because each rendered only its
 * own copy, which is the same failure the shared tree exists to remove, one level down in the data
 * rather than in the composition. They are left as found rather than silently reconciled: picking
 * which country to add or drop is an editorial call, not a refactor.
 *
 * Each name's identity is its own slug, so a row's value differs between languages. That is what the
 * pages already did, and it is honest for a demo whose subject is filtering, not identity.
 */

/** Accents stripped, punctuation and spaces collapsed, so the data stays a plain list of names. */
export const slug = (name: string) =>
  name
    .normalize("NFD")
    .replace(/\p{M}+/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const countries: Record<"es" | "en", readonly string[]> = {
  es: [
  "Afganistán", "Albania", "Alemania", "Andorra", "Angola", "Antigua y Barbuda",
  "Arabia Saudita", "Argelia", "Argentina", "Armenia", "Australia", "Austria",
  "Azerbaiyán", "Bahamas", "Bangladés", "Barbados", "Baréin", "Bélgica", "Belice",
  "Benín", "Bielorrusia", "Birmania", "Bolivia", "Bosnia y Herzegovina", "Botsuana",
  "Brasil", "Brunéi", "Bulgaria", "Burkina Faso", "Burundi", "Bután", "Cabo Verde",
  "Camboya", "Camerún", "Canadá", "Catar", "Chad", "Chile", "China", "Chipre",
  "Ciudad del Vaticano", "Colombia", "Comoras", "Corea del Norte", "Corea del Sur",
  "Costa de Marfil", "Costa Rica", "Croacia", "Cuba", "Dinamarca", "Dominica",
  "Ecuador", "Egipto", "El Salvador", "Emiratos Árabes Unidos", "Eritrea",
  "Eslovaquia", "Eslovenia", "España", "Estados Unidos", "Estonia", "Esuatini",
  "Etiopía", "Filipinas", "Finlandia", "Fiyi", "Francia", "Gabón", "Gambia",
  "Georgia", "Ghana", "Granada", "Grecia", "Guatemala", "Guyana", "Guinea",
  "Guinea-Bisáu", "Guinea Ecuatorial", "Haití", "Honduras", "Hungría", "India",
  "Indonesia", "Irak", "Irán", "Irlanda", "Islandia", "Islas Marshall",
  "Islas Salomón", "Israel", "Italia", "Jamaica", "Japón", "Jordania",
  "Kazajistán", "Kenia", "Kirguistán", "Kiribati", "Kuwait", "Laos", "Lesoto",
  "Letonia", "Líbano", "Liberia", "Libia", "Liechtenstein", "Lituania",
  "Luxemburgo", "Macedonia del Norte", "Madagascar", "Malasia", "Malaui",
  "Maldivas", "Malí", "Malta", "Marruecos", "Mauricio", "Mauritania", "México",
  "Micronesia", "Moldavia", "Mónaco", "Mongolia", "Montenegro", "Mozambique",
  "Namibia", "Nauru", "Nepal", "Nicaragua", "Níger", "Nigeria", "Noruega",
  "Nueva Zelanda", "Omán", "Países Bajos", "Pakistán", "Palaos", "Panamá",
  "Papúa Nueva Guinea", "Paraguay", "Perú", "Polonia", "Portugal", "Reino Unido",
  "República Centroafricana", "República Checa", "República del Congo",
  "República Democrática del Congo", "República Dominicana", "Ruanda", "Rumanía",
  "Rusia", "Samoa", "San Cristóbal y Nieves", "San Marino",
  "San Vicente y las Granadinas", "Santa Lucía", "Santo Tomé y Príncipe",
  "Senegal", "Serbia", "Seychelles", "Sierra Leona", "Singapur", "Siria",
  "Somalia", "Sri Lanka", "Sudáfrica", "Sudán", "Sudán del Sur", "Suecia",
  "Suiza", "Surinam", "Tailandia", "Tanzania", "Tayikistán", "Timor Oriental",
  "Togo", "Tonga", "Trinidad y Tobago", "Túnez", "Turkmenistán", "Turquía",
  "Tuvalu", "Ucrania", "Uganda", "Uruguay", "Uzbekistán", "Vanuatu", "Venezuela",
  "Vietnam", "Yemen", "Yibuti", "Zambia", "Zimbabue",
],
  en: [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda",
  "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas",
  "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin",
  "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei",
  "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada",
  "Cape Verde", "Central African Republic", "Chad", "Chile", "China", "Colombia",
  "Comoros", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic",
  "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica",
  "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea",
  "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada",
  "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras",
  "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland",
  "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", "Jordan", "Kazakhstan",
  "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon",
  "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta",
  "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia",
  "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique",
  "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand",
  "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway",
  "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea", "Paraguay",
  "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Republic of the Congo",
  "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia",
  "Saint Vincent and the Grenadines", "Samoa", "San Marino",
  "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles",
  "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands",
  "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka",
  "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan",
  "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago",
  "Tunisia", "Türkiye", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine",
  "United Arab Emirates", "United Kingdom", "United States", "Uruguay",
  "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen",
  "Zambia", "Zimbabwe",
],
};
