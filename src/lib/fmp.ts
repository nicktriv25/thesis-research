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

async function fmpFetch<T>(path: string): Promise<T> {
  const sep = path.includes('?') ? '&' : '?'
  const url = `${BASE_URL}${path}${sep}apikey=${apiKey()}`
  const res = await fetch(url, { next: { revalidate: 300 } })

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
    // Propagate plan errors so callers can surface them to the user
    if (err instanceof FMPPlanError) throw err
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

  const [quotes, profiles, keyMetrics, ratios, growth] = await Promise.all([
    fmpFetch<FMPQuoteItem[]>(`/quote?symbol=${symbol}`),
    fmpFetch<FMPProfileItem[]>(`/profile?symbol=${symbol}`),
    fmpFetchOptional<FMPKeyMetricsTTMItem[]>(`/key-metrics-ttm?symbol=${symbol}`),
    fmpFetchOptional<FMPRatiosTTMItem[]>(`/ratios-ttm?symbol=${symbol}`),
    fmpFetchOptional<FMPFinancialGrowthItem[]>(`/financial-growth?symbol=${symbol}&limit=1`),
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
