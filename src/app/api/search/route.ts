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

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim()
  if (!q || q.length < 2) return NextResponse.json([])

  const key = process.env.POLYGON_API_KEY
  if (!key) return NextResponse.json([])

  try {
    const url = `https://api.polygon.io/v3/reference/tickers?search=${encodeURIComponent(q)}&active=true&market=stocks&limit=10&apiKey=${key}`
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return NextResponse.json([])

    const data: unknown = await res.json()
    if (!data || typeof data !== 'object' || !Array.isArray((data as { results?: unknown }).results)) {
      return NextResponse.json([])
    }

    const results = ((data as { results: PolyTickerResult[] }).results)
      .filter(item => {
        if (!item.ticker || item.active === false) return false
        // Prefer major US exchanges; fall through if exchange unknown
        const ex = item.primary_exchange ?? ''
        return ex === '' || MAJOR_MIC.has(ex)
      })
      .slice(0, 8)
      .map(item => ({
        t: item.ticker,
        n: item.name ?? item.ticker,
      }))

    return NextResponse.json(results)
  } catch {
    return NextResponse.json([])
  }
}
