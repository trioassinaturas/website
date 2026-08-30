import type { APIRoute } from "astro"
import {
  getDocs,
  docSection,
  docUrl,
  sectionLabel,
  type Doc,
  type Section,
} from "../lib/docs"

/**
 * llms.txt (https://llmstxt.org): a map of the site for AI assistants and
 * crawlers, generated from the docs collection so it never drifts from the
 * published pages.
 */
export const GET: APIRoute = async ({ site }) => {
  const base = site?.href.replace(/\/$/, "") ?? ""
  const docs = await getDocs()

  const bySection = new Map<Section, Doc[]>()
  for (const doc of docs) {
    const section = docSection(doc)
    bySection.set(section, [...(bySection.get(section) ?? []), doc])
  }

  // Docs links point at the plain-markdown twin every page publishes at
  // `<url>.md`; dropping the suffix gives the rendered page.
  const sections = [...bySection.entries()].map(([section, sectionDocs]) => {
    const links = sectionDocs.map(
      (doc) =>
        `- [${doc.data.title}](${base}${docUrl(doc)}.md): ${doc.data.description}`,
    )
    return `## ${sectionLabel(section)}\n\n${links.join("\n")}`
  })

  const body = [
    "# Trio Assinaturas",
    "",
    "> Plataforma brasileira para clubes de assinatura e kits: catálogo, checkout, cobrança recorrente (cartão e Pix), gestão de assinantes e área do assinante, com pagamentos em BRL.",
    "",
    "Assistentes de IA se conectam aos dados de cada clube pelo protocolo MCP, no endereço `https://mcp.trioassinaturas.com.br/mcp` (autorização OAuth com o usuário do painel). Guia: " +
      `${base}/docs/assistentes-de-ia/visao-geral`,
    "",
    sections.join("\n\n"),
    "",
    "## Site",
    "",
    `- [Página inicial](${base}/): o que é o Trio e para quem ele é`,
    `- [Blog](${base}/blog): novidades e guias sobre clubes de assinatura`,
    `- [Sobre](${base}/sobre): quem faz o Trio`,
    "",
  ]

  return new Response(body.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
