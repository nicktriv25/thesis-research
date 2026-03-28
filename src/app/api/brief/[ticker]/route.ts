import { NextRequest, NextResponse } from 'next/server'
import {
  getStockSnapshot,
  formatMarketCap,
  formatPct,
  formatMultiple,
  PolygonPlanError,
  PolygonNotFoundError,
  PolygonRateLimitError,
  type StockSnapshot,
} from '@/lib/fmp'
import { generateTIEBrief } from '@/lib/tie-engine'
import type { TIEBriefReport, KeyMetric } from '@/lib/types'

function buildMetrics(snap: StockSnapshot): KeyMetric[] {
  const sign = snap.changePct >= 0 ? '+' : ''
  return [
    {
      label: 'Price',
      value: `$${snap.price.toFixed(2)}`,
      sub: `${sign}${snap.changePct.toFixed(2)}% today`,
    },
    { label: 'Market Cap', value: formatMarketCap(snap.marketCap) },
    { label: 'P/E (TTM)', value: snap.pe ? `${snap.pe.toFixed(1)}x` : 'N/A' },
    { label: 'EV / Revenue', value: formatMultiple(snap.evToRevenue) },
    { label: 'Rev. Growth', value: formatPct(snap.revenueGrowth) },
    { label: 'Gross Margin', value: formatPct(snap.grossMargin) },
  ]
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  if (!/^[A-Z]{1,6}(\.[A-Z]{1,2})?$/.test(symbol)) {
    return NextResponse.json({ error: `Invalid ticker symbol: ${symbol}` }, { status: 400 })
  }

  try {
    const snap = await getStockSnapshot(symbol)
    const brief = await generateTIEBrief(snap)

    const report: TIEBriefReport = {
      ticker: snap.ticker,
      exchange: snap.exchange,
      companyName: snap.name,
      sector: snap.sector,
      generatedAt: new Date().toISOString(),
      rating: brief.rating,
      priceTarget: {
        base: brief.priceTarget.base,
        bull: brief.priceTarget.bull,
        bear: brief.priceTarget.bear,
        currency: snap.currency,
      },
      currentPrice: snap.price,
      metrics: buildMetrics(snap),
      investmentThesis: {
        title: 'Investment Thesis',
        content: brief.investmentThesis,
      },
      topRisks: {
        title: 'Key Risks',
        content: brief.topRisks,
      },
    }

    return NextResponse.json(report)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[brief/${symbol}]`, err instanceof Error ? err.name : 'Error', message)

    if (err instanceof PolygonPlanError) {
      return NextResponse.json(
        { code: 'plan_restricted', error: `Market data unavailable for ${symbol}.` },
        { status: 402 }
      )
    }
    if (err instanceof PolygonNotFoundError) {
      return NextResponse.json(
        { code: 'not_found', error: `No market data found for ${symbol}. Verify the ticker symbol is correct.` },
        { status: 404 }
      )
    }
    if (err instanceof PolygonRateLimitError) {
      return NextResponse.json(
        { code: 'rate_limited', error: `Rate limited — please try again in a moment.` },
        { status: 429 }
      )
    }
    return NextResponse.json(
      { code: 'internal', error: `Failed to generate brief for ${symbol}. ${message}` },
      { status: 500 }
    )
  }
}
