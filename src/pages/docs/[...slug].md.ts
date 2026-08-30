import type { APIRoute, GetStaticPaths } from "astro"
import { getDocs, docUrl, docSection, sectionLabel } from "../../lib/docs"

/**
 * Every docs page is also published as plain markdown at `<url>.md`, for AI
 * assistants and anyone who prefers the source over the rendered page. Static
 * hosting rules out Accept-header negotiation, so the suffix is the contract.
 */
export const getStaticPaths = (async () => {
  const docs = await getDocs()
  return docs.map((doc) => ({ params: { slug: doc.id }, props: { doc } }))
}) satisfies GetStaticPaths

export const GET: APIRoute = async ({ props, site }) => {
  const { doc } = props
  const base = site?.href.replace(/\/$/, "") ?? ""

  const body = [
    `# ${doc.data.title}`,
    "",
    `> ${doc.data.description}`,
    "",
    `_Seção: ${sectionLabel(docSection(doc))} · Página: ${base}${docUrl(doc)}_`,
    "",
    doc.body ?? "",
  ]

  return new Response(body.join("\n"), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  })
}
