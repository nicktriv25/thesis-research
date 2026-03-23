/**
 * Financial Modeling Prep API client
 * Fetches real stock quotes, company profiles, and key financial ratios.
 */

const BASE_URL = 'https://financialmodelingprep.com/api/v3'

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

// ─── Raw FMP response shapes ─────────────────────────────────────────────────

interface FMPQuoteItem {
  symbol: string
  name: string
  price: number
  change: number
  changesPercentage: number
  marketCap: number
  pe: number | null
  eps: number | null
  exchange: string
}

interface FMPProfileItem {
  symbol: string
  companyName: string
  sector: string
  industry: string
  exchange: string
  exchangeShortName: string
  currency: string
  country: string
  description: string
  mktCap: number
}

interface FMPKeyMetricsTTMItem {
  peRatioTTM: number | null
  evToSalesTTM: number | null
  evToFreeCashFlowTTM: number | null
}

interface FMPRatiosTTMItem {
  grossProfitMarginTTM: number | null
  netProfitMarginTTM: number | null
  priceEarningsRatioTTM: number | null
  revenueGrowthTTM: number | null
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

  const [quotes, profiles, keyMetrics, ratios] = await Promise.all([
    fmpFetch<FMPQuoteItem[]>(`/quote/${symbol}`),
    fmpFetch<FMPProfileItem[]>(`/profile/${symbol}`),
    fmpFetch<FMPKeyMetricsTTMItem[]>(`/key-metrics-ttm/${symbol}`),
    fmpFetch<FMPRatiosTTMItem[]>(`/ratios-ttm/${symbol}`),
  ])

  const q = quotes?.[0]
  const p = profiles?.[0]
  const m = keyMetrics?.[0]
  const r = ratios?.[0]

  if (!q) throw new Error(`No quote data for ${symbol}`)
  if (!p) throw new Error(`No profile data for ${symbol}`)

  return {
    ticker: symbol,
    name: p.companyName || q.name,
    exchange: p.exchangeShortName || p.exchange,
    sector: p.sector || 'Unknown',
    industry: p.industry || 'Unknown',
    description: p.description || '',
    currency: p.currency || 'USD',
    price: q.price,
    change: q.change,
    changePct: q.changesPercentage,
    marketCap: q.marketCap || p.mktCap,
    pe: q.pe ?? m?.peRatioTTM ?? r?.priceEarningsRatioTTM ?? null,
    evToRevenue: m?.evToSalesTTM ?? null,
    revenueGrowth: r?.revenueGrowthTTM ?? null,
    grossMargin: r?.grossProfitMarginTTM ?? null,
  }
}

// ─── Formatters ───────────────────────────────────────────────────────────────

export function formatMarketCap(cap: number): string {
  if (!cap) return 'N/A'
  if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`
  if (cap >= 1e9) return `$${(cap / 1e9).toFixed(1)}B`
  if (cap >= 1e6) return `$${(cap / 1e6).toFixed(0)}M`
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
