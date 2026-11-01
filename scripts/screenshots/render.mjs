// Takes screenshots of a locally running trio app for the docs, from the specs
// in ./docs. See "Screenshots" in AGENTS.md for the whole workflow.
//
//   pnpm screenshot                       every docs spec
//   pnpm screenshot vendas/cupons         one spec, by its path
//   pnpm screenshot cupons                the same, when the name is unique
//   pnpm screenshot cupons formulario-brinde   one shot of that spec
//
// trio has to be running (`bin/dev` in the app repo) with the development
// seeds loaded: the store is "Café Aura", subdomain `aura`, and every name and
// email in it is fake, so the images are safe to publish.
//
// One spec file per docs page, at the same path as its content:
// `docs/vendas/cupons.mjs` is the images of src/content/docs/vendas/cupons.mdx.
// A spec exports a list of shots, and each shot writes
// `src/assets/docs/<spec path>/<shot name>.png`. Shared helpers for specs live
// in ./helpers.mjs.
//
// Changelog images are snapshots of the launch and are never retaken, so no
// changelog spec is kept. To give a new entry an image, write a spec at
// `changelog/<entry>.mjs` (it writes to `src/assets/changelog/<entry>/`), run
// `pnpm screenshot <entry>` once, commit the PNG and delete the spec.
//
// A shot has:
//
//   name     file name of the image, e.g. "formulario-brinde"
//   host     which app: "dashboard" (default), "checkout", "assinantes" or
//            "loja" (the store itself)
//   path     the page to open, e.g. "/coupons/new"
//   viewport optional { width, height }; defaults to 1440x900
//   prepare  optional async (page) => {}: clicks and typing before the shot
//   target   optional selector or (page) => Locator: crop to that element.
//            Without it the shot is the browser window as the merchant sees
//            it, sidebar included
//   grow     false to keep the window at `viewport` for a crop; by default
//            it grows until the whole page is laid out, which also
//            stretches full-height elements such as the sidebar
//   mask     optional selectors to paint over (dates, "há 3 minutos")
//   auth     who is signed in: "dashboard" (default, the store owner),
//            "assinante" (a subscriber) or false (signed out)
//
// Override the defaults with TRIO_PORT, TRIO_SUBDOMAIN, TRIO_EMAIL,
// TRIO_PASSWORD and TRIO_SUBSCRIBER_EMAIL. Seeded subscribers share the
// owner's password.

import { mkdir, readdir } from "node:fs/promises"
import { dirname, join, relative } from "node:path"
import { fileURLToPath } from "node:url"
import { chromium } from "playwright"

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, "../..")
const KINDS = ["docs", "changelog"]

const PORT = process.env.TRIO_PORT ?? "5000"
const SUBDOMAIN = process.env.TRIO_SUBDOMAIN ?? "aura"
const EMAIL = process.env.TRIO_EMAIL ?? "owner@cafeaura.com.br"
const PASSWORD = process.env.TRIO_PASSWORD ?? "password123"
const SUBSCRIBER_EMAIL =
  process.env.TRIO_SUBSCRIBER_EMAIL ?? "marina.albuquerque@email.com"

const VIEWPORT = { width: 1440, height: 900 }
// Space kept around a cropped element, in CSS pixels.
const PADDING = 16

function url(host, path) {
  const prefix = host === "loja" ? "" : `${host}.`
  return `http://${prefix}${SUBDOMAIN}.localhost:${PORT}${path}`
}

const LOGINS = {
  dashboard: { host: "dashboard", email: EMAIL },
  assinante: { host: "assinantes", email: SUBSCRIBER_EMAIL },
}

async function signIn(context, { host, email }) {
  const page = await context.newPage()
  await page.goto(url(host, "/session/new"))
  await page.fill('input[name="email_address"]', email)
  await page.fill('input[name="password"]', PASSWORD)
  await Promise.all([
    page.waitForURL((u) => !u.pathname.startsWith("/session")),
    page.click('input[type="submit"]'),
  ])
  await page.close()
}

async function newContext(browser, viewport) {
  return browser.newContext({
    viewport,
    deviceScaleFactor: 2,
    colorScheme: "light",
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
    reducedMotion: "reduce",
  })
}

// Local addresses the app prints on screen (the MCP endpoint, static file
// links), and what they are in production. Swapped in the page's text and
// form fields before every shot, so no image shows localhost.
const PUBLIC_URLS = [
  [/http:\/\/mcp\.localhost:\d+/g, "https://mcp.trioassinaturas.com.br"],
  [
    new RegExp(`http://([a-z]+\\.)?${SUBDOMAIN}\\.localhost:\\d+`, "g"),
    "https://$1cafeaura.com.br",
  ],
]

async function showPublicUrls(page) {
  await page.evaluate(
    (rules) => {
      const swap = (text) =>
        rules.reduce(
          (out, [source, flags, to]) =>
            out.replace(new RegExp(source, flags), to),
          text,
        )
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
      )
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        if (node.nodeValue.includes("localhost"))
          node.nodeValue = swap(node.nodeValue)
      }
      for (const field of document.querySelectorAll("input, textarea")) {
        if (field.value.includes("localhost")) field.value = swap(field.value)
      }
    },
    PUBLIC_URLS.map(([re, to]) => [re.source, re.flags, to]),
  )
}

// The dashboard scrolls inside an inner container, not the page, so a
// full-page capture is only one window tall. Grow the window until nothing
// scrolls, and the whole page is laid out at once.
async function growToFit(page, viewport) {
  const extra = await page.evaluate(() => {
    let most = 0
    for (const el of document.querySelectorAll("*")) {
      const { overflowY } = getComputedStyle(el)
      if (/auto|scroll/.test(overflowY)) {
        most = Math.max(most, el.scrollHeight - el.clientHeight)
      }
    }
    return Math.max(
      most,
      document.documentElement.scrollHeight - window.innerHeight,
    )
  })
  if (extra > 0) {
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height + extra,
    })
  }
}

// Signs in once per kind of user and hands back the session cookies.
const sessions = new Map()
async function cookiesFor(browser, who) {
  if (!sessions.has(who)) {
    const login = LOGINS[who]
    if (!login) throw new Error(`Unknown auth "${who}"`)
    const context = await newContext(browser, VIEWPORT)
    try {
      await signIn(context, login)
    } catch (err) {
      throw new Error(
        `Could not sign in as ${login.email} at ${url(login.host, "/session/new")}. ` +
          "Is trio running with the development seeds loaded?",
        { cause: err },
      )
    }
    sessions.set(who, (await context.storageState()).cookies)
    await context.close()
  }
  return sessions.get(who)
}

async function shoot(browser, outDir, label, shot) {
  const viewport = shot.viewport ?? VIEWPORT
  const context = await newContext(browser, viewport)
  const who = shot.auth ?? "dashboard"
  if (who) await context.addCookies(await cookiesFor(browser, who))
  const page = await context.newPage()

  const response = await page.goto(url(shot.host ?? "dashboard", shot.path), {
    waitUntil: "networkidle",
  })
  if (!response?.ok()) {
    throw new Error(`${label}: ${shot.path} answered ${response?.status()}`)
  }
  if (shot.prepare) await shot.prepare(page)
  await showPublicUrls(page)
  await page.evaluate(() => document.fonts.ready)

  const options = {
    path: join(outDir, `${shot.name}.png`),
    animations: "disabled",
    caret: "hide",
    mask: (shot.mask ?? []).map((s) => page.locator(s)),
  }
  if (shot.target) {
    if (shot.grow !== false) await growToFit(page, viewport)
    const target =
      typeof shot.target === "function"
        ? shot.target(page)
        : page.locator(shot.target).first()
    const box = await target.boundingBox()
    if (!box) throw new Error(`${label}: target is not visible`)
    const size = page.viewportSize()
    const x = Math.max(0, box.x - PADDING)
    const y = Math.max(0, box.y - PADDING)
    await page.screenshot({
      ...options,
      clip: {
        x,
        y,
        width: Math.min(size.width, box.x + box.width + PADDING) - x,
        height: Math.min(size.height, box.y + box.height + PADDING) - y,
      },
    })
  } else {
    await page.screenshot(options)
  }
  await context.close()
}

async function specsToRun(filter, shotFilter) {
  const kinds = KINDS.includes(filter) ? [filter] : KINDS
  const specs = []
  for (const kind of kinds) {
    const dir = join(here, kind)
    const files = (
      await readdir(dir, { recursive: true }).catch(() => [])
    ).filter((f) => f.endsWith(".mjs"))
    for (const file of files.sort()) {
      const spec = relative(dir, join(dir, file)).replace(/\.mjs$/, "")
      const matches =
        !filter ||
        KINDS.includes(filter) ||
        spec === filter ||
        spec.endsWith(`/${filter}`)
      if (!matches) continue
      const { default: shots } = await import(join(dir, file))
      for (const shot of shots) {
        if (shotFilter && shot.name !== shotFilter) continue
        specs.push({ kind, spec, shot })
      }
    }
  }
  if (filter && specs.length === 0) {
    throw new Error(`Nothing matches "${[filter, shotFilter].join(" ")}"`)
  }
  return specs
}

async function main() {
  const [filter, shotFilter] = process.argv.slice(2)
  const jobs = await specsToRun(filter, shotFilter)

  // Date inputs follow the browser's own locale, not the page's: only the
  // full Chromium build, told pt-BR on the command line and in the
  // environment, shows them as dd/mm/aaaa.
  const browser = await chromium.launch({
    channel: "chromium",
    args: ["--lang=pt-BR"],
    env: { ...process.env, LANG: "pt_BR.UTF-8", LANGUAGE: "pt_BR" },
  })
  try {
    for (const { kind, spec, shot } of jobs) {
      const outDir = join(root, "src/assets", kind, spec)
      await mkdir(outDir, { recursive: true })
      const label = `${kind}/${spec}/${shot.name}`
      await shoot(browser, outDir, label, shot)
      console.log(`✓ src/assets/${label}.png`)
    }
  } finally {
    await browser.close()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
