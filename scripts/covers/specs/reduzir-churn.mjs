import { C, arrow, frame, group, label } from "../kit.mjs"

export default {
  kicker: ["Retenção", "Clubes de assinatura"],
  hero: [
    ["5", { text: "DICAS", mono: true }],
    { text: "CHURN", color: C.red, size: 95 },
  ],
  title: "Reduza o Churn",
  subtitle: "Estratégias práticas para reter mais assinantes",
  stamp: { title: "Renovado", caption: "assinante ativo" },
  illustration: group(
    label(40, 30, "IMPACTO POTENCIAL"),
    frame(40, 64, 130, 170, C.red),
    label(105, 116, "-20%", { size: 34, color: C.red, align: "center" }),
    label(105, 198, "CHURN", { color: C.red, align: "center" }),
    ...arrow(184, 226, 149),
    frame(240, 64, 130, 170, C.green),
    label(305, 116, "3×", { size: 34, color: C.green, align: "center" }),
    label(305, 198, "RETENÇÃO", { color: C.green, align: "center" }),
  ),
}
