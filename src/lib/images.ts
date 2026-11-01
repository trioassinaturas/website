import { posix } from "node:path"

/**
 * Every image an MDX body can point at, keyed by its path from the project
 * root ("/src/assets/docs/cupons/formulario-brinde.png"). Importing them is
 * what gives each one the URL it is built to.
 */
const images = import.meta.glob<{ default: ImageMetadata }>(
  "/src/assets/**/*.{png,jpg,jpeg,webp,gif,svg}",
  { eager: true },
)

const MARKDOWN_IMAGE = /(!\[[^\]]*\]\()([^)\s]+)((?:\s+"[^"]*")?\))/g

/**
 * Rewrites the relative image paths of a raw MDX body to absolute URLs, for
 * the copies of a page that leave the rendered site: the `.md` twins and the
 * RSS feeds. In the page itself Astro resolves `../../assets/x.png` at build
 * time, but the raw body still carries that path, which means nothing to a
 * reader or an assistant fetching the markdown.
 *
 * `filePath` is the entry's source file from the project root, as the glob
 * loader reports it (`src/content/docs/vendas/cupons.mdx`).
 */
export function absoluteImages(
  markdown: string,
  filePath: string | undefined,
  base: string,
): string {
  if (!filePath) return markdown
  const dir = posix.dirname(`/${filePath}`)
  return markdown.replace(MARKDOWN_IMAGE, (whole, open, src, close) => {
    if (/^(https?:)?\/\//.test(src) || src.startsWith("/")) return whole
    const image = images[posix.normalize(posix.join(dir, src))]
    if (!image) {
      throw new Error(`${filePath}: no image at ${src}`)
    }
    return `${open}${new URL(image.default.src, base).href}${close}`
  })
}
