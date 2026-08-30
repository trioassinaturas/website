export const SITE = {
  name: "Trio Assinaturas",
  title: "Trio Assinaturas | Plataforma completa para clubes de assinatura",
  description:
    "Gerencie planos personalizados, assinantes, pagamentos e envios, tudo em um só lugar. A plataforma feita para clubes de assinatura no Brasil.",
} as const

/** Public profiles, published as the organization's `sameAs` in JSON-LD. */
export const SOCIAL = ["https://www.instagram.com/trio.assinaturas/"] as const

export const CONTACT = {
  email: "contato@trioassinaturas.com.br",
  whatsappNumber: "5551991955735",
  whatsappDisplay: "+55 51 99195-5735",
} as const

export function whatsappLink(
  message = "Olá! Quero uma demonstração da Trio Assinaturas.",
) {
  return `https://wa.me/${CONTACT.whatsappNumber}?text=${encodeURIComponent(message)}`
}
