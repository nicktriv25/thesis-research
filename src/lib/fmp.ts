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

async function fmpFetch<T>(path: string): Promise<T> {
  const sep = path.includes('?') ? '&' : '?'
  const url = `${BASE_URL}${path}${sep}apikey=${apiKey()}`
  const res = await fetch(url, { next: { revalidate: 300 } }) // cache 5 min
  if (!res.ok) throw new Error(`FMP API ${res.status} for ${path}`)
  return res.json() as Promise<T>
}

/** Like fmpFetch but returns null instead of throwing on non-2xx. */
async function fmpFetchOptional<T>(path: string): Promise<T | null> {
  try {
    return await fmpFetch<T>(path)
  } catch {
    return null
  }
}

// ─── Raw FMP stable response shapes ──────────────────────────────────────────

interface FMPQuoteItem {
  symbol: string
  name: string
  price: number
  change: number
  changePercentage: number   // NOTE: not changesPercentage
  marketCap: number
  exchange: string
}

interface FMPProfileItem {
  symbol: string
  companyName: string
  sector: string
  industry: string
  exchange: string           // short name e.g. "NASDAQ"
  exchangeFullName: string
  currency: string
  description: string
}

interface FMPKeyMetricsTTMItem {
  evToSalesTTM: number | null
}

interface FMPRatiosTTMItem {
  grossProfitMarginTTM: number | null
  priceToEarningsRatioTTM: number | null  // NOTE: not priceEarningsRatioTTM
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

  if (!q) throw new Error(`No quote data for ${symbol}`)
  if (!p) throw new Error(`No profile data for ${symbol}`)

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
  // Normalize: FMP occasionally returns market cap in millions for some tickers
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
