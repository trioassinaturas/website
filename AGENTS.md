## Conventions

Code is written in English: comments, JSDoc, identifiers, CSS class names, route
paths and commit messages. Only user-facing content (copy, `alt` text,
`aria-label`, blog posts, collection data) is in Portuguese.

Note: `/sobre` predates this convention and is still in Portuguese.

Exception: `/docs` slugs are Portuguese (`/docs/cobrancas/estrategias-de-cobranca`).
Documentation URLs are user-facing content: they show up in search results and get
shared. The `docs` collection keys in `src/lib/docs.ts` follow the directory names,
so they are Portuguese too.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## The `/docs` section

Content lives in `src/content/docs/<secao>/<pagina>.mdx`. The directory **is** the
sidebar group and the first URL segment, so moving a file between directories
changes its URL. Group labels and their display order are defined once, in
`SECTIONS` in `src/lib/docs.ts`; a file in a directory that isn't listed there
fails the build on purpose.

Frontmatter contract (schema in `src/content.config.ts`):

| Field                   | Required | Notes                                                                      |
| ----------------------- | -------- | -------------------------------------------------------------------------- |
| `title` / `description` | yes      | Rendered in the page header and used for `<title>`/meta                    |
| `order`                 | yes      | Position inside the section. Numbered 10, 20, 30 so inserts don't renumber |
| `navTitle`              | no       | Shorter sidebar label when the title is long                               |
| `keywords`              | no       | Indexed for search without appearing on the page                           |
| `draft`                 | no       | Visible in `astro dev`, excluded from the build                            |

`Callout`, `Steps` and `Tabs` are passed to every MDX page via the `components`
prop in `src/pages/docs/[...slug].astro`, so **do not import them** in the MDX.
They live in `src/components/mdx/` and are shared with the blog.

Two authoring gotchas:

- Markdown inside a JSX element works when the content is on its own lines, but
  **not** inline: `<Callout>texto **negrito**</Callout>` renders literal asterisks.
- Attribute values can't contain unescaped double quotes. Use typographic quotes
  in `title` when you need to quote something.

Search is Pagefind, built by `src/integrations/pagefind.ts` from the generated
HTML. It **does not exist under `astro dev`** and the search box says so; use
`pnpm build && pnpm preview` to test it. The index is scoped by the single
`data-pagefind-body` in `src/layouts/DocsLayout.astro`, so adding that attribute
anywhere else widens what search returns.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
