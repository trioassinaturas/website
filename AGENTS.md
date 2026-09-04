## Conventions

Code is written in English: comments, JSDoc, identifiers, CSS class names, route
paths and commit messages. Only user-facing content (copy, `alt` text,
`aria-label`, blog posts, collection data) is in Portuguese.

Note: `/sobre` predates this convention and is still in Portuguese.

In `.astro` templates, a line break between an inline tag and the text next to
it renders as **no space**: `</a>` on one line and `para` on the next comes out
as `RSSpara`. Keep the space on the same line as the tag (`</a> para receber`),
or end the text line with `{" "}` when the tag opens on the next line
(`escreva para{" "}`). Prettier's `htmlWhitespaceSensitivity` is pinned to
`css` in `.prettierrc.json` so it preserves both forms instead of reflowing
them.

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

**Answer first, then explain.** Assume every paragraph will be read alone,
because increasingly it is: a page reaches someone as one lifted paragraph in an
assistant's answer, with no title above it and no section before it. So the
first sentence of the page says what the thing _is_ or _does_ ("A tabela de
frete diz quanto custa entregar em cada faixa de CEP"), never what it is not,
what changed, or what you are about to explain. The first sentence under a
heading does the same for that section, and it names its subject instead of
pointing back at one: "O cupom expira na data de validade", not "Ela expira
nessa data". No heading sits directly on top of a table, a list or a `Callout`
with nothing in between: say what the reader is looking at before showing it.

This is also why headings are written as the thing the reader wants ("O formato
do CSV"), not as clever labels. Turning every heading into a literal question is
not the goal and usually reads worse in Portuguese.

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

## The changelog

`/novidades` lists what shipped, newest first, for the merchant. It is the one
place where "what changed" belongs: `/docs` keeps describing the platform as it
is today, and an entry links to the docs page that describes the feature instead
of repeating it.

One entry per launch, in `src/content/changelog/<YYYY-MM-DD>-<slug>.mdx`. The
date is the day the change went live in the app (the merge to `main` in the app
repo), not the day the entry was written. The slug is the anchor on the page
(`/novidades#<slug>`), so keep it stable and unique. Frontmatter: `title`,
`date`, optional `docs` (a list of `{ label, href }`) and `draft`. The body is
one or two short paragraphs in Portuguese, written as what the merchant can do
now, under the same rules as `/docs`: the reader is not technical, no em dashes.
Internal work (performance, dependencies, refactors, security probes) gets no
entry.

The page also ships as `/novidades.md` (`src/pages/novidades.md.ts`) and as an
RSS feed at `/novidades/rss.xml`, is listed under "Site" in `llms.txt`, and is
linked from the footer and from the docs sidebar and index, never from the
navbar. `/changelog` redirects to it.

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
  `src/pages/blog/[...slug].md.ts`), as is the changelog
  (`src/pages/novidades.md.ts`), advertised via
  `<link rel="alternate" type="text/markdown">` through the `markdownUrl` prop
  on `src/layouts/Layout.astro`. The same pages also answer
  `Accept: text/markdown` with the twin (plus `Vary: Accept`), via the
  Cloudflare Pages Functions in `functions/`, which deploy automatically with
  the site. A new content collection that renders pages should ship the same
  set: a `.md` twin endpoint, the `markdownUrl` prop, and its route re-exported
  in `functions/`.
- **JSON-LD**: every page states what it is in structured data. The entities are
  built in `src/lib/schema.ts` and passed to the `schema` prop on
  `src/layouts/Layout.astro`, which emits them as one `@graph`. A new page type
  needs its own entity there; a new page of an existing type needs nothing.
  Build the entity from data the page already renders, and never describe in
  JSON-LD something the reader cannot see: structured data that promises more
  than the page delivers is what gets a site dropped rather than cited. The FAQ
  at `src/pages/perguntas-frequentes.astro` shows the shape, with one array
  feeding both the markup and the `FAQPage` entity.
- **RSS feeds**: the blog (`/blog/rss.xml`, also served at the root `/rss.xml`)
  and the changelog (`/novidades/rss.xml`) each have a feed, declared once in `src/lib/feeds.ts`
  and advertised with `<link rel="alternate" type="application/rss+xml">`
  through the `feed` prop on `src/layouts/Layout.astro`, on the index and on
  every page of that stream; the home page advertises the root `/rss.xml`. Blog items carry the description and link; the
  changelog items carry the whole entry, since a changelog is read in the
  reader. A new dated stream ships a feed the same way.
- **`public/robots.txt`** welcomes all crawlers, AI bots explicitly included.
  Keep it that way unless told otherwise.
- **`public/openapi.json`** declares no endpoints on purpose: it exists to tell
  agents probing for a REST API that there isn't one and that the MCP server is
  the integration surface. If the MCP endpoint or the docs URLs it names ever
  change, update it together with `llms.txt`.
- **`public/.well-known/mcp/manifest.json`** describes the MCP server for
  agents probing this domain, and `public/_redirects` forwards the OAuth
  `.well-known` paths to the real metadata on `mcp.trioassinaturas.com.br`,
  where it is served by the MCP server itself (the source of truth for
  endpoints and scopes). Anything naming that domain changes together.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
