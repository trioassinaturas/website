import { openRow } from "../../helpers.mjs"

// Images for /docs/cobrancas/assinaturas.

export default [
  // The subscriptions list.
  { name: "assinaturas", path: "/subscriptions" },
  // One active subscription.
  {
    name: "assinatura",
    path: "/subscriptions",
    prepare: (page) => openRow(page, "Ativa"),
  },
]
