// The shared cover frame: lined notebook paper, a kicker, the hero words, a
// title and subtitle on the left, an optional stamp top right, and a per-post
// illustration in the right-hand slot. Everything a spec controls is passed
// in; everything that makes the covers look like one series lives here.

import { h, C, FONT_SANS, FONT_MONO } from "./kit.mjs"

export const WIDTH = 1200
export const HEIGHT = 630

/** The illustration slot, in cover pixels. Specs draw inside a box this size. */
export const SLOT = { left: 700, top: 150, width: 420, height: 340 }

const LINE_GAP = 30
const MARGIN_X = 44
const TEXT_X = 132

function paper() {
  const rules = []
  for (let y = 0; y < HEIGHT; y += LINE_GAP) {
    rules.push(
      h("div", {
        position: "absolute",
        left: 0,
        top: y,
        width: WIDTH,
        height: 1,
        backgroundColor: C.rule,
      }),
    )
  }
  const holes = []
  for (let y = 16; y < HEIGHT - 20; y += 13) {
    holes.push(
      h("div", {
        position: "absolute",
        left: 32,
        top: y,
        width: 5,
        height: 5,
        borderRadius: 5,
        backgroundColor: C.hole,
      }),
    )
  }
  const margin = h("div", {
    position: "absolute",
    left: MARGIN_X,
    top: 0,
    width: 1,
    height: HEIGHT,
    backgroundColor: C.rule,
  })
  return [...rules, margin, ...holes]
}

function kicker(parts) {
  const items = []
  parts.forEach((part, i) => {
    if (i > 0) items.push(h("div", { margin: "0 34px" }, "·"))
    items.push(h("div", {}, part.toUpperCase()))
  })
  // The rule has a fixed length; a long kicker runs past it, as on paper.
  return [
    h(
      "div",
      {
        position: "absolute",
        left: TEXT_X,
        top: 38,
        fontFamily: FONT_MONO,
        fontSize: 19,
        color: C.ink,
        whiteSpace: "nowrap",
      },
      ...items,
    ),
    h("div", {
      position: "absolute",
      left: TEXT_X,
      top: 71,
      width: 471,
      height: 2,
      backgroundColor: C.ink,
    }),
  ]
}

/**
 * One hero line is a string or a list of segments. A segment is a string or
 * `{ text, color?, mono?, size? }`; a mono segment is the small label that
 * sits on the baseline next to a big word ("5 DICAS"). `size` is the font
 * size of a big word: 107 by default, smaller for long words so the line
 * stays under ~340px (CHURN is 95, IDEIAS 88).
 */
function heroLine(line, defaultColor, hang = false) {
  const segments = (Array.isArray(line) ? line : [line]).map((s) =>
    typeof s === "string" ? { text: s } : s,
  )
  return h(
    "div",
    // The top line sits on the rule; the bottom one hangs from it, so the
    // gap to the rule stays the same whatever the font size.
    {
      display: "flex",
      alignItems: hang ? "flex-start" : "flex-end",
      height: 104,
    },
    ...segments.map((s) =>
      s.mono
        ? h(
            "div",
            {
              fontFamily: FONT_MONO,
              fontWeight: 700,
              fontSize: 38,
              color: s.color ?? defaultColor,
              marginLeft: 18,
              marginBottom: 6,
            },
            s.text,
          )
        : h(
            "div",
            {
              fontFamily: FONT_SANS,
              fontWeight: 800,
              fontSize: s.size ?? 107,
              letterSpacing: -2,
              lineHeight: 1,
              color: s.color ?? defaultColor,
              marginBottom: hang ? 0 : -0.12 * (s.size ?? 107),
              marginTop: hang ? -0.1 * (s.size ?? 107) : 0,
            },
            s.text,
          ),
    ),
  )
}

function hero([top, bottom]) {
  return h(
    "div",
    {
      position: "absolute",
      left: TEXT_X,
      top: 96,
      display: "flex",
      flexDirection: "column",
    },
    heroLine(top, C.green),
    h("div", {
      height: 7,
      minWidth: 280,
      backgroundColor: C.ink,
      marginTop: 4,
    }),
    h("div", { height: 29 }),
    heroLine(bottom, C.ink, true),
  )
}

function caption(title, subtitle) {
  return h(
    "div",
    {
      position: "absolute",
      left: TEXT_X,
      top: 484,
      display: "flex",
      flexDirection: "column",
      color: C.ink,
    },
    h(
      "div",
      {
        fontFamily: FONT_SANS,
        fontWeight: 700,
        fontSize: 46,
        letterSpacing: -0.5,
        lineHeight: 1.2,
      },
      title,
    ),
    h(
      "div",
      {
        fontFamily: FONT_SANS,
        fontWeight: 400,
        fontSize: 22,
        letterSpacing: 0.3,
        marginTop: 8,
      },
      subtitle,
    ),
  )
}

function stamp({ title, caption: small }) {
  return h(
    "div",
    {
      position: "absolute",
      left: 918,
      top: 56,
      width: 154,
      height: 154,
      borderRadius: 154,
      border: `3px dashed ${C.green}`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      color: C.green,
      fontFamily: FONT_MONO,
      transform: "rotate(8deg)",
    },
    h("div", { fontWeight: 700, fontSize: 19 }, title.toUpperCase()),
    small ? h("div", { fontSize: 13, marginTop: 6 }, small) : null,
  )
}

/** Builds the satori tree for one spec. */
export function cover(spec) {
  return h(
    "div",
    {
      position: "relative",
      display: "flex",
      width: WIDTH,
      height: HEIGHT,
      backgroundColor: C.paper,
    },
    ...paper(),
    kicker(spec.kicker),
    hero(spec.hero),
    caption(spec.title, spec.subtitle),
    h(
      "div",
      {
        position: "absolute",
        left: SLOT.left,
        top: SLOT.top,
        width: SLOT.width,
        height: SLOT.height,
        display: "flex",
      },
      spec.illustration ?? null,
    ),
    // The stamp goes last so it overlaps the illustration, like a real one.
    spec.stamp ? stamp(spec.stamp) : null,
  )
}
