// Shared building blocks for screenshot specs.

/**
 * The innermost bordered card that holds a heading with this text: the
 * dashboard draws every block of a detail page as one of these.
 */
export function card(page, heading) {
  return page
    .locator("div.border")
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
 * Opens the record in the first table row (the eye link at the end of the
 * row), optionally the first row with this text. Goes to the link instead of
 * clicking it, so a Turbo visit can't leave the old page on screen.
 */
export async function openRow(page, text) {
  let rows = page.locator("table tbody tr")
  if (text) rows = rows.filter({ hasText: text })
  const href = await rows.first().locator("a[href]").last().getAttribute("href")
  if (!href) throw new Error(`No row link${text ? ` for "${text}"` : ""}`)
  await page.goto(new URL(href, page.url()).href, { waitUntil: "networkidle" })
}

/**
 * The block a heading opens when it is not drawn as a card of its own: the
 * heading's parent element, as on the company settings form.
 */
export function section(page, heading) {
  return page
    .getByRole("heading", { name: heading, exact: true })
    .first()
    .locator("xpath=..")
}
