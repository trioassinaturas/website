// The building blocks a cover spec draws its illustration with: the palette,
// `h()` for satori nodes, and a few primitives positioned inside the
// illustration slot (420x340, origin top left). Reach for these before
// inventing new shapes, so every cover keeps the same visual vocabulary:
// flat blocks, 3px outlines, mono labels.

export const C = {
  paper: "#e9f0e9",
  rule: "#d8e2d9",
  hole: "#c8d5c9",
  ink: "#16232e",
  green: "#1b6344",
  red: "#a33628",
}

export const FONT_SANS = "Work Sans"
export const FONT_MONO = "IBM Plex Mono"

/**
 * Creates a satori node. `style` is satori's CSS subset (flexbox, absolute
 * positioning, borders, transforms); children are nodes, strings or null.
 */
export function h(type, style = {}, ...children) {
  const kids = children.flat().filter((c) => c !== null && c !== undefined)
  const isText = kids.length > 0 && kids.every((c) => typeof c === "string")
  const props = { style: { display: "flex", ...style } }
  if (type === "img" && style.src) {
    props.src = style.src
    delete props.style.src
  }
  props.children = isText ? kids.join("") : kids
  return { type, props }
}

const at = (x, y) => ({ position: "absolute", left: x, top: y })

/** A filled rectangle. */
export const block = (x, y, w, hgt, color = C.green) =>
  h("div", { ...at(x, y), width: w, height: hgt, backgroundColor: color })

/**
 * An outlined rectangle filled with paper; children are centered in a column
 * (use `text()` for a label inside it).
 */
export const frame = (x, y, w, hgt, color = C.ink, ...children) =>
  h(
    "div",
    {
      ...at(x, y),
      width: w,
      height: hgt,
      border: `3px solid ${color}`,
      backgroundColor: C.paper,
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    },
    ...children,
  )

/**
 * A circle, filled or (with `outline: true`) stroked. An outlined circle is
 * filled with paper, so it hides the ends of lines drawn underneath it.
 */
export const dot = (cx, cy, r, color = C.green, { outline = false } = {}) =>
  h("div", {
    ...at(cx - r, cy - r),
    width: r * 2,
    height: r * 2,
    borderRadius: r * 2,
    ...(outline
      ? { border: `3px solid ${color}`, backgroundColor: C.paper }
      : { backgroundColor: color }),
  })

/**
 * A mono label. `size` 15 is the small caps label ("LTV", "15 CATEGORIAS"),
 * 34 is a big figure ("4,0×", "-20%"). `align: "center"` centers it on x.
 */
export const label = (
  x,
  y,
  text,
  {
    size = 15,
    color = C.ink,
    bold = size > 20,
    align = "left",
    width = 200,
  } = {},
) =>
  h(
    "div",
    {
      ...at(align === "center" ? x - width / 2 : x, y),
      width,
      justifyContent: align === "center" ? "center" : "flex-start",
      fontFamily: FONT_MONO,
      fontSize: size,
      fontWeight: bold ? 700 : 400,
      color,
    },
    text,
  )

/** Inline mono text for inside a `frame()`, with the same sizes as `label()`. */
export const text = (
  content,
  { size = 15, color = C.ink, bold = size > 20 } = {},
) =>
  h(
    "div",
    {
      fontFamily: FONT_MONO,
      fontSize: size,
      fontWeight: bold ? 700 : 400,
      color,
    },
    content,
  )

/** A horizontal or vertical line segment (axis-aligned only). */
export const line = (x1, y1, x2, y2, color = C.ink, width = 2) =>
  x1 === x2
    ? block(x1 - width / 2, Math.min(y1, y2), width, Math.abs(y2 - y1), color)
    : block(Math.min(x1, x2), y1 - width / 2, Math.abs(x2 - x1), width, color)

/** A right-pointing arrow from x1 to x2 at height y. */
export const arrow = (x1, x2, y, color = C.ink) => [
  line(x1, y, x2 - 8, y, color, 3),
  h("div", {
    ...at(x2 - 12, y - 7),
    width: 0,
    height: 0,
    borderTop: "7px solid transparent",
    borderBottom: "7px solid transparent",
    borderLeft: `12px solid ${color}`,
  }),
]

/**
 * Raw SVG for shapes the primitives can't make (curves, diagonals, icons).
 * Keep text out of it: SVG text renders with system fonts, not the cover's.
 */
export const svg = (x, y, w, hgt, markup) =>
  h("img", {
    ...at(x, y),
    width: w,
    height: hgt,
    src:
      "data:image/svg+xml;utf8," +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${hgt}" viewBox="0 0 ${w} ${hgt}">${markup}</svg>`,
      ),
  })

/** Groups primitives into one node for `illustration`. */
export const group = (...children) =>
  h("div", { position: "relative", width: 420, height: 340 }, ...children)
