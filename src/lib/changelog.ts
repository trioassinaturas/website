import { getCollection, type CollectionEntry } from "astro:content"

export type Entry = CollectionEntry<"changelog">

export const CHANGELOG_PATH = "/novidades"

/** Drafts show up in `astro dev`, but stay out of the published site. */
const isVisible = ({ data }: Entry) => import.meta.env.DEV || !data.draft

/**
 * Entries are files named `YYYY-MM-DD-slug.mdx`. The date prefix keeps the
 * directory listing in chronological order; the slug alone is the anchor on
 * the page, so a link to an entry survives a corrected date.
 */
const DATE_PREFIX = /^\d{4}-\d{2}-\d{2}-/

export const entryAnchor = (entry: Entry) => entry.id.replace(DATE_PREFIX, "")
export const entryUrl = (entry: Entry) =>
  `${CHANGELOG_PATH}#${entryAnchor(entry)}`

/** Visible entries, newest first. Same-day entries keep title order. */
export async function getEntries(): Promise<Entry[]> {
  const entries = await getCollection("changelog", isVisible)

  const anchors = new Set<string>()
  for (const entry of entries) {
    const anchor = entryAnchor(entry)
    if (anchors.has(anchor)) {
      throw new Error(
        `Two changelog entries share the anchor "${anchor}". Rename one of ` +
          `them: the slug after the date prefix has to be unique.`,
      )
    }
    anchors.add(anchor)
  }

  return entries.sort((a, b) => {
    const byDate = b.data.date.valueOf() - a.data.date.valueOf()
    if (byDate !== 0) return byDate
    return a.data.title.localeCompare(b.data.title, "pt-BR")
  })
}

export interface MonthGroup {
  /** `YYYY-MM`, stable for ids and anchors. */
  key: string
  /** `Setembro de 2026`. */
  label: string
  entries: Entry[]
}

const monthFormatter = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
})

const monthLabel = (date: Date) => {
  const label = monthFormatter.format(date)
  return label.charAt(0).toUpperCase() + label.slice(1)
}

/** Entries bucketed by month, preserving the order they came in. */
export function groupByMonth(entries: Entry[]): MonthGroup[] {
  const groups: MonthGroup[] = []
  for (const entry of entries) {
    const key = entry.data.date.toISOString().slice(0, 7)
    const last = groups.at(-1)
    if (last?.key === key) {
      last.entries.push(entry)
    } else {
      groups.push({ key, label: monthLabel(entry.data.date), entries: [entry] })
    }
  }
  return groups
}
