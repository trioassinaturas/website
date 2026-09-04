import type { APIRoute } from "astro"
import { CHANGELOG_PATH, getEntries, groupByMonth } from "../lib/changelog"
import { formatDate } from "../lib/dates"

/**
 * The changelog is also published as plain markdown at `/novidades.md`, for AI
 * assistants and anyone who prefers the source over the rendered page. Static
 * hosting rules out Accept-header negotiation, so the suffix is the contract.
 */
export const GET: APIRoute = async ({ site }) => {
  const base = site?.href.replace(/\/$/, "") ?? ""
  const absolute = (href: string) =>
    href.startsWith("/") ? `${base}${href}` : href

  const groups = groupByMonth(await getEntries())

  const sections = groups.map(({ label, entries }) => {
    const items = entries.map((entry) => {
      const links = entry.data.docs
        .map((doc) => `[${doc.label}](${absolute(doc.href)})`)
        .join(", ")
      return [
        `### ${entry.data.title}`,
        "",
        `_${formatDate(entry.data.date)}_`,
        "",
        entry.body?.trim() ?? "",
        ...(links ? ["", `Saiba mais: ${links}`] : []),
      ].join("\n")
    })
    return `## ${label}\n\n${items.join("\n\n")}`
  })

  const body = [
    "# Novidades da Trio Assinaturas",
    "",
    "> O que foi lançado na plataforma, do mais recente para o mais antigo, com a data em que cada recurso entrou no ar e o link para a documentação que o descreve.",
    "",
    `_Página: ${base}${CHANGELOG_PATH}_`,
    "",
    sections.join("\n\n"),
    "",
  ]

  return new Response(body.join("\n"), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  })
}
