import { openRow } from "../../helpers.mjs"

// Images for /docs/cobrancas/pagamentos-e-retentativas.

export default [
  // The charges list.
  { name: "cobrancas", path: "/charges" },
  // A failed charge, with its attempts.
  {
    name: "cobranca-com-falha",
    path: "/charges",
    prepare: (page) => openRow(page, "Falha"),
  },
]
