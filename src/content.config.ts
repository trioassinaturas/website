import { defineCollection, reference } from "astro:content"
import { file, glob } from "astro/loaders"
import { z } from "astro/zod"

const authors = defineCollection({
  loader: file("src/content/authors.yaml"),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      role: z.string(),
      bio: z.string(),
      /** Display order on /sobre. */
      order: z.number(),
      /** Brand color used for this author's card on /sobre. */
      accent: z.enum(["coral", "blue"]),
      /** Path relative to src/content/authors.yaml */
      avatar: image(),
      /** External profile linked from the page: LinkedIn, personal site, ... */
      url: z.url().optional(),
      /**
       * Canonical URLs of the same person elsewhere, published as `sameAs`.
       * Kept apart from `url` because that one is a link a reader clicks and
       * may carry tracking, while these are identity claims: a tracked or
       * redirecting variant is a weaker match for the profile it points at.
       */
      sameAs: z.array(z.url()).default([]),
    }),
})

const blog = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/blog" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      author: reference("authors"),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      cover: image().optional(),
      coverAlt: z.string().optional(),
      tags: z.array(z.string()).default([]),
      /** Drafts show up in `astro dev`, never in the published site. */
      draft: z.boolean().default(false),
    }),
})

const docs = defineCollection({
  // Nested directories become the first URL segment and the sidebar group,
  // so `pagamentos/cupons.mdx` is `/docs/pagamentos/cupons`. Group labels and
  // their display order live in `src/lib/docs.ts`.
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/docs" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    /** Position inside the section. Sparse numbering (10, 20, 30) eases inserts. */
    order: z.number().int(),
    /**
     * When the page last said something new. Shown on the page and published as
     * `dateModified`, which is how a search or answer engine tells a current
     * page from an abandoned one. Required so it cannot silently go missing;
     * bump it whenever the content changes, not for a typo.
     */
    updatedDate: z.coerce.date(),
    /** Shorter label for the sidebar, when the page title is too long. */
    navTitle: z.string().optional(),
    /** Extra search terms, indexed without appearing in the copy. */
    keywords: z.array(z.string()).default([]),
    /** Drafts show up in `astro dev`, never in the published site. */
    draft: z.boolean().default(false),
  }),
})

export const collections = { authors, blog, docs }
