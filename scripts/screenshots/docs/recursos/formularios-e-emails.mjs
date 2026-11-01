import { openRow } from "../../helpers.mjs"

// Images for /docs/recursos/formularios-e-emails.

export default [
  // The forms list.
  { name: "formularios", path: "/forms" },
  // One form, with its fields.
  { name: "formulario", path: "/forms", prepare: (page) => openRow(page) },
]
