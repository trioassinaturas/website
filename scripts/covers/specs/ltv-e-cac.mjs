import { C, block, group, label, line } from "../kit.mjs"

export default {
  kicker: ["Métricas", "Clubes de assinatura"],
  hero: ["LTV", { text: "CAC", color: C.red }],
  title: "LTV sobre CAC",
  subtitle:
    "A métrica que define se o seu clube de assinatura cresce com lucro",
  stamp: { title: "Saudável", caption: "≥ 3 : 1" },
  illustration: group(
    label(117, -10, "4,0×", { size: 26, align: "center" }),
    line(69, 62, 69, 36),
    line(68, 37, 167, 37),
    line(166, 36, 166, 236),
    block(40, 70, 59, 233, C.green),
    block(138, 244, 59, 59, C.red),
    label(69, 316, "LTV", { bold: true, align: "center", width: 80 }),
    label(167, 316, "CAC", { bold: true, align: "center", width: 80 }),
  ),
}
