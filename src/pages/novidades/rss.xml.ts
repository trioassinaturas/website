import rss from "@astrojs/rss"
import type { APIRoute } from "astro"
import { CHANGELOG_PATH, entryAnchor, getEntries } from "../../lib/changelog"
import { FEEDS, feedUrl, markdownToHtml } from "../../lib/feeds"

/**
 * One item per launch, newest first, carrying the whole entry: they are short,
 * plain markdown, and a reader subscribing to a changelog wants the text in
 * the reader, not a click away. The docs links close each item.
 */
export const GET: APIRoute = async ({ site }) => {
  const entries = await getEntries()

  const items = await Promise.all(
    entries.map(async (entry) => {
      const { title, date, docs } = entry.data
      const body = await markdownToHtml(entry.body ?? "")
      const links = docs
        .map((doc) => {
          const href = doc.href.startsWith("/")
            ? new URL(doc.href, site).href
            : doc.href
          return `<a href="${href}">${doc.label}</a>`
        })
        .join(", ")
      const content = links ? `${body}<p>Saiba mais: ${links}</p>` : body

      return {
        title,
        pubDate: date,
        link: feedUrl(site!, CHANGELOG_PATH, entryAnchor(entry)),
        content,
      }
    }),
  )

  return rss({
    title: FEEDS.changelog.title,
    description:
      "O que foi lançado na plataforma Trio Assinaturas, com a data de cada recurso e o link para a documentação que o descreve.",
    site: site!,
    items,
    customData: "<language>pt-BR</language>",
  })
}
