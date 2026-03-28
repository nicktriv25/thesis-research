import { NextResponse } from 'next/server'

export interface EarningsEntry {
  symbol: string
  name: string
  date: string
  epsEstimated: number | null
  time: string
}

function getWeekRange(): { from: string; to: string } {
  const now = new Date()
  const day = now.getUTCDay()
  const diffToMon = day === 0 ? -6 : 1 - day
  const mon = new Date(now)
  mon.setUTCDate(now.getUTCDate() + diffToMon)
  const fri = new Date(mon)
  fri.setUTCDate(mon.getUTCDate() + 4)

  const fmt = (d: Date) => d.toISOString().slice(0, 10)
  return { from: fmt(mon), to: fmt(fri) }
}

export async function GET() {
  // Polygon.io does not provide an upcoming earnings calendar endpoint.
  // Return an empty entries list so the UI renders its "no earnings" state.
  const { from, to } = getWeekRange()
  return NextResponse.json({ from, to, entries: [] as EarningsEntry[] })
}
