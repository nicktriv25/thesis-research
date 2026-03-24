import { NextRequest, NextResponse } from 'next/server'
import {
  getStockSnapshot,
  formatMarketCap,
  formatPct,
  formatMultiple,
  FMPPlanError,
  FMPNotFoundError,
  type StockSnapshot,
} from '@/lib/fmp'
import { generateTIEAnalysis } from '@/lib/tie-engine'
import type { TIEReport, KeyMetric } from '@/lib/types'

/**
 * GET /api/report/[ticker]
 *
 * Session 3: Fetches live data from FMP, passes it to the TIE Engine (Claude
 * claude-sonnet-4-20250514) to generate a full investment thesis, DCF valuation,
 * bull/base/bear scenarios, and risk factors.
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
    // Step 1: Fetch live market data from FMP
    const snap = await getStockSnapshot(symbol)

    // Step 2: Generate full analysis via TIE Engine (Claude)
    const tie = await generateTIEAnalysis(snap)

    // Step 3: Assemble final TIEReport merging live data + AI analysis
    const report: TIEReport = {
      // Identity
      ticker: snap.ticker,
      exchange: snap.exchange,
      companyName: snap.name,
      sector: snap.sector,
      reportType: tie.reportType,
      generatedAt: new Date().toISOString(),

      // Verdict from TIE Engine
      rating: tie.rating,
      priceTarget: {
        base: tie.priceTarget.base,
        bull: tie.priceTarget.bull,
        bear: tie.priceTarget.bear,
        currency: snap.currency,
      },
      currentPrice: snap.price,

      // Live metrics from FMP
      metrics: buildMetrics(snap),

      // Narrative from TIE Engine
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

      // DCF from TIE Engine
      dcf: tie.dcf,

      // Scenarios from TIE Engine
      scenarios: tie.scenarios,

      // Comparables from TIE Engine (subject co. uses live FMP data for first row)
      comparables: tie.comparables,
    }

    return NextResponse.json(report)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[report/${symbol}]`, err instanceof Error ? err.name : 'Error', message)

    if (err instanceof FMPPlanError) {
      return NextResponse.json(
        { code: 'plan_restricted', error: `Data unavailable for ${symbol} on the free data plan. This ticker may require a premium FMP subscription.` },
        { status: 402 }
      )
    }
    if (err instanceof FMPNotFoundError) {
      return NextResponse.json(
        { code: 'not_found', error: `No market data found for ${symbol}. Verify the ticker symbol is correct and the company is actively traded.` },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { code: 'internal', error: `Failed to generate report for ${symbol}. ${message}` },
      { status: 500 }
    )
  }
}
