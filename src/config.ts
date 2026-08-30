export const SITE = {
  name: "Trio Assinaturas",
  title: "Trio Assinaturas | Plataforma completa para clubes de assinatura",
  description:
    "Gerencie planos personalizados, assinantes, pagamentos e envios, tudo em um só lugar. A plataforma feita para clubes de assinatura no Brasil.",
} as const

/**
 * Public profiles. Linked from the footer and published as the organization's
 * `sameAs` in JSON-LD: the claim carries more weight when the site actually
 * links to the profile it names, so both come from this one list.
 */
export const SOCIAL = [
  { label: "Instagram", url: "https://www.instagram.com/trio.assinaturas/" },
  {
    label: "LinkedIn",
    url: "https://www.linkedin.com/company/trioassinaturas",
  },
] as const

/**
 * The registered company behind the brand. Published in JSON-LD, where it is
 * what ties this site to a specific company rather than to a name someone
 * else could also use. Both fields are public record.
 */
export const COMPANY = {
  legalName: "TRIO TECNOLOGIA LTDA - ME",
  cnpj: "60.175.299/0001-47",
  city: "Porto Alegre",
  state: "RS",
  country: "BR",
} as const

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
