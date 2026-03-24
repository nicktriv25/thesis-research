import { NextRequest, NextResponse } from 'next/server'

interface FMPSearchResult {
  symbol: string
  name?: string
  companyName?: string
  exchangeShortName?: string
  stockExchange?: string
  exchange?: string
}

// Only surface results from major US exchanges to avoid noise
const MAJOR_EXCHANGES = new Set(['NASDAQ', 'NYSE', 'AMEX', 'NYSE ARCA', 'NYSE MKT'])

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim()
  if (!q || q.length < 2) return NextResponse.json([])

  const key = process.env.FMP_API_KEY
  if (!key) return NextResponse.json([])

  try {
    // v3 search endpoint has more reliable free-tier availability than /stable/search
    const url = `https://financialmodelingprep.com/api/v3/search?query=${encodeURIComponent(q)}&limit=10&apikey=${key}`
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return NextResponse.json([])

    const data: unknown = await res.json()

    // FMP returns {"Error Message": "..."} on rate limit / plan errors (HTTP 200)
    if (!Array.isArray(data)) return NextResponse.json([])

    const results = (data as FMPSearchResult[])
      .filter(item => {
        if (!item.symbol) return false
        const ex = item.exchangeShortName ?? item.stockExchange ?? item.exchange ?? ''
        return MAJOR_EXCHANGES.has(ex.toUpperCase())
      })
      .slice(0, 8)
      .map(item => ({
        t: item.symbol,
        n: item.name ?? item.companyName ?? item.symbol,
      }))

    return NextResponse.json(results)
  } catch {
    return NextResponse.json([])
  }
}
