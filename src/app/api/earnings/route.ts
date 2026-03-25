import { NextResponse } from 'next/server'

export interface EarningsEntry {
  symbol: string
  name: string
  date: string
  epsEstimated: number | null
  time: string  // "bmo" | "amc" | "dmh"
}

interface FMPEarningsItem {
  symbol: string
  date: string
  epsEstimated?: number | null
  time?: string
}

interface FMPProfileItem {
  symbol: string
  companyName?: string
  name?: string
}

function getWeekRange(): { from: string; to: string } {
  const now = new Date()
  const day = now.getUTCDay() // 0=Sun, 1=Mon … 6=Sat
  const diffToMon = day === 0 ? -6 : 1 - day
  const mon = new Date(now)
  mon.setUTCDate(now.getUTCDate() + diffToMon)
  const fri = new Date(mon)
  fri.setUTCDate(mon.getUTCDate() + 4)

  const fmt = (d: Date) => d.toISOString().slice(0, 10)
  return { from: fmt(mon), to: fmt(fri) }
}

function timeLabel(code: string | undefined): string {
  if (!code) return ''
  if (code === 'bmo') return 'Before Open'
  if (code === 'amc') return 'After Close'
  return 'During Hours'
}

export async function GET() {
  const key = process.env.FMP_API_KEY
  if (!key) return NextResponse.json({ error: 'Missing API key' }, { status: 500 })

  const { from, to } = getWeekRange()

  try {
    const calUrl = `https://financialmodelingprep.com/stable/earnings-calendar?from=${from}&to=${to}&apikey=${key}`
    const calRes = await fetch(calUrl, { next: { revalidate: 3600 } })
    if (calRes.status === 402 || calRes.status === 403) {
      return NextResponse.json({ error: 'Earnings calendar not available on the free data plan.' }, { status: 402 })
    }
    if (!calRes.ok) throw new Error(`FMP earnings calendar ${calRes.status}`)

    const raw: FMPEarningsItem[] = await calRes.json()

    // Take up to 40 entries sorted by date, then fetch names in bulk
    const entries = raw
      .filter(e => e.symbol && e.date)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 40)

    if (entries.length === 0) {
      return NextResponse.json({ from, to, entries: [] })
    }

    // Fetch company names for all symbols in one batch
    const symbols = entries.map(e => e.symbol).join(',')
    const profileUrl = `https://financialmodelingprep.com/stable/profile?symbol=${symbols}&apikey=${key}`
    const profileRes = await fetch(profileUrl, { next: { revalidate: 86400 } })
    const profiles: FMPProfileItem[] = profileRes.ok ? await profileRes.json() : []

    const nameMap: Record<string, string> = {}
    for (const p of profiles) {
      nameMap[p.symbol] = p.companyName ?? p.name ?? p.symbol
    }

    const result: EarningsEntry[] = entries.map(e => ({
      symbol: e.symbol,
      name: nameMap[e.symbol] ?? e.symbol,
      date: e.date,
      epsEstimated: e.epsEstimated ?? null,
      time: timeLabel(e.time),
    }))

    return NextResponse.json({ from, to, entries: result })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
