import { NextRequest, NextResponse } from 'next/server'

interface PolyTickerResult {
  ticker: string
  name?: string
  market?: string
  primary_exchange?: string
  type?: string
  active?: boolean
}

// Only surface results from major US equity exchanges (MIC codes)
const MAJOR_MIC = new Set(['XNAS', 'XNYS', 'ARCX', 'XASE', 'BATS'])

// Keywords in company names that indicate ETFs / leveraged products — deprioritize
const ETF_KEYWORDS = [
  'ETF', 'Trust', 'Direxion', 'YieldMax', 'GraniteShares',
  'Roundhill', 'Kurv', 'T-Rex', 'ProShares',
]

function isEtfLike(name: string): boolean {
  const upper = name.toUpperCase()
  return ETF_KEYWORDS.some(kw => upper.includes(kw.toUpperCase()))
}

function rankResult(ticker: string, name: string, query: string): number {
  const t = ticker.toUpperCase()
  const n = name.toUpperCase()
  const q = query.toUpperCase()

  // Exact ticker match
  if (t === q) return 0
  // Ticker starts with query
  if (t.startsWith(q)) return 1
  // Company name starts with query
  if (n.startsWith(q)) return 2
  // Ticker contains query
  if (t.includes(q)) return 3
  // Name contains query
  return 4
}

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim()
  if (!q || q.length < 2) return NextResponse.json([])

  const key = process.env.POLYGON_API_KEY
  if (!key) return NextResponse.json([])

  try {
    const url = `https://api.polygon.io/v3/reference/tickers?search=${encodeURIComponent(q)}&active=true&market=stocks&limit=20&apiKey=${key}`
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return NextResponse.json([])

    const data: unknown = await res.json()
    if (!data || typeof data !== 'object' || !Array.isArray((data as { results?: unknown }).results)) {
      return NextResponse.json([])
    }

    const results = ((data as { results: PolyTickerResult[] }).results)
      .filter(item => {
        if (!item.ticker || item.active === false) return false
        const ex = item.primary_exchange ?? ''
        return ex === '' || MAJOR_MIC.has(ex)
      })
      .map(item => {
        const name = item.name ?? item.ticker
        return {
          t: item.ticker,
          n: name,
          _rank: rankResult(item.ticker, name, q),
          _etf: isEtfLike(name) ? 1 : 0,
        }
      })
      .sort((a, b) => {
        // ETF-like items always sink below common stocks at the same rank
        if (a._etf !== b._etf) return a._etf - b._etf
        return a._rank - b._rank
      })
      .slice(0, 5)
      .map(({ t, n }) => ({ t, n }))

    return NextResponse.json(results)
  } catch {
    return NextResponse.json([])
  }
}
