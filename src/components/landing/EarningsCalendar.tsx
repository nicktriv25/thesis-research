'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './EarningsCalendar.module.css'
import type { EarningsEntry } from '@/app/api/earnings/route'

interface EarningsResponse {
  from: string
  to: string
  entries: EarningsEntry[]
}

function formatDate(iso: string): string {
  const d = new Date(iso + 'T12:00:00Z')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function formatEPS(eps: number | null): string {
  if (eps === null) return '—'
  return `$${eps.toFixed(2)}`
}

function formatDateRange(from: string, to: string): string {
  const f = new Date(from + 'T12:00:00Z')
  const t = new Date(to + 'T12:00:00Z')
  const opts: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric' }
  return `${f.toLocaleDateString('en-US', opts)} – ${t.toLocaleDateString('en-US', { ...opts, year: 'numeric' })}`
}

export default function EarningsCalendar() {
  const [data, setData] = useState<EarningsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/earnings')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Earnings This Week</h2>
          {data && (
            <p className={styles.range}>{formatDateRange(data.from, data.to)}</p>
          )}
        </div>
        <p className={styles.hint}>Click any company to generate a report</p>
      </div>

      {loading && (
        <div className={styles.skeletonWrap}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`${styles.skeletonRow} shimmer`} />
          ))}
        </div>
      )}

      {!loading && data && data.entries.length === 0 && (
        <div className={styles.empty}>No earnings scheduled for this week.</div>
      )}

      {!loading && data && data.entries.length > 0 && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Company</th>
                <th className={styles.th}>Ticker</th>
                <th className={styles.th}>Date</th>
                <th className={styles.th}>When</th>
                <th className={`${styles.th} ${styles.right}`}>Est. EPS</th>
              </tr>
            </thead>
            <tbody>
              {data.entries.map((e, i) => (
                <tr
                  key={`${e.symbol}-${i}`}
                  className={styles.row}
                  onClick={() => router.push(`/report/${e.symbol}`)}
                >
                  <td className={styles.td}>
                    <span className={styles.company}>{e.name}</span>
                  </td>
                  <td className={styles.td}>
                    <span className={styles.ticker}>{e.symbol}</span>
                  </td>
                  <td className={styles.td}>
                    <span className={styles.date}>{formatDate(e.date)}</span>
                  </td>
                  <td className={styles.td}>
                    <span className={styles.time}>{e.time}</span>
                  </td>
                  <td className={`${styles.td} ${styles.right}`}>
                    <span className={styles.eps}>{formatEPS(e.epsEstimated)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
