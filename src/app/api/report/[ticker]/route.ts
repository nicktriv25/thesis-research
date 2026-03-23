import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/report/[ticker]
 *
 * Session 1: Returns a 501 stub — real TIE generation wired in Session 3.
 * Session 3 will:
 *   1. Fetch financials from Financial Modeling Prep
 *   2. Send structured prompt to Claude (claude-sonnet-4-20250514)
 *   3. Parse and validate TIEReport response
 *   4. Cache to KV / DB
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  // Validate basic ticker format
  if (!/^[A-Z]{1,5}$/.test(symbol)) {
    return NextResponse.json(
      { error: `Invalid ticker symbol: ${symbol}` },
      { status: 400 }
    )
  }

  // TODO Session 3: implement TIE generation pipeline
  return NextResponse.json(
    {
      error: `TIE report generation not yet implemented for ${symbol}. Check back in Session 3.`,
      ticker: symbol,
      status: 'coming_soon',
    },
    { status: 501 }
  )
}
