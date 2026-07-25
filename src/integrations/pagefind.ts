import { readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import type { AstroIntegration } from "astro"

// Imported statically: by the time `astro:build:done` runs, Vite's module
// runner is closed and a dynamic import would fail. The indexer binary itself
// is only spawned on the first `createIndex` call, so `astro dev` pays nothing.
import { createIndex, close } from "pagefind"

interface PagefindEntry {
  languages: Record<string, { page_count: number }>
}

/** Total pages kept in the index, summed across languages. */
async function indexedPageCount(outputPath: string): Promise<number> {
  const entry = path.join(outputPath, "pagefind-entry.json")
  const { languages } = JSON.parse(
    await readFile(entry, "utf8"),
  ) as PagefindEntry

  return Object.values(languages).reduce(
    (total, language) => total + language.page_count,
    0,
  )
}

/**
 * Builds the Pagefind search index from the generated HTML into `dist/pagefind/`,
 * which the docs search UI loads at runtime from `/pagefind/pagefind.js`.
 *
 * Only elements carrying `data-pagefind-body` are indexed. Since the docs layout
 * is the only place that attribute appears, the index stays scoped to the docs.
 *
 * The index is derived from built HTML, so it does not exist under `astro dev`.
 * Use `pnpm build && pnpm preview` to exercise search locally.
 */
export default function pagefind(): AstroIntegration {
  return {
    name: "pagefind",
    hooks: {
      "astro:build:done": async ({ dir, logger }) => {
        const site = fileURLToPath(dir)

        try {
          const { index, errors: createErrors } = await createIndex({
            // `<html lang="pt-BR">` would otherwise build a `pt-br` index, and
            // the runtime expects the default `pt` one.
            forceLanguage: "pt",
          })
          if (!index) throw new Error(createErrors.join("\n"))

          const { errors: addErrors } = await index.addDirectory({ path: site })
          if (addErrors.length > 0) throw new Error(addErrors.join("\n"))

          const outputPath = path.join(site, "pagefind")
          const { errors: writeErrors } = await index.writeFiles({ outputPath })
          if (writeErrors.length > 0) throw new Error(writeErrors.join("\n"))

          // `addDirectory` reports files walked, not pages kept, so the real
          // count comes from the manifest that was just written.
          const indexed = await indexedPageCount(outputPath)
          logger.info(`Indexed ${indexed} page(s) for search`)

          if (indexed === 0) {
            logger.warn(
              "No pages were indexed. Check that the docs layout still renders `data-pagefind-body`.",
            )
          }
        } finally {
          // Stops the Rust binary. Without this the build process can hang.
          await close()
        }
      },
    },
  }
}
