import { C, block, group, label } from "../kit.mjs"

// Three rows of five, the colors rotating so no column repeats.
const ORDER = [C.green, C.red, C.ink]
const grid = []
for (let row = 0; row < 3; row++) {
  for (let col = 0; col < 5; col++) {
    grid.push(
      block(40 + col * 56, 64 + row * 56, 45, 45, ORDER[(col + row * 2) % 3]),
    )
  }
}

export default {
  kicker: ["Ideias de negócio", "Clubes de assinatura"],
  hero: ["15", { text: "IDEIAS", size: 88 }],
  title: "15 ideias para criar seu clube",
  subtitle: "Modelos de negócio para inspirar sua assinatura",
  stamp: { title: "Catálogo", caption: "15 modelos" },
  illustration: group(label(40, 30, "15 CATEGORIAS"), ...grid),
}
