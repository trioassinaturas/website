import { card, openRow } from "../../helpers.mjs"

// Images for /docs/operacao/pedidos-e-envios.

export default [
  // The orders list, with the bulk actions and the import button.
  { name: "pedidos", path: "/orders" },
  // The amounts block of an order.
  {
    name: "valores-do-pedido",
    path: "/orders",
    prepare: (page) => openRow(page, "Enviado"),
    target: (page) => card(page, "Valores"),
  },
  // The tracking code import screen.
  { name: "importar-rastreios", path: "/orders/tracking_import/new" },
]
