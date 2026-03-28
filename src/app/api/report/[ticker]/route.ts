import { NextRequest, NextResponse } from 'next/server'
import {
  getStockSnapshot,
  getStockNews,
  formatMarketCap,
  formatPct,
  formatMultiple,
  PolygonPlanError,
  PolygonNotFoundError,
  PolygonRateLimitError,
  type StockSnapshot,
} from '@/lib/fmp'
import { generateTIEAnalysis } from '@/lib/tie-engine'
import { incrementCount } from '@/lib/counter'
import type { TIEReport, KeyMetric } from '@/lib/types'

/**
 * GET /api/report/[ticker]
 *
 * Fetches live market data from Polygon.io, then passes it to the TIE Engine
 * (Claude claude-sonnet-4-20250514) to generate a full investment thesis, DCF
 * valuation, bull/base/bear scenarios, and risk factors.
 */

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
    return NextResponse.json(
      { error: `Invalid ticker symbol: ${symbol}` },
      { status: 400 }
    )
  }

  try {
    // Step 1: Fetch live market data + news from Polygon
    const [snap, news] = await Promise.all([
      getStockSnapshot(symbol),
      getStockNews(symbol),
    ])

    // Step 2: Generate full analysis via TIE Engine (Claude)
    const tie = await generateTIEAnalysis(snap)

    // Step 3: Assemble final TIEReport merging live data + AI analysis
    const report: TIEReport = {
      ticker: snap.ticker,
      exchange: snap.exchange,
      companyName: snap.name,
      sector: snap.sector,
      reportType: tie.reportType,
      generatedAt: new Date().toISOString(),

      rating: tie.rating,
      priceTarget: {
        base: tie.priceTarget.base,
        bull: tie.priceTarget.bull,
        bear: tie.priceTarget.bear,
        currency: snap.currency,
      },
      currentPrice: snap.price,

      metrics: buildMetrics(snap),

      investmentThesis: {
        title: 'Investment Thesis',
        content: tie.investmentThesis,
      },
      businessOverview: {
        title: 'Business Overview',
        content: tie.businessOverview,
      },
      financialAnalysis: {
        title: 'Financial Analysis',
        content: tie.financialAnalysis,
      },
      riskFactors: {
        title: 'Key Risks',
        content: tie.riskFactors,
      },

      dcf: tie.dcf,
      scenarios: tie.scenarios,
      comparables: tie.comparables,
      news,
    }

    incrementCount()

    return NextResponse.json(report)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[report/${symbol}]`, err instanceof Error ? err.name : 'Error', message)

    if (err instanceof PolygonPlanError) {
      return NextResponse.json(
        { code: 'plan_restricted', error: `Market data unavailable for ${symbol}. The API key may lack permissions for this ticker.` },
        { status: 402 }
      )
    }
    if (err instanceof PolygonNotFoundError) {
      return NextResponse.json(
        { code: 'not_found', error: `No market data found for ${symbol}. Verify the ticker symbol is correct and the company is actively traded.` },
        { status: 404 }
      )
    }
    if (err instanceof PolygonRateLimitError) {
      return NextResponse.json(
        { code: 'rate_limited', error: `Rate limited fetching data for ${symbol} — please try again in a moment.` },
        { status: 429 }
      )
    }
    return NextResponse.json(
      { code: 'internal', error: `Failed to generate report for ${symbol}. ${message}` },
      { status: 500 }
    )
  }
}
