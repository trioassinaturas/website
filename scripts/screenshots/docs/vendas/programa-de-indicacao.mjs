import { formWith } from "../../helpers.mjs"

// Images for /docs/vendas/programa-de-indicacao.

export default [
  // The referral program settings: the switch and both rewards.
  {
    name: "configuracao",
    path: "/referral_program",
    target: (page) => formWith(page, "referral_program[enabled]"),
  },
]
