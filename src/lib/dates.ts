/**
 * Date formatting shared by the blog and the docs. Both render a human date to
 * the reader and a machine one in `datetime`, and both have to agree on the
 * timezone: the collections store plain `YYYY-MM-DD`, which parses as UTC, so
 * formatting in local time would show the day before west of Greenwich.
 */
const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
})

/** Long form for the reader: `30 de agosto de 2026`. */
export const formatDate = (date: Date) => dateFormatter.format(date)

/** `YYYY-MM-DD`, for `<time datetime>` and for JSON-LD. */
export const isoDate = (date: Date) => date.toISOString().slice(0, 10)
