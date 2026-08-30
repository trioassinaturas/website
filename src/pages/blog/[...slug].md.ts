import type { APIRoute, GetStaticPaths } from "astro"
import { formatDate, getAuthorMap, getPosts, postUrl } from "../../lib/blog"

/**
 * Every post is also published as plain markdown at `<url>.md`, for AI
 * assistants and anyone who prefers the source over the rendered page. Static
 * hosting rules out Accept-header negotiation, so the suffix is the contract.
 */
export const getStaticPaths = (async () => {
  const posts = await getPosts()
  const authors = await getAuthorMap()

  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post, author: authors.get(post.data.author.id)! },
  }))
}) satisfies GetStaticPaths

export const GET: APIRoute = async ({ props, site }) => {
  const { post, author } = props
  const base = site?.href.replace(/\/$/, "") ?? ""

  const body = [
    `# ${post.data.title}`,
    "",
    `> ${post.data.description}`,
    "",
    `_Por ${author.data.name} · ${formatDate(post.data.pubDate)} · Página: ${base}${postUrl(post)}_`,
    "",
    post.body ?? "",
  ]

  return new Response(body.join("\n"), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  })
}
