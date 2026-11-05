import { C, block, frame, group, label } from "../kit.mjs"

// The monthly plan goes through twelve card approvals a year, the annual plan
// in 12x through one, at signup: the post's whole argument in two rows.
// A frame's 3px border is drawn outside its width, so each cell is CELL + 6.
const CELL = 16
const GAP = 8
const PITCH = CELL + 6 + GAP
const months = []
for (let i = 0; i < 12; i++) {
  months.push(frame(40 + i * PITCH, 92, CELL, 50, C.ink))
}
const ROW = 12 * PITCH - GAP

export default {
  kicker: ["Cobrança", "Clubes de assinatura"],
  hero: [["12", { text: "PARCELAS", mono: true }], { text: "ANUAL", size: 95 }],
  title: "Plano anual em 12x",
  subtitle: "Uma aprovação no cartão garante a receita do ano",
  stamp: { title: "Aprovado", caption: "o ano todo" },
  illustration: group(
    label(40, 30, "APROVAÇÕES NO ANO"),
    label(40, 64, "MENSAL", { bold: true }),
    ...months,
    label(40, 162, "12 APROVAÇÕES"),
    label(40, 204, "ANUAL EM 12X", { bold: true, color: C.green }),
    block(40, 232, ROW, 56, C.green),
    label(40 + ROW / 2, 248, "1 APROVAÇÃO", {
      size: 20,
      color: C.paper,
      align: "center",
      width: ROW,
    }),
  ),
}
