import { createMarkdownProcessor } from "@astrojs/markdown-remark"
import { SITE } from "../config"

/**
 * The two RSS feeds (root also exposes blog), one per stream of dated content.
 * Both are declared here so the pages that advertise them and the endpoints
 * that build them agree on the path and the title.
 */
export const FEEDS = {
  blog: { href: "/blog/rss.xml", title: `Blog ${SITE.name}` },
  changelog: { href: "/novidades/rss.xml", title: `Novidades ${SITE.name}` },
  root: { href: "/rss.xml", title: `Blog ${SITE.name}` },
} as const

export type Feed = (typeof FEEDS)[keyof typeof FEEDS]

/**
 * Absolute URL with the trailing slash the host redirects to, so a reader
 * follows no 308. Built here rather than left to `@astrojs/rss`, whose
 * canonicalizer appends the slash after a `#fragment`.
 */
export function feedUrl(site: URL, path: string, fragment?: string): string {
  const url = new URL(path.replace(/\/*$/, "/"), site)
  if (fragment) url.hash = fragment
  return url.href
}

let processor: ReturnType<typeof createMarkdownProcessor> | undefined

/** Markdown body to HTML, for the `<content:encoded>` of a feed item. */
export async function markdownToHtml(markdown: string): Promise<string> {
  processor ??= createMarkdownProcessor()
  const { code } = await (await processor).render(markdown)
  return code
}
