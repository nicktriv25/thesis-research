/**
 * Financial Modeling Prep API client (stable endpoints)
 * Fetches real stock quotes, company profiles, and key financial ratios.
 */

const BASE_URL = 'https://financialmodelingprep.com/stable'

function apiKey(): string {
  const key = process.env.FMP_API_KEY
  if (!key) throw new Error('FMP_API_KEY environment variable is not set')
  return key
}

/**
 * Error thrown when FMP blocks a request due to subscription limits.
 * Lets callers distinguish plan issues from bad tickers or network errors.
 */
export class FMPPlanError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'FMPPlanError'
  }
}

/**
 * Error thrown when FMP returns no data for a ticker (empty array).
 * Indicates the ticker is unknown to FMP, not a plan issue.
 */
export class FMPNotFoundError extends Error {
  constructor(ticker: string) {
    super(`No data found for ${ticker}`)
    this.name = 'FMPNotFoundError'
  }
}

/**
 * Error thrown when FMP rate-limits the request (HTTP 429).
 * The free tier shares a request budget; popular tickers like AMZN exhaust
 * it faster when multiple users are concurrent, or when the 5-call Promise.all
 * bursts past the per-second cap.
 */
export class FMPRateLimitError extends Error {
  constructor() {
    super('FMP rate limit reached — please try again in a moment')
    this.name = 'FMPRateLimitError'
  }
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

async function fmpFetch<T>(path: string, attempt = 0): Promise<T> {
  const sep = path.includes('?') ? '&' : '?'
  const url = `${BASE_URL}${path}${sep}apikey=${apiKey()}`
  const res = await fetch(url, { next: { revalidate: 300 } })

  // Rate limited — retry up to 2 times with exponential backoff (2 s, 4 s)
  if (res.status === 429) {
    if (attempt < 2) {
      await sleep(2000 * (attempt + 1))
      return fmpFetch<T>(path, attempt + 1)
    }
    throw new FMPRateLimitError()
  }

  // Hard HTTP errors
  if (res.status === 401) throw new FMPPlanError('Invalid FMP API key')
  if (res.status === 403) throw new FMPPlanError('FMP endpoint requires a higher subscription tier')
  if (!res.ok) throw new Error(`FMP HTTP ${res.status} for ${path}`)

  const data = await res.json()

  // FMP returns 200 with {"Error Message": "..."} for plan/rate-limit issues
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const msg: string | undefined = data['Error Message'] ?? data['message'] ?? data['error']
    if (msg) {
      const lower = msg.toLowerCase()
      if (
        lower.includes('subscription') ||
        lower.includes('upgrade') ||
        lower.includes('not available under your current') ||
        lower.includes('limit reach') ||
        lower.includes('rate limit')
      ) {
        throw new FMPPlanError(msg)
      }
      throw new Error(`FMP error: ${msg}`)
    }
  }

  return data as T
}

/** Like fmpFetch but returns null on any error (used for optional enrichment data). */
async function fmpFetchOptional<T>(path: string): Promise<T | null> {
  try {
    return await fmpFetch<T>(path)
  } catch (err) {
    // Propagate plan and rate-limit errors so callers can surface them to the user
    if (err instanceof FMPPlanError) throw err
    if (err instanceof FMPRateLimitError) throw err
    return null
  }
}

// ─── Raw FMP stable response shapes ──────────────────────────────────────────

interface FMPQuoteItem {
  symbol: string
  name: string
  price: number
  change: number
  changePercentage: number
  marketCap: number
  exchange: string
}

interface FMPProfileItem {
  symbol: string
  companyName: string
  sector: string
  industry: string
  exchange: string
  exchangeFullName: string
  currency: string
  description: string
}

interface FMPKeyMetricsTTMItem {
  evToSalesTTM: number | null
}

interface FMPRatiosTTMItem {
  grossProfitMarginTTM: number | null
  priceToEarningsRatioTTM: number | null
}

interface FMPFinancialGrowthItem {
  revenueGrowth: number | null
}

// ─── Our clean snapshot type ──────────────────────────────────────────────────

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

  // Fetch required data first, then stagger optional enrichment calls to avoid
  // bursting the free-tier rate limit (especially for high-traffic tickers like AMZN)
  const [quotes, profiles] = await Promise.all([
    fmpFetch<FMPQuoteItem[]>(`/quote?symbol=${symbol}`),
    fmpFetch<FMPProfileItem[]>(`/profile?symbol=${symbol}`),
  ])

  const [keyMetrics, ratios, growth] = await Promise.all([
    fmpFetchOptional<FMPKeyMetricsTTMItem[]>(`/key-metrics-ttm?symbol=${symbol}`),
    sleep(150).then(() => fmpFetchOptional<FMPRatiosTTMItem[]>(`/ratios-ttm?symbol=${symbol}`)),
    sleep(300).then(() => fmpFetchOptional<FMPFinancialGrowthItem[]>(`/financial-growth?symbol=${symbol}&limit=1`)),
  ])

  const q = quotes?.[0]
  const p = profiles?.[0]
  const m = keyMetrics?.[0]
  const r = ratios?.[0]
  const g = growth?.[0]

  if (!q || !p) throw new FMPNotFoundError(symbol)

  return {
    ticker: symbol,
    name: p.companyName || q.name,
    exchange: p.exchange,
    sector: p.sector || 'Unknown',
    industry: p.industry || 'Unknown',
    description: p.description || '',
    currency: p.currency || 'USD',
    price: q.price,
    change: q.change,
    changePct: q.changePercentage,
    marketCap: q.marketCap,
    pe: r?.priceToEarningsRatioTTM ?? null,
    evToRevenue: m?.evToSalesTTM ?? null,
    revenueGrowth: g?.revenueGrowth ?? null,
    grossMargin: r?.grossProfitMarginTTM ?? null,
  }
}

// ─── News ─────────────────────────────────────────────────────────────────────

interface FMPNewsItem {
  title: string
  site: string
  publishedDate: string
  url: string
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
    const items = await fmpFetch<FMPNewsItem[]>(
      `/stock-news?tickers=${symbol}&limit=5`
    )
    if (!Array.isArray(items)) return []
    return items.map(item => ({
      headline: item.title,
      source: item.site,
      date: item.publishedDate,
      url: item.url,
    }))
  } catch {
    return []
  }
}

// ─── Formatters ───────────────────────────────────────────────────────────────

export function formatMarketCap(cap: number): string {
  if (!cap) return 'N/A'
  const raw = cap < 1e6 ? cap * 1e6 : cap
  if (raw >= 1e12) return `$${(raw / 1e12).toFixed(1)}T`
  if (raw >= 1e9)  return `$${(raw / 1e9).toFixed(1)}B`
  if (raw >= 1e6)  return `$${(raw / 1e6).toFixed(0)}M`
  return `$${raw.toLocaleString()}`
}

export function formatPct(value: number | null): string {
  if (value === null || value === undefined) return 'N/A'
  return `${(value * 100).toFixed(1)}%`
}

export function formatMultiple(value: number | null): string {
  if (value === null || value === undefined) return 'N/A'
  return `${value.toFixed(1)}x`
}
