import rss from "@astrojs/rss"
import type { APIRoute } from "astro"
import { getAuthorMap, getPosts, postUrl } from "../../lib/blog"
import { FEEDS, feedUrl } from "../../lib/feeds"

/**
 * One item per post, newest first, with the description as the summary. The
 * body stays on the page: posts are MDX with components a feed reader cannot
 * render, and the link is the point of an item anyway.
 */
export const GET: APIRoute = async ({ site }) => {
  const posts = await getPosts()
  const authors = await getAuthorMap()

  return rss({
    title: FEEDS.blog.title,
    description:
      "Conteúdos sobre recorrência, operação e crescimento de clubes de assinatura, escritos por quem vive esse mercado todos os dias.",
    site: site!,
    items: posts.map((post) => {
      const author = authors.get(post.data.author.id)!
      return {
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.pubDate,
        link: feedUrl(site!, postUrl(post)),
        categories: post.data.tags,
        customData: `<dc:creator>${author.data.name}</dc:creator>`,
      }
    }),
    xmlns: { dc: "http://purl.org/dc/elements/1.1/" },
    customData: "<language>pt-BR</language>",
  })
}
