export interface Ticker {
  t: string      // symbol
  n: string      // company name
  p: string      // price (display)
  c: string      // change (display)
  up: boolean    // positive change
  s: string      // sector
  exchange: string
}

export const TICKERS: Ticker[] = [
  { t: 'NVDA',  n: 'NVIDIA Corporation',      p: '$174.90', c: '+1.8%', up: true,  s: 'Semiconductors',      exchange: 'NASDAQ' },
  { t: 'AAPL',  n: 'Apple Inc',               p: '$248.52', c: '-0.2%', up: false, s: 'Consumer Technology',  exchange: 'NASDAQ' },
  { t: 'AMZN',  n: 'Amazon.com Inc',          p: '$207.10', c: '+0.6%', up: true,  s: 'Cloud / E-Commerce',   exchange: 'NASDAQ' },
  { t: 'GOOGL', n: 'Alphabet Inc',            p: '$302.58', c: '-0.8%', up: false, s: 'Search & Advertising', exchange: 'NASDAQ' },
  { t: 'META',  n: 'Meta Platforms Inc',      p: '$580.00', c: '+1.2%', up: true,  s: 'Social Media',         exchange: 'NASDAQ' },
  { t: 'XOM',   n: 'Exxon Mobil Corporation', p: '$159.56', c: '+2.1%', up: true,  s: 'Oil & Gas',            exchange: 'NYSE'   },
  { t: 'MSFT',  n: 'Microsoft Corporation',   p: '$411.00', c: '-0.4%', up: false, s: 'Cloud / Enterprise',   exchange: 'NASDAQ' },
  { t: 'TSLA',  n: 'Tesla Inc',               p: '$405.55', c: '+0.1%', up: true,  s: 'EV / Clean Energy',    exchange: 'NASDAQ' },
  { t: 'AMD',   n: 'Advanced Micro Devices',  p: '$105.40', c: '+1.5%', up: true,  s: 'Semiconductors',       exchange: 'NASDAQ' },
  { t: 'AVGO',  n: 'Broadcom Inc',            p: '$185.20', c: '+0.9%', up: true,  s: 'Semiconductors',       exchange: 'NASDAQ' },
  { t: 'LMT',   n: 'Lockheed Martin',         p: '$485.00', c: '+1.1%', up: true,  s: 'Defense',              exchange: 'NYSE'   },
  { t: 'RTX',   n: 'RTX Corporation',         p: '$207.00', c: '+0.8%', up: true,  s: 'Aerospace & Defense',  exchange: 'NYSE'   },
  { t: 'PANW',  n: 'Palo Alto Networks',      p: '$163.51', c: '+0.4%', up: true,  s: 'Cybersecurity',        exchange: 'NASDAQ' },
  { t: 'SOFI',  n: 'SoFi Technologies',       p: '$17.05',  c: '+2.2%', up: true,  s: 'Fintech',              exchange: 'NASDAQ' },
  { t: 'ABBV',  n: 'AbbVie Inc',              p: '$207.00', c: '-1.0%', up: false, s: 'Pharmaceuticals',      exchange: 'NYSE'   },
  { t: 'INTC',  n: 'Intel Corporation',       p: '$44.25',  c: '-3.7%', up: false, s: 'Semiconductors',       exchange: 'NASDAQ' },
  { t: 'V',     n: 'Visa Inc',                p: '$340.00', c: '+0.3%', up: true,  s: 'Payments',             exchange: 'NYSE'   },
  { t: 'JPM',   n: 'JPMorgan Chase & Co',     p: '$250.00', c: '+0.5%', up: true,  s: 'Banking',              exchange: 'NYSE'   },
  { t: 'NEE',   n: 'NextEra Energy',          p: '$91.00',  c: '+0.5%', up: true,  s: 'Utilities',            exchange: 'NYSE'   },
  { t: 'COST',  n: 'Costco Wholesale',        p: '$950.00', c: '-0.3%', up: false, s: 'Retail',               exchange: 'NASDAQ' },
]

export function findTicker(query: string): Ticker | undefined {
  return TICKERS.find(t => t.t === query.toUpperCase())
}

export function searchTickers(query: string, limit = 5): Ticker[] {
  const q = query.toUpperCase().trim()
  if (!q) return []
  return TICKERS.filter(t =>
    t.t.includes(q) || t.n.toUpperCase().includes(q)
  ).slice(0, limit)
}
