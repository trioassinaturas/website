import { getCollection, type CollectionEntry } from "astro:content"

export type Post = CollectionEntry<"blog">
export type Author = CollectionEntry<"authors">

/** Drafts show up in `astro dev`, but stay out of the published site. */
const isVisible = ({ data }: Post) => import.meta.env.DEV || !data.draft

/**
 * Covers are authored at 1200x630, the same frame as the OG image. Every slot
 * that renders one reserves a box with that ratio (`--cover-ratio`), so a cover
 * with a different shape gets cropped instead of resized. Fail loudly.
 *
 * This can't live in the collection schema: at validation time `cover` is still
 * an unresolved path, and the dimensions only exist once Astro imports it.
 */
const COVER_WIDTH = 1200
const COVER_HEIGHT = 630
const COVER_RATIO = COVER_WIDTH / COVER_HEIGHT

function assertCoverFits({ id, data: { cover } }: Post): void {
  if (!cover) return

  // Enough slack for an export that rounds to a neighbouring pixel.
  const keepsRatio = Math.abs(cover.width / cover.height - COVER_RATIO) < 0.005
  if (cover.width < COVER_WIDTH || !keepsRatio) {
    throw new Error(
      `The cover of "${id}" is ${cover.width}x${cover.height}. Covers must be ` +
        `${COVER_WIDTH}x${COVER_HEIGHT}, or a larger export with the same ` +
        `ratio, otherwise the artwork gets cropped.`,
    )
  }
}

/** Visible posts, newest first. */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection("blog", isVisible)
  posts.forEach(assertCoverFits)
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
