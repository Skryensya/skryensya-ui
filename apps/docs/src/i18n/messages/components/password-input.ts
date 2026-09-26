export const passwordInputMessages = {
  es: {
    "passwordInput.description": "Un campo de contraseña con un botón para mostrar lo que se escribió.",
    "passwordInput.betaBadge": "Beta",
    "passwordInput.anatomyBody":
      "La etiqueta, el pozo que contiene el campo y el botón, y una pista opcional debajo. El botón es un Button icon-only compuesto: la forma, el área táctil y el state layer vienen de él.",
    "passwordInput.anatomyLabel": "Partes de PasswordInput",
    "passwordInput.anatomyPreviewLabel": "Anatomía",

    "passwordInput.lede":
      "Sobre <code>@zag-js/password-input</code>, la misma máquina en las dos capas. El botón alterna entre ocultar y mostrar la contraseña y cambia su nombre según lo que va a hacer. Al enviar o reiniciar el formulario, la contraseña se vuelve a ocultar sola, así que no queda visible en la página siguiente.",

    "passwordInput.whenTitle": "Cuándo usarlo",
    "passwordInput.whenItem1": "Para entrar a una cuenta o para crear o cambiar una contraseña",
    "passwordInput.whenItem2": "Sobre todo en el teléfono, donde un error de tipeo no se ve y mostrar la contraseña ahorra un intento fallido",
    "passwordInput.whenItem3":
      "No para un código de un solo uso de pocos dígitos (eso es OtpInput) ni para mostrar un secreto ya generado para copiarlo (eso es Clipboard)",

    "passwordInput.signInTitle": "Para entrar",
    "passwordInput.signInBody":
      "Por defecto, <code>autoComplete</code> es <code>current-password</code>: el navegador y el gestor de contraseñas ofrecen la guardada para esta cuenta. Va junto al campo de correo con el que forma el par.",
    "passwordInput.signInPreviewLabel": "PasswordInput para iniciar sesión",

    "passwordInput.signUpTitle": "Para crear una",
    "passwordInput.signUpBody":
      "Con <code>autoComplete=\"new-password\"</code> el gestor ofrece generar una y guardarla. La regla que tiene que cumplir va en <code>hint</code>, que queda asociada al campo con <code>aria-describedby</code>: se lee al entrar, no solo cuando ya falló.",
    "passwordInput.signUpPreviewLabel": "PasswordInput para crear una contraseña",

    "passwordInput.statesTitle": "Estados",
    "passwordInput.statesBody":
      "<code>invalid</code> pinta el borde de peligro y marca el campo <code>aria-invalid</code>; el motivo va en la pista. <code>disabled</code> apaga el campo y el botón: una contraseña que no se puede editar tampoco se puede revelar.",
    "passwordInput.statesPreviewLabel": "Estados de PasswordInput",

    "passwordInput.managersTitle": "Gestores de contraseñas",
    "passwordInput.managersBody":
      "<code>ignorePasswordManagers</code> pide a 1Password, LastPass, Bitwarden, Dashlane y Proton Pass que no ofrezcan autocompletar este campo. Úsalo solo cuando no es la contraseña de una cuenta: un PIN, una frase de un archivo cifrado. En un inicio de sesión, apagarlo empuja a la gente a contraseñas más débiles.",

    "passwordInput.a11yBody":
      "El botón de Zag no se puede alcanzar con Tab (<code>tabIndex=-1</code>) y solo responde al puntero. Aquí es un botón normal: se alcanza con Tab y se activa con Enter o Espacio, y su nombre accesible cambia entre <code>showLabel</code> y <code>hideLabel</code> junto con <code>aria-expanded</code>. Un clic con el mouse no le quita el foco al campo, así que se puede seguir escribiendo.",

    "passwordInput.showLabel": "Mostrar contraseña",
    "passwordInput.hideLabel": "Ocultar contraseña",
    "passwordInput.emailLabel": "Correo",
    "passwordInput.signInLabel": "Contraseña",
    "passwordInput.signUpLabel": "Contraseña nueva",
    "passwordInput.signUpHint": "Al menos 12 caracteres.",
    "passwordInput.invalidHint": "La contraseña no es correcta.",
    "passwordInput.disabledLabel": "Contraseña (bloqueada)",
  },
  en: {
    "passwordInput.description": "A password field with a button to show what was typed.",
    "passwordInput.betaBadge": "Beta",
    "passwordInput.anatomyBody":
      "The label, the well that holds the field and the button, and an optional hint below. The button is a composed icon-only Button: the shape, the hit target and the state layer come from it.",
    "passwordInput.anatomyLabel": "PasswordInput parts",
    "passwordInput.anatomyPreviewLabel": "Anatomy",

    "passwordInput.lede":
      "On <code>@zag-js/password-input</code>, the same machine in both bindings. The button toggles between hiding and showing the password and renames itself for what it will do next. When the form is submitted or reset, the password hides again on its own, so it is never left visible on the next page.",

    "passwordInput.whenTitle": "When to use it",
    "passwordInput.whenItem1": "To sign in to an account, or to create or change a password",
    "passwordInput.whenItem2": "Especially on a phone, where a typo is invisible and showing the password saves a failed attempt",
    "passwordInput.whenItem3":
      "Not for a short one-time code (that is OtpInput), and not to show an already generated secret for copying (that is Clipboard)",

    "passwordInput.signInTitle": "Signing in",
    "passwordInput.signInBody":
      "By default <code>autoComplete</code> is <code>current-password</code>: the browser and the password manager offer the one saved for this account. It sits with the email field it pairs with.",
    "passwordInput.signInPreviewLabel": "PasswordInput for signing in",

    "passwordInput.signUpTitle": "Creating one",
    "passwordInput.signUpBody":
      "With <code>autoComplete=\"new-password\"</code> the manager offers to generate one and save it. The rule it has to meet goes in <code>hint</code>, tied to the field through <code>aria-describedby</code>: it is read on the way in, not only once it has failed.",
    "passwordInput.signUpPreviewLabel": "PasswordInput for creating a password",

    "passwordInput.statesTitle": "States",
    "passwordInput.statesBody":
      "<code>invalid</code> paints the danger border and marks the field <code>aria-invalid</code>; the reason goes in the hint. <code>disabled</code> turns off the field and the button: a password that cannot be edited cannot be revealed either.",
    "passwordInput.statesPreviewLabel": "PasswordInput states",

    "passwordInput.managersTitle": "Password managers",
    "passwordInput.managersBody":
      "<code>ignorePasswordManagers</code> asks 1Password, LastPass, Bitwarden, Dashlane and Proton Pass not to offer to fill this field. Use it only when it is not an account's password: a PIN, the passphrase of an encrypted file. On a sign-in, turning them off pushes people toward weaker passwords.",

    "passwordInput.a11yBody":
      "Zag's button cannot be reached with Tab (<code>tabIndex=-1</code>) and only answers the pointer. Here it is an ordinary button: reachable with Tab and activated with Enter or Space, and its accessible name switches between <code>showLabel</code> and <code>hideLabel</code> along with <code>aria-expanded</code>. A mouse click does not take focus away from the field, so typing can carry on.",

    "passwordInput.showLabel": "Show password",
    "passwordInput.hideLabel": "Hide password",
    "passwordInput.emailLabel": "Email",
    "passwordInput.signInLabel": "Password",
    "passwordInput.signUpLabel": "New password",
    "passwordInput.signUpHint": "At least 12 characters.",
    "passwordInput.invalidHint": "That password is not right.",
    "passwordInput.disabledLabel": "Password (locked)",
  },
} as const;
