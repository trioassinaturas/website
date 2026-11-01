import { formWith } from "../../helpers.mjs"

// Images for /docs/vendas/cupons.

export default [
  // The coupons list, with the type and the benefit of each.
  { name: "cupons", path: "/coupons" },
  {
    // The coupon form with the Brinde type picked and a gift chosen: the
    // discount fields are gone and the product takes their place.
    name: "formulario-brinde",
    path: "/coupons/new",
    async prepare(page) {
      await page.fill('input[name="coupon[code]"]', "BRINDECANECA")
      await page.fill('input[name="coupon[name]"]', "Caneca de boas-vindas")
      await page.check('input[name="coupon[discount_type]"][value="product"]')
      await page
        .getByRole("combobox", { name: "Buscar produtos" })
        .fill("caneca")
      await page
        .getByRole("option", { name: /Caneca/ })
        .first()
        .click()
      await page.locator("body").click({ position: { x: 5, y: 5 } })
    },
    target: (page) => formWith(page, "coupon[code]"),
  },
]
