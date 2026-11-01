// Images for /docs/vendas/checkout.

export default [
  // The checkout on a computer, with the recommended plan picked so the
  // order summary shows the price.
  {
    name: "checkout",
    host: "checkout",
    path: "/",
    auth: false,
    async prepare(page) {
      await page.getByText("Recomendado").first().click()
      await page.waitForLoadState("networkidle")
    },
  },
  // The same checkout on a phone.
  {
    name: "checkout-celular",
    host: "checkout",
    path: "/",
    auth: false,
    viewport: { width: 390, height: 844 },
  },
]
