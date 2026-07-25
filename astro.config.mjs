// @ts-check
import { defineConfig } from "astro/config"
import { unified } from "@astrojs/markdown-remark"
import mdx from "@astrojs/mdx"

// https://astro.build/config
export default defineConfig({
  // Needed to build absolute canonical/og:image URLs.
  site: "https://trioassinaturas.com.br",
  integrations: [mdx()],
  markdown: {
    shikiConfig: {
      // The site is light mode only, so a single light theme is enough.
      theme: "github-light",
      wrap: true,
    },
    processor: unified({
      // GFM footnote labels default to English.
      remarkRehype: {
        footnoteLabel: "Notas de rodapé",
        footnoteBackLabel: "Voltar ao conteúdo",
      },
    }),
  },
})
