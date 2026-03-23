'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import ReportNav from '@/components/report/ReportNav'
import ReportView from '@/components/report/ReportView'
import ReportSkeleton from '@/components/report/ReportSkeleton'
import type { TIEReport } from '@/lib/types'
import styles from './page.module.css'

export default function ReportPage() {
  const params = useParams()
  const ticker = (params?.ticker as string ?? '').toUpperCase()

  const [report, setReport] = useState<TIEReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!ticker) return

    setLoading(true)
    setError(null)
    setReport(null)

    const controller = new AbortController()

    // Session 2: all tickers fetch live data from FMP via the API route
    fetch(`/api/report/${ticker}`, { signal: controller.signal })
      .then(async res => {
        if (!res.ok) throw new Error(`Failed to fetch data for ${ticker}`)
        return res.json() as Promise<TIEReport>
      })
      .then(data => {
        setReport(data)
        setLoading(false)
      })
      .catch(err => {
        if (err.name === 'AbortError') return
        setError(err.message)
        setLoading(false)
      })

    return () => controller.abort()
  }, [ticker])

  return (
    <div className={styles.bg}>
      <ReportNav />

      {loading && <ReportSkeleton ticker={ticker} />}

      {error && (
        <div className={styles.error}>
          <div className={styles.errorInner}>
            <div className={styles.errorCode}>404</div>
            <h1 className={styles.errorTitle}>Report unavailable</h1>
            <p className={styles.errorBody}>
              We couldn&apos;t generate a report for <strong>{ticker}</strong>.
              This ticker may not be publicly traded, or TIE may not have sufficient data.
            </p>
            <p className={styles.errorNote}>{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && report && (
        <ReportView report={report} />
      )}
    </div>
  )
}
