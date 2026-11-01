import { openRow } from "../../helpers.mjs"

// Images for /docs/operacao/clientes-e-leads.

export default [
  // The customers list.
  { name: "clientes", path: "/customers" },
  // One customer's page.
  {
    name: "cliente",
    path: "/customers",
    prepare: (page) => openRow(page),
  },
  // The leads list, with where each one stopped.
  { name: "leads", path: "/leads" },
]
