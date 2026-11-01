import { C, dot, frame, group, label, svg, text } from "../kit.mjs"

// One subscriber in the middle of three invites: two became subscribers
// (filled), one is still an invite (outlined, dashed line).
const MEMBER = { x: 90, y: 190 }
const FRIENDS = [
  { y: 100, joined: true },
  { y: 190, joined: true },
  { y: 280, joined: false },
]
const FRIEND_X = 300

const links = FRIENDS.map(
  ({ y, joined }) =>
    `<line x1="${MEMBER.x}" y1="${MEMBER.y}" x2="${FRIEND_X}" y2="${y}" stroke="${joined ? C.green : C.ink}" stroke-width="3"${joined ? "" : ' stroke-dasharray="8 7"'}/>`,
).join("")

export default {
  kicker: ["Aquisição", "Clubes de assinatura"],
  hero: ["MGM", { text: "AMIGOS", size: 92 }],
  title: "Member get member",
  subtitle: "Como a indicação de amigos faz seu clube crescer e reter mais",
  stamp: { title: "Indicado", caption: "os dois ganham" },
  illustration: group(
    label(40, 30, "INDICAÇÕES"),
    svg(0, 0, 420, 340, links),
    dot(MEMBER.x, MEMBER.y, 36, C.green),
    label(MEMBER.x, MEMBER.y + 48, "ASSINANTE", {
      bold: true,
      align: "center",
    }),
    frame(158, 128, 76, 30, C.green, text("CUPOM", { color: C.green })),
    ...FRIENDS.flatMap(({ y, joined }) => [
      joined
        ? dot(FRIEND_X, y, 22, C.green)
        : dot(FRIEND_X, y, 22, C.ink, { outline: true }),
      label(FRIEND_X + 36, y - 10, joined ? "ASSINOU" : "CONVITE", {
        color: joined ? C.green : C.ink,
      }),
    ]),
  ),
}
