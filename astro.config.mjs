// @ts-check
import { defineConfig } from "astro/config"
import { unified } from "@astrojs/markdown-remark"
import rehypeExternalLinks from "rehype-external-links"
import mdx from "@astrojs/mdx"
import sitemap from "@astrojs/sitemap"
import og from "astro-og"
import pagefind from "./src/integrations/pagefind"

// https://astro.build/config
export default defineConfig({
  site: "https://trioassinaturas.com.br",
  // astro-og is a dev toolbar app that previews the Open Graph card for the
  // current page; it adds nothing to the production build.
  integrations: [mdx(), sitemap(), pagefind(), og()],
  markdown: {
    shikiConfig: {
      // The site is light mode only, so a single light theme is enough.
      theme: "github-light",
      wrap: true,
    },
    processor: unified({
      // External links in MDX (docs, blog, changelog) open in a new tab and
      // carry the same rel as the ones in components, so authors never set it
      // by hand.
      rehypePlugins: [
        [
          rehypeExternalLinks,
          { target: "_blank", rel: ["noopener", "nofollow"] },
        ],
      ],
      // GFM footnote labels default to English.
      remarkRehype: {
        footnoteLabel: "Notas de rodapé",
        footnoteBackLabel: "Voltar ao conteúdo",
      },
    }),
  },
})
