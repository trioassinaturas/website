// @ts-check
import { defineConfig } from "astro/config"
import { unified } from "@astrojs/markdown-remark"
import rehypeExternalLinks from "rehype-external-links"
import mdx from "@astrojs/mdx"
import sitemap from "@astrojs/sitemap"
import pagefind from "./src/integrations/pagefind"

// https://astro.build/config
export default defineConfig({
  site: "https://trioassinaturas.com.br",
  integrations: [mdx(), sitemap(), pagefind()],
  markdown: {
    // External links in MDX (docs, blog, changelog) open in a new tab and carry
    // the same rel as the ones in components, so authors never set it by hand.
    rehypePlugins: [
      [
        rehypeExternalLinks,
        { target: "_blank", rel: ["noopener", "nofollow"] },
      ],
    ],
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
