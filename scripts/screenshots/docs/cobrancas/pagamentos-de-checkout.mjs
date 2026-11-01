import { openRow } from "../../helpers.mjs"

// Images for /docs/cobrancas/pagamentos-de-checkout.

export default [
  // Every payment started in the checkout, including those that failed.
  { name: "pagamentos", path: "/checkout_payments" },
  // One checkout payment.
  {
    name: "pagamento",
    path: "/checkout_payments",
    prepare: (page) => openRow(page),
  },
]
