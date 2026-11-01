import { formWith, openRow } from "../../helpers.mjs"

// Images for /docs/catalogo/kits-e-produtos.

export default [
  // The product catalog.
  { name: "produtos", path: "/products" },
  // The kits list, one per period.
  { name: "kits", path: "/kits" },
  // Editing a kit: name, photo, dates and products.
  {
    name: "editar-kit",
    path: "/kits",
    async prepare(page) {
      await openRow(page)
      await page.goto(`${page.url().replace(/\/$/, "")}/edit`, {
        waitUntil: "networkidle",
      })
    },
    target: (page) => formWith(page, "kit[name]"),
  },
]
