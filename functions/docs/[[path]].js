/**
 * Markdown content negotiation (https://acceptmarkdown.com) for the pages
 * that publish a plain-markdown twin at `<url>.md`: a request carrying
 * `Accept: text/markdown` gets the twin, anything else gets the HTML, and
 * both variants carry `Vary: Accept` so the CDN caches them separately.
 *
 * This is a Cloudflare Pages Function; its directory is the route it runs
 * on, so it only fires under /docs/* (and /blog/*, which re-exports it).
 * Every other path stays on plain static serving.
 */
export async function onRequestGet(context) {
  const { request, env, next } = context
  const url = new URL(request.url)

  // The twin itself, or anything with an extension, is a plain static file.
  if (/\.[a-z0-9]+$/i.test(url.pathname)) return next()

  const accept = request.headers.get("Accept") ?? ""
  if (accept.includes("text/markdown")) {
    const twin = new URL(url)
    twin.pathname = url.pathname.replace(/\/$/, "") + ".md"
    const md = await env.ASSETS.fetch(twin)
    if (md.ok) {
      const response = new Response(md.body, md)
      response.headers.set("Content-Type", "text/markdown; charset=utf-8")
      response.headers.set("Vary", "Accept")
      return response
    }
    // No twin built for this path (e.g. the /docs index): serve the HTML.
  }

  const html = await next()
  const response = new Response(html.body, html)
  response.headers.append("Vary", "Accept")
  return response
}
