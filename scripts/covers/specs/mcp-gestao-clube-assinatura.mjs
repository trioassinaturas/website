import { C, block, frame, group, label, line, arrow } from "../kit.mjs"

// The club's data flows through MCP to the AI agent, one way only: the
// assistant reads, it does not act. The answer side is drawn as text lines.
const CLUB = { x: 40, w: 130 }
const AGENT = { x: 250, w: 130 }
const TOP = 92
const HEIGHT = 200
const ROWS = ["ASSINANTES", "COBRANÇAS", "PEDIDOS"]
const ANSWER = [96, 74, 88, 52]

export default {
  kicker: ["IA", "Clubes de assinatura"],
  hero: ["MCP", { text: "AGENTE", size: 90 }],
  title: "MCP na prática",
  subtitle: "Pergunte ao seu clube em linguagem natural",
  stamp: { title: "Só leitura", caption: "sem ações" },
  illustration: group(
    label(40, 58, "CONEXÃO"),
    frame(CLUB.x, TOP, CLUB.w, HEIGHT, C.ink),
    label(CLUB.x + CLUB.w / 2, TOP + 18, "CLUBE", {
      bold: true,
      align: "center",
      width: CLUB.w,
    }),
    ...ROWS.flatMap((row, i) => [
      line(
        CLUB.x + 14,
        TOP + 66 + i * 44,
        CLUB.x + CLUB.w - 14,
        TOP + 66 + i * 44,
        C.rule,
      ),
      label(CLUB.x + CLUB.w / 2, TOP + 74 + i * 44, row, {
        align: "center",
        width: CLUB.w,
      }),
    ]),
    line(CLUB.x + CLUB.w, TOP + HEIGHT / 2, 190, TOP + HEIGHT / 2, C.ink, 3),
    block(190, TOP + HEIGHT / 2 - 20, 44, 40, C.ink),
    label(212, TOP + HEIGHT / 2 - 10, "MCP", {
      bold: true,
      color: C.paper,
      align: "center",
      width: 44,
    }),
    ...arrow(234, AGENT.x, TOP + HEIGHT / 2),
    frame(AGENT.x, TOP, AGENT.w, HEIGHT, C.green),
    label(AGENT.x + AGENT.w / 2, TOP + 18, "AGENTE DE IA", {
      bold: true,
      color: C.green,
      align: "center",
      width: AGENT.w,
    }),
    ...ANSWER.map((w, i) =>
      block(AGENT.x + 17, TOP + 72 + i * 28, w, 10, C.green),
    ),
  ),
}
