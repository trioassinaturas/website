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

## Git

There is one branch, `main`, and it is the one that deploys. Commit straight to
it: no feature branches, no PRs. The pre-commit hook in `.githooks` runs lint,
`prettier --check` and `astro check`, so a commit that goes through is a commit
that passes CI.

Always push after committing. The production build runs from `origin/main`, so a
commit sitting locally has not shipped anything and the fix is not live. Treat
`git push origin main` as the last step of the task, not as a separate thing to
ask permission for.

## Blog covers

Every cover is authored at **1200x630**, the same frame as the OG image. That is
not a suggestion: the card and the post page reserve a `--cover-ratio` box and
`object-fit: cover` crops anything else to fit, so `getPosts()` throws on a cover
with another shape and the build fails.

The featured card puts the cover in a panel next to the text instead of
stretching it, so the whole artwork stays visible however long the title is.
Cover art can therefore use the full frame, edge to edge, with no safe margin.

## The `/docs` section

**The reader is the merchant, not the subscriber.** `/docs` is written for the
person running a subscription club from the dashboard: the operator, their
support staff, their admins. It is not a help center for the people who
subscribe to that club. Address the merchant as "você", and refer to their
customers in the third person ("o assinante", "o cliente").

This decides how a feature gets described. A change to the subscriber area is
documented as _what your subscribers can now resolve without calling you_, and a
change to the checkout as _what your buyers now go through_, never as a set of
instructions aimed at those people. When a page has to spell out an end-user
flow, frame it as something the merchant needs to know in order to support,
configure, or anticipate it. The practical test: if a sentence only makes sense
when read by someone who subscribes to the club, it is on the wrong site.

**Describe the platform as it is today, never how it changed.** No "antes era
assim, hoje é assado", no "essa tela mudou", no callout announcing a removed
button. A merchant reading a page wants to know what to do now; the history of
the product is our problem, not theirs. Release notes are a different genre and
they do not live in `/docs`.

**The reader is not technical.** They run a subscription club, they do not read
code. Describe what they see and click on the screen, in the words the screen
uses. Leave out anything that only makes sense from the inside: field and column
names from the database, internal timestamps, jobs, rendering, API details.
"A seção desligada não aparece na página" belongs; "a seção não é renderizada"
does not. The test is whether a detail changes what the merchant should do; if it
does not, cut it.

**No em dashes (—), anywhere in `/docs`**: body copy and frontmatter alike.
Rephrase the sentence. A colon, a comma, parentheses, or a full stop always
reads better in Portuguese than the dash. A hyphen is fine only where it is a
real hyphen (compound words), never as a dash substitute.

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
| `updatedDate`           | yes      | `YYYY-MM-DD`. Shown on the page and published as `dateModified`            |
| `navTitle`              | no       | Shorter sidebar label when the title is long                               |
| `keywords`              | no       | Indexed for search without appearing on the page                           |
| `draft`                 | no       | Visible in `astro dev`, excluded from the build                            |

**Bump `updatedDate` when you change what a page says**, not when you fix a
typo. It is what tells a reader and an answer engine that the page still
describes the product: a date that never moves reads as abandoned, and one that
moves on every commit stops meaning anything. New pages carry the date they
were written.

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

## The site as AI agents see it

The site is also published for machines, and new work has to keep that surface
in sync:

- **`/llms.txt`** (`src/pages/llms.txt.ts`) is the site map for AI assistants.
  Docs pages appear in it automatically (it is generated from the docs
  collection), so adding a `/docs` page needs nothing. Everything else is
  hand-written in that file: when you add a top-level page, a new content type,
  or change a key fact it states (the MCP endpoint, the site blurb, the pages
  under "Site"), update it in the same change.
- **Markdown twins**: every docs page and blog post is also built as plain
  markdown at `<url>.md` (`src/pages/docs/[...slug].md.ts` and
  `src/pages/blog/[...slug].md.ts`), advertised via
  `<link rel="alternate" type="text/markdown">` through the `markdownUrl` prop
  on `src/layouts/Layout.astro`. A new content collection that renders pages
  should ship the same pair: a `.md` twin endpoint and the `markdownUrl` prop.
- **`public/robots.txt`** welcomes all crawlers, AI bots explicitly included.
  Keep it that way unless told otherwise.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
