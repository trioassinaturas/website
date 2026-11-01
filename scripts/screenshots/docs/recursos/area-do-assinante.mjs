import { section } from "../../helpers.mjs"

// Images for /docs/recursos/area-do-assinante.

export default [
  // What a subscriber sees after signing in.
  { name: "inicio", host: "assinantes", path: "/", auth: "assinante" },
  // A subscription in the subscriber area, with what they can change.
  {
    name: "assinatura",
    host: "assinantes",
    path: "/subscriptions",
    auth: "assinante",
  },
  // The switches that decide whether subscribers can pause or cancel.
  {
    name: "autoatendimento",
    path: "/company/edit",
    target: (page) => section(page, "Autoatendimento do Assinante"),
  },
]
