import { openRow } from "../../helpers.mjs"

// Images for /docs/operacao/tabelas-de-frete.

export default [
  // One shipping table, with its ranges.
  {
    name: "tabela",
    path: "/shipping_tables",
    prepare: (page) => openRow(page),
  },
]
