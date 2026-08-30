// @ts-check
import { defineConfig } from "astro/config"
import { unified } from "@astrojs/markdown-remark"
import mdx from "@astrojs/mdx"
import sitemap from "@astrojs/sitemap"
import pagefind from "./src/integrations/pagefind"

// https://astro.build/config
export default defineConfig({
  site: "https://trioassinaturas.com.br",
  redirects: {
    // Shareable shortcut, also where MCP directory listings point
    "/mcp": "/docs/assistentes-de-ia/visao-geral",
  },
  integrations: [mdx(), sitemap(), pagefind()],
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
