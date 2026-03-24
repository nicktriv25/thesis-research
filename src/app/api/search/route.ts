import { NextRequest, NextResponse } from 'next/server'

interface FMPSearchResult {
  symbol: string
  name?: string
  companyName?: string
  exchangeShortName?: string
  stockExchange?: string
  exchange?: string
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim()
  if (!q || q.length < 1) return NextResponse.json([])

  const key = process.env.FMP_API_KEY
  if (!key) return NextResponse.json([])

  try {
    const url = `https://financialmodelingprep.com/stable/search?query=${encodeURIComponent(q)}&limit=8&apikey=${key}`
    const res = await fetch(url, { next: { revalidate: 60 } })
    if (!res.ok) return NextResponse.json([])

    const data: FMPSearchResult[] = await res.json()

    return NextResponse.json(
      data.map(item => ({
        t: item.symbol,
        n: item.name ?? item.companyName ?? item.symbol,
        exchange: item.exchangeShortName ?? item.stockExchange ?? item.exchange ?? '',
      }))
    )
  } catch {
    return NextResponse.json([])
  }
}
