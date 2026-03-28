/**
 * Polygon.io market data client
 * Replaces the previous FMP client with Polygon endpoints:
 *   - /v2/aggs/ticker/{ticker}/prev       — previous-day OHLCV (price)
 *   - /v3/reference/tickers/{ticker}      — company profile & market cap
 *   - /v2/aggs/ticker/{ticker}/range/...  — multi-day bars for daily change
 *   - /vX/reference/financials            — income statement (margins, EPS, revenue)
 *   - /v2/reference/news                  — recent news articles
 */

const BASE_URL = 'https://api.polygon.io'

function apiKey(): string {
  const key = process.env.POLYGON_API_KEY
  if (!key) throw new Error('POLYGON_API_KEY environment variable is not set')
  return key
}

// ─── Error classes ────────────────────────────────────────────────────────────

export class PolygonPlanError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PolygonPlanError'
  }
}

export class PolygonNotFoundError extends Error {
  constructor(ticker: string) {
    super(`No data found for ${ticker}`)
    this.name = 'PolygonNotFoundError'
  }
}

export class PolygonRateLimitError extends Error {
  constructor() {
    super('Polygon rate limit reached — please try again in a moment')
    this.name = 'PolygonRateLimitError'
  }
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

async function polyFetch<T>(path: string, attempt = 0): Promise<T> {
  const sep = path.includes('?') ? '&' : '?'
  const url = `${BASE_URL}${path}${sep}apiKey=${apiKey()}`
  const res = await fetch(url, { next: { revalidate: 300 } })

  if (res.status === 429) {
    if (attempt < 2) {
      await sleep(2000 * (attempt + 1))
      return polyFetch<T>(path, attempt + 1)
    }
    throw new PolygonRateLimitError()
  }

  if (res.status === 401 || res.status === 403) {
    throw new PolygonPlanError('Invalid or unauthorized Polygon API key')
  }

  if (!res.ok) throw new Error(`Polygon HTTP ${res.status} for ${path}`)

  const data = await res.json()

  if (data && typeof data === 'object' && data.status === 'ERROR') {
    const msg: string = data.error ?? data.message ?? 'unknown Polygon error'
    throw new Error(`Polygon error: ${msg}`)
  }

  return data as T
}

async function polyFetchOptional<T>(path: string): Promise<T | null> {
  try {
    return await polyFetch<T>(path)
  } catch (err) {
    if (err instanceof PolygonPlanError) return null
    if (err instanceof PolygonRateLimitError) throw err
    return null
  }
}

// ─── MIC → readable exchange name ────────────────────────────────────────────

function deriveExchange(mic: string): string {
  const map: Record<string, string> = {
    XNAS: 'NASDAQ',
    XNYS: 'NYSE',
    ARCX: 'NYSE Arca',
    XASE: 'NYSE American',
    BATS: 'CBOE BZX',
    EDGX: 'CBOE EDGX',
    XBOS: 'Nasdaq BX',
    XPHL: 'Nasdaq PHLX',
    XCBO: 'CBOE',
    XCHI: 'NYSE Chicago',
  }
  return map[mic] ?? mic
}

// ─── SIC code → sector ───────────────────────────────────────────────────────

function deriveSector(sicCode: string | undefined): string {
  if (!sicCode) return 'Unknown'
  const code = parseInt(sicCode, 10)
  if (code >= 100 && code <= 999) return 'Agriculture'
  if (code >= 1000 && code <= 1499) return 'Energy & Mining'
  if (code >= 1500 && code <= 3999) return 'Industrials'
  if (code >= 4000 && code <= 4499) return 'Industrials'
  if (code >= 4500 && code <= 4599) return 'Industrials'
  if (code >= 4600 && code <= 4899) return 'Communication Services'
  if (code >= 4900 && code <= 4999) return 'Utilities'
  if (code >= 5000 && code <= 5999) return 'Consumer Discretionary'
  if (code >= 6000 && code <= 6411) return 'Financials'
  if (code >= 6500 && code <= 6799) return 'Real Estate'
  if (code >= 7000 && code <= 7099) return 'Consumer Discretionary'
  if (code >= 7370 && code <= 7379) return 'Information Technology'
  if (code >= 7380 && code <= 7389) return 'Information Technology'
  if (code >= 7812 && code <= 7812) return 'Communication Services'
  if (code >= 8000 && code <= 8099) return 'Health Care'
  if (code >= 8700 && code <= 8742) return 'Information Technology'
  return 'Other'
}

// ─── Polygon response shapes ──────────────────────────────────────────────────

interface PolyAgg {
  T?: string
  c: number   // close
  h: number   // high
  l: number   // low
  o: number   // open
  v: number   // volume
  vw?: number // vwap
  t: number   // timestamp (ms)
}

interface PolyAggsResponse {
  results?: PolyAgg[]
  resultsCount?: number
  status: string
}

interface PolyTickerDetails {
  ticker: string
  name: string
  market: string
  primary_exchange?: string
  currency_name?: string
  description?: string
  market_cap?: number
  sic_code?: string
  sic_description?: string
  active?: boolean
}

interface PolyTickerResponse {
  results?: PolyTickerDetails
  status: string
}

interface PolyFinancialValue {
  value: number
  unit?: string
}

interface PolyIncomeStatement {
  revenues?: PolyFinancialValue
  gross_profit?: PolyFinancialValue
  diluted_earnings_per_share?: PolyFinancialValue
}

interface PolyFinancialResult {
  start_date: string
  end_date: string
  fiscal_year?: string
  fiscal_period?: string
  financials: {
    income_statement?: PolyIncomeStatement
  }
}

interface PolyFinancialsResponse {
  results?: PolyFinancialResult[]
  status: string
}

// ─── Our clean snapshot type (unchanged interface) ────────────────────────────

export interface StockSnapshot {
  ticker: string
  name: string
  exchange: string
  sector: string
  industry: string
  description: string
  currency: string
  price: number
  change: number
  changePct: number
  marketCap: number
  pe: number | null
  evToRevenue: number | null
  revenueGrowth: number | null
  grossMargin: number | null
}

// ─── Main fetch ───────────────────────────────────────────────────────────────

export async function getStockSnapshot(ticker: string): Promise<StockSnapshot> {
  const symbol = ticker.toUpperCase()

  // Phase 1: price (prev-day agg) + company profile in parallel
  const [prevAggs, profileRes] = await Promise.all([
    polyFetch<PolyAggsResponse>(`/v2/aggs/ticker/${symbol}/prev`),
    polyFetch<PolyTickerResponse>(`/v3/reference/tickers/${symbol}`),
  ])

  const agg = prevAggs.results?.[0]
  const details = profileRes.results

  if (!agg || !details) throw new PolygonNotFoundError(symbol)
  if (details.active === false) throw new PolygonNotFoundError(symbol)

  const price = agg.c

  // Phase 2: 2-day range for daily change, and quarterly financials (both optional)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const weekAgo = new Date(yesterday)
  weekAgo.setDate(weekAgo.getDate() - 7)
  const fmt = (d: Date) => d.toISOString().slice(0, 10)

  const [rangeData, financialsData] = await Promise.all([
    polyFetchOptional<PolyAggsResponse>(
      `/v2/aggs/ticker/${symbol}/range/1/day/${fmt(weekAgo)}/${fmt(yesterday)}`
    ),
    polyFetchOptional<PolyFinancialsResponse>(
      `/vX/reference/financials?ticker=${symbol}&timeframe=quarterly&order=desc&limit=5`
    ),
  ])

  // Daily change from last two trading-day bars
  let change = 0
  let changePct = 0
  const bars = rangeData?.results ?? []
  if (bars.length >= 2) {
    const latest = bars[bars.length - 1]
    const prior = bars[bars.length - 2]
    change = latest.c - prior.c
    changePct = prior.c > 0 ? ((latest.c - prior.c) / prior.c) * 100 : 0
  }

  // Financial metrics from quarterly income statements
  let pe: number | null = null
  let evToRevenue: number | null = null
  let revenueGrowth: number | null = null
  let grossMargin: number | null = null

  const quarters = financialsData?.results ?? []
  if (quarters.length > 0) {
    const latestIS = quarters[0].financials.income_statement

    // Gross margin: gross_profit / revenues (most recent quarter)
    const revQ = latestIS?.revenues?.value
    const gpQ = latestIS?.gross_profit?.value
    if (revQ && gpQ && revQ > 0) grossMargin = gpQ / revQ

    // TTM EPS → P/E
    const ttmEPS = quarters.slice(0, 4).reduce((sum, q) => {
      return sum + (q.financials.income_statement?.diluted_earnings_per_share?.value ?? 0)
    }, 0)
    if (ttmEPS > 0 && price > 0) pe = price / ttmEPS

    // Revenue growth: latest quarter vs same quarter prior year
    if (quarters.length >= 5) {
      const curr = quarters[0].financials.income_statement?.revenues?.value
      const prior = quarters[4].financials.income_statement?.revenues?.value
      if (curr && prior && prior > 0) revenueGrowth = (curr - prior) / prior
    }

    // EV/Revenue proxy: market cap / TTM revenue
    const ttmRev = quarters.slice(0, 4).reduce((sum, q) => {
      return sum + (q.financials.income_statement?.revenues?.value ?? 0)
    }, 0)
    const mktCap = details.market_cap ?? 0
    if (ttmRev > 0 && mktCap > 0) evToRevenue = mktCap / ttmRev
  }

  return {
    ticker: symbol,
    name: details.name,
    exchange: deriveExchange(details.primary_exchange ?? ''),
    sector: deriveSector(details.sic_code),
    industry: details.sic_description ?? 'Unknown',
    description: details.description ?? '',
    currency: (details.currency_name ?? 'usd').toUpperCase(),
    price,
    change,
    changePct,
    marketCap: details.market_cap ?? 0,
    pe,
    evToRevenue,
    revenueGrowth,
    grossMargin,
  }
}

// ─── News ─────────────────────────────────────────────────────────────────────

interface PolyNewsItem {
  id: string
  title: string
  article_url: string
  published_utc: string
  publisher: {
    name: string
  }
  tickers?: string[]
}

export interface StockNewsItem {
  headline: string
  source: string
  date: string
  url: string
}

export async function getStockNews(ticker: string): Promise<StockNewsItem[]> {
  const symbol = ticker.toUpperCase()
  try {
    const data = await polyFetch<{ results?: PolyNewsItem[]; status: string }>(
      `/v2/reference/news?ticker=${symbol}&limit=5&order=desc&sort=published_utc`
    )
    if (!Array.isArray(data.results)) return []
    return data.results.map(item => ({
      headline: item.title,
      source: item.publisher?.name ?? 'Unknown',
      date: item.published_utc,
      url: item.article_url,
    }))
  } catch {
    return []
  }
}

// ─── Formatters (unchanged) ───────────────────────────────────────────────────

export function formatMarketCap(cap: number): string {
  if (!cap) return 'N/A'
  if (cap >= 1e12) return `$${(cap / 1e12).toFixed(1)}T`
  if (cap >= 1e9)  return `$${(cap / 1e9).toFixed(1)}B`
  if (cap >= 1e6)  return `$${(cap / 1e6).toFixed(0)}M`
  return `$${cap.toLocaleString()}`
}

export function formatPct(value: number | null): string {
  if (value === null || value === undefined) return 'N/A'
  return `${(value * 100).toFixed(1)}%`
}

export function formatMultiple(value: number | null): string {
  if (value === null || value === undefined) return 'N/A'
  return `${value.toFixed(1)}x`
}
