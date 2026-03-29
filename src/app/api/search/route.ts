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

// Names containing these terms are filtered OUT entirely from fuzzy results
// (only allowed through if the user typed the exact ticker)
const JUNK_KEYWORDS = [
  'ETF', 'TRUST', 'DIREXION', 'YIELDMAX', 'GRANITESHARES',
  'ROUNDHILL', 'KURV', 'T-REX', 'PROSHARES', 'DEPOSITORY',
  'WARRANT', ' UNIT', 'LEVERAGED', 'ULTRASHORT', 'ULTRAPRO',
]

function isJunk(name: string): boolean {
  const upper = name.toUpperCase()
  return JUNK_KEYWORDS.some(kw => upper.includes(kw))
}

function rankResult(ticker: string, name: string, query: string): number {
  const t = ticker.toUpperCase()
  const n = name.toUpperCase()
  const q = query.toUpperCase()

  if (t === q)          return 0  // exact ticker match
  if (t.startsWith(q)) return 1  // ticker starts with query
  if (t.includes(q))   return 2  // ticker contains query
  if (n.startsWith(q)) return 3  // company name starts with query
  return 4                        // name contains query (catch-all)
}

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim()
  if (!q || q.length < 2) return NextResponse.json([])

  const key = process.env.POLYGON_API_KEY
  if (!key) return NextResponse.json([])

  try {
    const url = `https://api.polygon.io/v3/reference/tickers?search=${encodeURIComponent(q)}&active=true&market=stocks&limit=30&apiKey=${key}`
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return NextResponse.json([])

    const data: unknown = await res.json()
    if (!data || typeof data !== 'object' || !Array.isArray((data as { results?: unknown }).results)) {
      return NextResponse.json([])
    }

    const qUpper = q.toUpperCase()

    const results = ((data as { results: PolyTickerResult[] }).results)
      .filter(item => {
        if (!item.ticker || item.active === false) return false
        // Restrict to major US exchanges
        const ex = item.primary_exchange ?? ''
        if (ex !== '' && !MAJOR_MIC.has(ex)) return false
        // Hard-filter junk (ETFs, warrants, units, leveraged products)
        // unless the user typed the exact ticker
        const name = item.name ?? ''
        if (isJunk(name) && item.ticker.toUpperCase() !== qUpper) return false
        return true
      })
      .map(item => {
        const name = item.name ?? item.ticker
        return {
          t: item.ticker,
          n: name,
          _rank: rankResult(item.ticker, name, q),
        }
      })
      .sort((a, b) => a._rank - b._rank)
      .slice(0, 5)
      .map(({ t, n }) => ({ t, n }))

    return NextResponse.json(results)
  } catch {
    return NextResponse.json([])
  }
}
