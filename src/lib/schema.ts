import { CONTACT, SITE, SOCIAL } from "../config"
import { authorUrl, postUrl, type Author, type Post } from "./blog"
import { docUrl, type Doc } from "./docs"

/**
 * JSON-LD entities describing a page. Emitted verbatim into a single
 * `<script type="application/ld+json">`, so every value has to survive
 * `JSON.stringify` unchanged: plain objects, strings, numbers and arrays.
 */
export type JsonLd = Record<string, unknown>

/** Stable identifiers, so entities on different pages refer to the same node. */
const ORGANIZATION = "/#organization"
const WEBSITE = "/#website"

const abs = (site: URL, path: string) => new URL(path, site).href

/** `YYYY-MM-DD`, which schema.org accepts wherever a Date is expected. */
const isoDay = (date: Date) => date.toISOString().slice(0, 10)

/**
 * The company behind every page. Inlined on each page rather than referenced
 * across the site: an answer engine usually parses one page in isolation, and a
 * pointer to a node it never fetched tells it nothing.
 */
export function organization(site: URL): JsonLd {
  return {
    "@type": "Organization",
    "@id": abs(site, ORGANIZATION),
    name: SITE.name,
    url: site.href,
    logo: abs(site, "/images/logo-completo.jpg"),
    description: SITE.description,
    email: CONTACT.email,
    telephone: CONTACT.whatsappDisplay,
    sameAs: [...SOCIAL],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Porto Alegre",
      addressRegion: "RS",
      addressCountry: "BR",
    },
  }
}

/** The site as a whole. Pairs with `organization` on the home page. */
export function website(site: URL): JsonLd {
  return {
    "@type": "WebSite",
    "@id": abs(site, WEBSITE),
    name: SITE.name,
    url: site.href,
    description: SITE.description,
    inLanguage: "pt-BR",
    publisher: { "@id": abs(site, ORGANIZATION) },
  }
}

export interface BlogPostingInput {
  site: URL
  post: Post
  author: Author
  /** Built cover URL, site-relative. Falls back to the site-wide OG image. */
  coverSrc?: string
}

/** A blog post, with the authorship and dates the page already renders. */
export function blogPosting({
  site,
  post,
  author,
  coverSrc,
}: BlogPostingInput): JsonLd {
  const { title, description, pubDate, updatedDate, tags } = post.data
  const url = abs(site, postUrl(post))

  return {
    "@type": "BlogPosting",
    "@id": `${url}#post`,
    headline: title,
    description,
    url,
    mainEntityOfPage: url,
    inLanguage: "pt-BR",
    datePublished: isoDay(pubDate),
    dateModified: isoDay(updatedDate ?? pubDate),
    image: abs(site, coverSrc ?? "/images/logo-completo.jpg"),
    author: {
      "@type": "Person",
      name: author.data.name,
      jobTitle: author.data.role,
      description: author.data.bio,
      url: abs(site, authorUrl(author.id)),
      ...(author.data.url && { sameAs: [author.data.url] }),
    },
    publisher: organization(site),
    ...(tags.length > 0 && { keywords: tags }),
  }
}

export interface TechArticleInput {
  site: URL
  doc: Doc
  /** Sidebar group label, the topic this page sits under. */
  section: string
}

/**
 * A documentation page. `TechArticle` rather than `Article`: these are
 * instructions for operating the product, not editorial writing.
 */
export function techArticle({ site, doc, section }: TechArticleInput): JsonLd {
  const { title, description, keywords, updatedDate } = doc.data
  const url = abs(site, docUrl(doc))

  return {
    "@type": "TechArticle",
    "@id": `${url}#article`,
    headline: title,
    description,
    url,
    mainEntityOfPage: url,
    inLanguage: "pt-BR",
    dateModified: isoDay(updatedDate),
    articleSection: section,
    publisher: organization(site),
    ...(keywords.length > 0 && { keywords }),
  }
}

/**
 * The about page, where the company is the subject. Carries the founders,
 * which is what ties the two author identities to the organization.
 */
export function aboutPage(site: URL, founders: Author[]): JsonLd {
  const url = abs(site, "/sobre")

  return {
    "@type": "AboutPage",
    "@id": `${url}#page`,
    url,
    inLanguage: "pt-BR",
    mainEntity: {
      ...organization(site),
      founder: founders.map((founder) => ({
        "@type": "Person",
        name: founder.data.name,
        jobTitle: founder.data.role,
        description: founder.data.bio,
        url: abs(site, authorUrl(founder.id)),
        ...(founder.data.url && { sameAs: [founder.data.url] }),
      })),
    },
  }
}

export interface CollectionPageInput {
  site: URL
  /** Site-relative path of the page being described. */
  path: string
  name: string
  description: string
  /** The entries the page lists, in the order they appear. */
  items: { name: string; path: string }[]
}

/** An index that exists to list other pages: `/blog` and `/docs`. */
export function collectionPage({
  site,
  path,
  name,
  description,
  items,
}: CollectionPageInput): JsonLd {
  const url = abs(site, path)

  return {
    "@type": "CollectionPage",
    "@id": `${url}#page`,
    name,
    description,
    url,
    inLanguage: "pt-BR",
    isPartOf: { "@id": abs(site, WEBSITE) },
    publisher: organization(site),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: item.name,
        url: abs(site, item.path),
      })),
    },
  }
}

/**
 * An author's page. The `Person` is the point of it: authorship is what an
 * answer engine weighs when deciding whether writing is worth citing.
 */
export function profilePage(site: URL, author: Author): JsonLd {
  const { name, role, bio, url: profile } = author.data
  const url = abs(site, authorUrl(author.id))

  return {
    "@type": "ProfilePage",
    "@id": `${url}#page`,
    url,
    inLanguage: "pt-BR",
    mainEntity: {
      "@type": "Person",
      "@id": `${url}#person`,
      name,
      jobTitle: role,
      description: bio,
      url,
      worksFor: { "@id": abs(site, ORGANIZATION) },
      ...(profile && { sameAs: [profile] }),
    },
  }
}

export interface Faq {
  question: string
  /** Plain text, rendered verbatim on the page so the two never diverge. */
  answer: string
}

/**
 * A page of questions and answers. The answers here have to be the same text
 * the reader sees: structured data that promises more than the page shows is
 * what gets a site dropped from answers rather than cited.
 */
export function faqPage(site: URL, path: string, faqs: Faq[]): JsonLd {
  const url = abs(site, path)

  return {
    "@type": "FAQPage",
    "@id": `${url}#faq`,
    url,
    inLanguage: "pt-BR",
    publisher: organization(site),
    mainEntity: faqs.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  }
}

export interface Crumb {
  name: string
  /** Site-relative path. Omitted on the current page, which links nowhere. */
  path?: string
}

/** Where a page sits in the site, as the reader walked in. */
export function breadcrumbs(site: URL, crumbs: Crumb[]): JsonLd {
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map(({ name, path }, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      ...(path && { item: abs(site, path) }),
    })),
  }
}

/**
 * Serializes a page's entities as one `@graph`.
 *
 * The result goes through `set:html`, which does not escape, so `<` is encoded
 * to keep a stray `</script>` in any string from closing the block early.
 */
export function jsonLd(graph: JsonLd[]): string {
  const payload = { "@context": "https://schema.org", "@graph": graph }
  return JSON.stringify(payload).replace(/</g, "\\u003c")
}
