import { NextRequest, NextResponse } from 'next/server'

interface PolyTickerResult {
  ticker: string
  name?: string
  market?: string
  primary_exchange?: string
  type?: string
  active?: boolean
}

interface SearchResult {
  t: string
  n: string
}

// ---------------------------------------------------------------------------
// Local priority list — top ~100 US stocks by popularity / market cap
// Always searched first; guarantees correct results for well-known tickers.
// ---------------------------------------------------------------------------
const LOCAL_STOCKS: SearchResult[] = [
  // Mega-cap tech
  { t: 'AAPL',  n: 'Apple Inc' },
  { t: 'MSFT',  n: 'Microsoft Corporation' },
  { t: 'NVDA',  n: 'NVIDIA Corporation' },
  { t: 'GOOGL', n: 'Alphabet Inc (Class A)' },
  { t: 'GOOG',  n: 'Alphabet Inc (Class C)' },
  { t: 'AMZN',  n: 'Amazon.com Inc' },
  { t: 'META',  n: 'Meta Platforms Inc' },
  { t: 'TSLA',  n: 'Tesla Inc' },
  { t: 'AVGO',  n: 'Broadcom Inc' },
  { t: 'ORCL',  n: 'Oracle Corporation' },
  { t: 'CRM',   n: 'Salesforce Inc' },
  { t: 'ADBE',  n: 'Adobe Inc' },
  { t: 'AMD',   n: 'Advanced Micro Devices Inc' },
  { t: 'INTC',  n: 'Intel Corporation' },
  { t: 'QCOM',  n: 'Qualcomm Inc' },
  { t: 'MU',    n: 'Micron Technology Inc' },
  { t: 'AMAT',  n: 'Applied Materials Inc' },
  { t: 'LRCX',  n: 'Lam Research Corporation' },
  { t: 'KLAC',  n: 'KLA Corporation' },
  { t: 'MRVL',  n: 'Marvell Technology Inc' },
  { t: 'NFLX',  n: 'Netflix Inc' },
  { t: 'NOW',   n: 'ServiceNow Inc' },
  { t: 'INTU',  n: 'Intuit Inc' },
  { t: 'PANW',  n: 'Palo Alto Networks Inc' },
  { t: 'CRWD',  n: 'CrowdStrike Holdings Inc' },
  { t: 'SNOW',  n: 'Snowflake Inc' },
  { t: 'DDOG',  n: 'Datadog Inc' },
  { t: 'ZS',    n: 'Zscaler Inc' },
  { t: 'NET',   n: 'Cloudflare Inc' },
  { t: 'PLTR',  n: 'Palantir Technologies Inc' },
  { t: 'UBER',  n: 'Uber Technologies Inc' },
  { t: 'LYFT',  n: 'Lyft Inc' },
  { t: 'ABNB',  n: 'Airbnb Inc' },
  { t: 'DASH',  n: 'DoorDash Inc' },
  { t: 'RBLX',  n: 'Roblox Corporation' },
  { t: 'SNAP',  n: 'Snap Inc' },
  { t: 'PINS',  n: 'Pinterest Inc' },
  { t: 'SPOT',  n: 'Spotify Technology SA' },
  { t: 'SHOP',  n: 'Shopify Inc' },
  { t: 'SQ',    n: 'Block Inc' },
  { t: 'PYPL',  n: 'PayPal Holdings Inc' },
  { t: 'COIN',  n: 'Coinbase Global Inc' },
  { t: 'HOOD',  n: 'Robinhood Markets Inc' },
  { t: 'SOFI',  n: 'SoFi Technologies Inc' },
  { t: 'AFRM',  n: 'Affirm Holdings Inc' },
  { t: 'RIVN',  n: 'Rivian Automotive Inc' },
  { t: 'LCID',  n: 'Lucid Group Inc' },
  { t: 'NIO',   n: 'NIO Inc' },
  { t: 'XPEV',  n: 'XPeng Inc' },
  { t: 'DKNG',  n: 'DraftKings Inc' },
  // Financials
  { t: 'JPM',   n: 'JPMorgan Chase & Co' },
  { t: 'BAC',   n: 'Bank of America Corporation' },
  { t: 'WFC',   n: 'Wells Fargo & Company' },
  { t: 'C',     n: 'Citigroup Inc' },
  { t: 'GS',    n: 'Goldman Sachs Group Inc' },
  { t: 'MS',    n: 'Morgan Stanley' },
  { t: 'BLK',   n: 'BlackRock Inc' },
  { t: 'V',     n: 'Visa Inc' },
  { t: 'MA',    n: 'Mastercard Inc' },
  { t: 'AXP',   n: 'American Express Company' },
  { t: 'BRK',   n: 'Berkshire Hathaway Inc' },
  // Healthcare
  { t: 'UNH',   n: 'UnitedHealth Group Inc' },
  { t: 'JNJ',   n: 'Johnson & Johnson' },
  { t: 'LLY',   n: 'Eli Lilly and Company' },
  { t: 'PFE',   n: 'Pfizer Inc' },
  { t: 'MRK',   n: 'Merck & Co Inc' },
  { t: 'ABBV',  n: 'AbbVie Inc' },
  { t: 'BMY',   n: 'Bristol-Myers Squibb Company' },
  { t: 'AMGN',  n: 'Amgen Inc' },
  { t: 'GILD',  n: 'Gilead Sciences Inc' },
  { t: 'MRNA',  n: 'Moderna Inc' },
  { t: 'REGN',  n: 'Regeneron Pharmaceuticals Inc' },
  // Consumer
  { t: 'AMZN',  n: 'Amazon.com Inc' },
  { t: 'WMT',   n: 'Walmart Inc' },
  { t: 'COST',  n: 'Costco Wholesale Corporation' },
  { t: 'HD',    n: 'Home Depot Inc' },
  { t: 'TGT',   n: 'Target Corporation' },
  { t: 'NKE',   n: 'Nike Inc' },
  { t: 'SBUX',  n: 'Starbucks Corporation' },
  { t: 'MCD',   n: "McDonald's Corporation" },
  { t: 'DIS',   n: 'Walt Disney Company' },
  { t: 'CMCSA', n: 'Comcast Corporation' },
  // Industrials / Energy
  { t: 'BA',    n: 'Boeing Company' },
  { t: 'CAT',   n: 'Caterpillar Inc' },
  { t: 'GE',    n: 'GE Aerospace' },
  { t: 'HON',   n: 'Honeywell International Inc' },
  { t: 'RTX',   n: 'RTX Corporation' },
  { t: 'LMT',   n: 'Lockheed Martin Corporation' },
  { t: 'XOM',   n: 'Exxon Mobil Corporation' },
  { t: 'CVX',   n: 'Chevron Corporation' },
  { t: 'COP',   n: 'ConocoPhillips' },
  // Staples / Utilities
  { t: 'PG',    n: 'Procter & Gamble Company' },
  { t: 'KO',    n: 'Coca-Cola Company' },
  { t: 'PEP',   n: 'PepsiCo Inc' },
  { t: 'PM',    n: 'Philip Morris International Inc' },
  { t: 'MO',    n: 'Altria Group Inc' },
  { t: 'NEE',   n: 'NextEra Energy Inc' },
  { t: 'DUK',   n: 'Duke Energy Corporation' },
  // Semis / hardware extras
  { t: 'TSM',   n: 'Taiwan Semiconductor Manufacturing' },
  { t: 'ASML',  n: 'ASML Holding NV' },
  { t: 'ARM',   n: 'Arm Holdings plc' },
  { t: 'SMCI',  n: 'Super Micro Computer Inc' },
  { t: 'DELL',  n: 'Dell Technologies Inc' },
  { t: 'HPQ',   n: 'HP Inc' },
  { t: 'IBM',   n: 'IBM Corporation' },
]

// Deduplicate local list by ticker
const LOCAL_MAP = new Map<string, string>()
for (const s of LOCAL_STOCKS) {
  if (!LOCAL_MAP.has(s.t)) LOCAL_MAP.set(s.t, s.n)
}

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------
const MAJOR_MIC = new Set(['XNAS', 'XNYS', 'ARCX', 'XASE', 'BATS'])

const JUNK_KEYWORDS = [
  'ETF', 'TRUST', 'DIREXION', 'YIELDMAX', 'GRANITESHARES',
  'ROUNDHILL', 'KURV', 'T-REX', 'PROSHARES', 'DEPOSITORY',
  'WARRANT', ' UNIT', 'LEVERAGED', 'ULTRASHORT', 'ULTRAPRO',
  'DEBENTURE', 'PREFERRED', ' SERIES ',
  'ACQUISITION', ' RIGHTS', 'ORDINARY SHARES', 'CLASS A ORDINARY', 'SPAC',
]

function isJunk(name: string): boolean {
  const upper = name.toUpperCase()
  return JUNK_KEYWORDS.some(kw => upper.includes(kw))
}

// Only allow clean common-stock tickers: 1–5 uppercase letters, optional . + 1–2 uppercase letters
function isCleanTicker(ticker: string): boolean {
  return /^[A-Z]{1,5}(\.[A-Z]{1,2})?$/.test(ticker)
}

// ---------------------------------------------------------------------------
// Ranking (lower = better; 99 = no match — exclude)
// ---------------------------------------------------------------------------
const NO_MATCH = 99

function rankResult(ticker: string, name: string, query: string): number {
  const t = ticker.toUpperCase()
  const n = name.toUpperCase()
  const q = query.toUpperCase()

  if (t === q)          return 0   // exact ticker
  if (t.startsWith(q)) return 1   // ticker starts with query
  if (n.startsWith(q)) return 2   // company name starts with query
  if (t.includes(q))   return 3   // ticker contains query
  if (n.includes(q))   return 4   // name contains query
  return NO_MATCH                  // no real match — exclude
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim()
  if (!q || q.length < 2) return NextResponse.json([])

  const qUpper = q.toUpperCase()

  // 1. Search local list
  const localResults: (SearchResult & { _rank: number })[] = []
  for (const [t, n] of LOCAL_MAP) {
    const rank = rankResult(t, n, q)
    if (rank < NO_MATCH) localResults.push({ t, n, _rank: rank })
  }
  localResults.sort((a, b) => a._rank - b._rank)

  const seen = new Set(localResults.map(r => r.t))
  const merged: (SearchResult & { _rank: number; _source: number })[] = localResults.map(r => ({
    ...r,
    _source: 0, // local = higher priority
  }))

  // 2. Hit Polygon only if local returned fewer than 3 results
  if (localResults.length < 3) {
    const key = process.env.POLYGON_API_KEY
    if (key) {
      try {
        const url = `https://api.polygon.io/v3/reference/tickers?search=${encodeURIComponent(q)}&active=true&market=stocks&limit=30&apiKey=${key}`
        const res = await fetch(url, { cache: 'no-store' })
        if (res.ok) {
          const data: unknown = await res.json()
          if (data && typeof data === 'object' && Array.isArray((data as { results?: unknown }).results)) {
            for (const item of (data as { results: PolyTickerResult[] }).results) {
              if (!item.ticker || item.active === false) continue
              if (!isCleanTicker(item.ticker)) continue
              if (seen.has(item.ticker)) continue
              const ex = item.primary_exchange ?? ''
              if (ex !== '' && !MAJOR_MIC.has(ex)) continue
              const name = item.name ?? item.ticker
              if (isJunk(name) && item.ticker.toUpperCase() !== qUpper) continue
              const rank = rankResult(item.ticker, name, q)
              if (rank === NO_MATCH) continue
              merged.push({ t: item.ticker, n: name, _rank: rank, _source: 1 })
              seen.add(item.ticker)
            }
          }
        }
      } catch {
        // Polygon unavailable — local results only
      }
    }
  }

  // 3. Sort: local always above API at the same rank level
  merged.sort((a, b) => {
    if (a._rank !== b._rank) return a._rank - b._rank
    return a._source - b._source
  })

  const results = merged.slice(0, 5).map(({ t, n }) => ({ t, n }))
  return NextResponse.json(results)
}
