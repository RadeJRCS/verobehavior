import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS })
}

type Priority = 'HIGH' | 'MED' | 'LOW'
type Check = {
  id: string
  label: string
  weight: number
  status: 'pass' | 'fail'
  priority: Priority | null
  finding: string
  recommendation: string | null
}

function collectTypes(node: unknown, out: string[]) {
  if (Array.isArray(node)) { node.forEach((n) => collectTypes(n, out)); return }
  if (node && typeof node === 'object') {
    const obj = node as Record<string, unknown>
    const t = obj['@type']
    if (typeof t === 'string') out.push(t)
    else if (Array.isArray(t)) t.forEach((x) => typeof x === 'string' && out.push(x))
    if (obj['@graph']) collectTypes(obj['@graph'], out)
  }
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Missing url' }, { status: 400, headers: CORS })
    }

    let html = ''
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; VeroBehaviorGEOAudit/1.0)' },
        redirect: 'follow',
      })
      html = await res.text()
    } catch {
      return NextResponse.json({ error: 'Could not fetch this URL. Make sure it is correct and publicly accessible.' }, { status: 400, headers: CORS })
    }

    // --- Extract raw signals ---
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i)
    const title = titleMatch ? titleMatch[1].trim() : ''

    const metaDescMatch =
      html.match(/<meta\s+[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
      html.match(/<meta\s+[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i)
    const metaDesc = metaDescMatch ? metaDescMatch[1].trim() : ''

    const ogTitle = /<meta\s+[^>]*property=["']og:title["']/i.test(html)
    const ogDesc = /<meta\s+[^>]*property=["']og:description["']/i.test(html)

    const h1Count = (html.match(/<h1[\s>]/gi) || []).length

    const ldBlocks = Array.from(html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)).map((m) => m[1])
    const types: string[] = []
    for (const block of ldBlocks) {
      try {
        collectTypes(JSON.parse(block.trim()), types)
      } catch {}
    }
    const hasType = (...names: string[]) => types.some((t) => names.some((n) => t.toLowerCase() === n.toLowerCase()))

    const headingTexts = Array.from(html.matchAll(/<(h2|h3|dt|summary|button)[^>]*>([\s\S]*?)<\/\1>/gi)).map((m) => m[2].replace(/<[^>]+>/g, ''))
    const questionCount = headingTexts.filter((t) => t.includes('?')).length
    const hasFaqContent = questionCount >= 2

    const hasPriceContent = /[$€£]\s?\d|\d+[.,]\d{2}\s?(USD|EUR|GBP)/i.test(html) || /class=["'][^"']*price[^"']*["']/i.test(html)

    // --- Checks (weights sum to 100) ---
    const checks: Check[] = []

    const titleOk = title.length >= 10 && title.length <= 70
    checks.push({
      id: 'title', label: 'Page title', weight: 5,
      status: titleOk ? 'pass' : 'fail',
      priority: titleOk ? null : 'LOW',
      finding: title ? `Title found: "${title}" (${title.length} characters).` : 'No <title> tag found.',
      recommendation: titleOk ? null : 'Write a clear, descriptive title around 10-70 characters that states what this page is.',
    })

    const descLen = metaDesc.length
    const descOk = descLen >= 50 && descLen <= 160
    checks.push({
      id: 'meta_description', label: 'Meta description', weight: 10,
      status: descOk ? 'pass' : 'fail',
      priority: descOk ? null : 'MED',
      finding: metaDesc ? `Found, ${descLen} characters.` : 'No meta description found.',
      recommendation: descOk ? null : 'Add a meta description between 50 and 160 characters summarizing this page.',
    })

    const ogOk = ogTitle && ogDesc
    checks.push({
      id: 'og_tags', label: 'Open Graph tags', weight: 5,
      status: ogOk ? 'pass' : 'fail',
      priority: ogOk ? null : 'LOW',
      finding: ogOk ? 'og:title and og:description both found.' : 'og:title and/or og:description missing.',
      recommendation: ogOk ? null : 'Add og:title and og:description meta tags so previews and AI crawlers get a clean summary.',
    })

    const h1Ok = h1Count === 1
    checks.push({
      id: 'h1_structure', label: 'Heading structure', weight: 10,
      status: h1Ok ? 'pass' : 'fail',
      priority: h1Ok ? null : 'LOW',
      finding: `${h1Count} <h1> tag${h1Count === 1 ? '' : 's'} found.`,
      recommendation: h1Ok ? null : h1Count === 0
        ? 'Add exactly one <h1> describing the page\u2019s main topic.'
        : 'Use exactly one <h1>; move the others to <h2> or lower.',
    })

    const orgOk = hasType('Organization', 'LocalBusiness', 'Corporation', 'WebSite')
    checks.push({
      id: 'organization_schema', label: 'Organization / entity schema', weight: 25,
      status: orgOk ? 'pass' : 'fail',
      priority: orgOk ? null : 'HIGH',
      finding: orgOk ? 'Organization-level structured data found.' : 'No Organization, LocalBusiness, or WebSite structured data found on this page.',
      recommendation: orgOk ? null : 'Add Organization JSON-LD (name, url, logo, sameAs links to official profiles) so AI systems can identify and disambiguate the brand.',
    })

    const faqOk = hasType('FAQPage')
    checks.push({
      id: 'faq_schema', label: 'FAQ structured data', weight: 25,
      status: faqOk ? 'pass' : 'fail',
      priority: faqOk ? null : hasFaqContent ? 'HIGH' : 'MED',
      finding: faqOk
        ? 'FAQPage structured data found.'
        : hasFaqContent
          ? 'This page has question-and-answer style content, but it is not marked up as FAQPage.'
          : 'No FAQPage structured data found.',
      recommendation: faqOk ? null : 'Add FAQPage JSON-LD listing each question and its answer, so AI assistants can extract them directly.',
    })

    const productOk = hasType('Product', 'Offer', 'AggregateOffer', 'BreadcrumbList')
    checks.push({
      id: 'product_schema', label: 'Product / pricing schema', weight: 20,
      status: productOk ? 'pass' : 'fail',
      priority: productOk ? null : hasPriceContent ? 'HIGH' : 'MED',
      finding: productOk
        ? 'Product, Offer, or BreadcrumbList structured data found.'
        : hasPriceContent
          ? 'Pricing or product information is visible on this page, but no Product/Offer structured data was found.'
          : 'No Product, Offer, or BreadcrumbList structured data found.',
      recommendation: productOk ? null : 'Add Product and Offer JSON-LD with price, currency, and availability where relevant.',
    })

    const total = checks.reduce((s, c) => s + c.weight, 0)
    const passed = checks.reduce((s, c) => s + (c.status === 'pass' ? c.weight : 0), 0)
    const score = Math.round((passed / total) * 100)

    return NextResponse.json({ url, score, checks }, { headers: CORS })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500, headers: CORS })
  }
}
