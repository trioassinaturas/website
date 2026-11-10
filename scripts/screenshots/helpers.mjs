// Shared building blocks for screenshot specs.

/**
 * The innermost bordered card that holds a heading with this text: the
 * dashboard draws every block of a detail page as one of these.
 */
export function card(page, heading) {
  return page
    .locator(".card, div.border")
    .filter({ has: page.getByRole("heading", { name: heading, exact: true }) })
    .last()
}

/** The form that owns a field with this `name`. */
export function formWith(page, fieldName) {
  return page
    .locator("form")
    .filter({ has: page.locator(`[name="${fieldName}"]`) })
    .first()
}

/** The first table on the page, header included. */
export function table(page) {
  return page.locator("table").first()
}

/**
 * Opens the record in the first table row (the row's own link, or the last
 * link in it), optionally the first row with this text. Goes to the link
 * instead of clicking it, so a Turbo visit can't leave the old page on screen.
 */
export async function openRow(page, text) {
  let rows = page.locator("table tbody tr")
  if (text) rows = rows.filter({ hasText: text })
  const row = rows.first()
  const href =
    (await row.getAttribute("data-row-link-url-value")) ??
    (await row.locator("a[href]").last().getAttribute("href"))
  if (!href) throw new Error(`No row link${text ? ` for "${text}"` : ""}`)
  await page.goto(new URL(href, page.url()).href, { waitUntil: "networkidle" })
}

/**
 * A section of a settings form: the row that holds the heading and its
 * description on the left and the card with the fields on the right, as on
 * the company settings form.
 */
export function section(page, heading) {
  return page
    .getByRole("heading", { name: heading, exact: true })
    .first()
    .locator("xpath=../..")
}
