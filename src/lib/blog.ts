import { getCollection, type CollectionEntry } from "astro:content"

export type Post = CollectionEntry<"blog">
export type Author = CollectionEntry<"authors">

/** Drafts show up in `astro dev`, but stay out of the published site. */
const isVisible = ({ data }: Post) => import.meta.env.DEV || !data.draft

/** Visible posts, newest first. */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection("blog", isVisible)
  return posts.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  )
}

/** `id -> author` map, so we don't query the collection once per post. */
export async function getAuthorMap(): Promise<Map<string, Author>> {
  const authors = await getCollection("authors")
  return new Map(authors.map((author) => [author.id, author]))
}

export const postUrl = (post: Post) => `/blog/${post.id}`
export const authorUrl = (id: string) => `/blog/author/${id}`

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
})

export const formatDate = (date: Date) => dateFormatter.format(date)
export const isoDate = (date: Date) => date.toISOString().slice(0, 10)

/** Estimate at 200 words per minute, floored at 1 minute. */
export function readingMinutes(body = ""): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

/**
 * `view-transition-name` must be a valid CSS identifier, so the post id (which
 * may contain `/`, `.` or accents) is normalized before becoming a name.
 */
export const vtName = (prefix: string, id: string) =>
  `${prefix}-${id.replace(/[^a-zA-Z0-9_-]/g, "-")}`
