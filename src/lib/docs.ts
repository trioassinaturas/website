import { getCollection, type CollectionEntry } from "astro:content"

export type Doc = CollectionEntry<"docs">

/**
 * Sidebar groups, in display order. Keys are directory names under
 * `src/content/docs/`, which are also the first segment of the page URL.
 */
const SECTIONS = {
  "primeiros-passos": "Primeiros passos",
  catalogo: "Clubes e catálogo",
  vendas: "Vendas e checkout",
  cobrancas: "Assinaturas e cobranças",
  operacao: "Operação",
  recursos: "Recursos",
  "assistentes-de-ia": "Assistentes de IA",
} as const

export type Section = keyof typeof SECTIONS

const sectionRank = new Map<string, number>(
  Object.keys(SECTIONS).map((section, i) => [section, i]),
)

export const docUrl = (doc: Doc) => `/docs/${doc.id}`
export const sectionLabel = (section: Section) => SECTIONS[section]

/** The directory a doc lives in, which is its sidebar group. */
export function docSection(doc: Doc): Section {
  const [section] = doc.id.split("/")
  if (!(section in SECTIONS)) {
    throw new Error(
      `Doc "${doc.id}" is not inside a known section directory. ` +
        `Expected one of: ${Object.keys(SECTIONS).join(", ")}.`,
    )
  }
  return section as Section
}

/** Drafts show up in `astro dev`, but stay out of the published site. */
const isVisible = ({ data }: Doc) => import.meta.env.DEV || !data.draft

/** Visible docs in reading order: section, then `order`, then title. */
export async function getDocs(): Promise<Doc[]> {
  const docs = await getCollection("docs", isVisible)

  return docs.sort((a, b) => {
    const bySection =
      sectionRank.get(docSection(a))! - sectionRank.get(docSection(b))!
    if (bySection !== 0) return bySection
    if (a.data.order !== b.data.order) return a.data.order - b.data.order
    return a.data.title.localeCompare(b.data.title, "pt-BR")
  })
}

export interface DocsNavItem {
  id: string
  title: string
  url: string
}

export interface DocsNavGroup {
  section: Section
  label: string
  items: DocsNavItem[]
}

export interface DocsNav {
  /** Grouped, for the sidebar and the /docs landing page. */
  groups: DocsNavGroup[]
  /** Flattened in the same order, for prev/next navigation. */
  flat: DocsNavItem[]
}

export async function getDocsNav(): Promise<DocsNav> {
  const docs = await getDocs()

  const groups = Object.entries(SECTIONS)
    .map(([section, label]) => ({
      section: section as Section,
      label,
      items: docs
        .filter((doc) => docSection(doc) === section)
        .map((doc) => ({
          id: doc.id,
          title: doc.data.navTitle ?? doc.data.title,
          url: docUrl(doc),
        })),
    }))
    .filter((group) => group.items.length > 0)

  return { groups, flat: groups.flatMap((group) => group.items) }
}

export interface DocsPager {
  prev: DocsNavItem | undefined
  next: DocsNavItem | undefined
}

/** Neighbours in reading order. `undefined` at either end of the list. */
export function getPager(flat: DocsNavItem[], id: string): DocsPager {
  const i = flat.findIndex((item) => item.id === id)
  if (i === -1) return { prev: undefined, next: undefined }
  return { prev: flat[i - 1], next: flat[i + 1] }
}

/**
 * `Astro.url.pathname` keeps a trailing slash in the production build
 * (`build.format: "directory"`) but not in dev, so both sides of an
 * active-link comparison have to be normalized.
 */
export const normalizePath = (pathname: string) =>
  pathname.replace(/\/+$/, "") || "/"
