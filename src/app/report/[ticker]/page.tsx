'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import ReportNav from '@/components/report/ReportNav'
import ReportView from '@/components/report/ReportView'
import TIELoader from '@/components/report/TIELoader'
import type { TIEReport } from '@/lib/types'
import styles from './page.module.css'

interface ReportError {
  code: 'plan_restricted' | 'not_found' | 'rate_limited' | 'internal' | 'unknown'
  message: string
}

export default function ReportPage() {
  const params = useParams()
  const ticker = (params?.ticker as string ?? '').toUpperCase()

  const [report, setReport] = useState<TIEReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ReportError | null>(null)

  useEffect(() => {
    if (!ticker) return

    setLoading(true)
    setError(null)
    setReport(null)

    const controller = new AbortController()

    fetch(`/api/report/${ticker}`, { signal: controller.signal })
      .then(async res => {
        if (!res.ok) {
          // Read the actual error from the API response body
          const body = await res.json().catch(() => ({}))
          const code = body.code ?? 'unknown'
          const message = body.error ?? `Failed to fetch report for ${ticker}`
          const err = Object.assign(new Error(message), { code })
          throw err
        }
        return res.json() as Promise<TIEReport>
      })
      .then(data => {
        setReport(data)
        setLoading(false)
      })
      .catch(err => {
        if (err.name === 'AbortError') return
        setError({
          code: err.code ?? 'unknown',
          message: err.message,
        })
        setLoading(false)
      })

    return () => controller.abort()
  }, [ticker])

  function errorBody(e: ReportError): string {
    if (e.code === 'plan_restricted') {
      return `Data unavailable for ${ticker} on the free data plan. Some tickers require a premium FMP subscription.`
    }
    if (e.code === 'not_found') {
      return `No market data found for ${ticker}. Check the ticker symbol is correct and the company is actively traded.`
    }
    if (e.code === 'rate_limited') {
      return `Rate limited — please wait a moment and try again for ${ticker}.`
    }
    return `We couldn't generate a report for ${ticker}.`
  }

  return (
    <div className={styles.bg}>
      <ReportNav />

      {loading && <TIELoader ticker={ticker} />}

      {error && (
        <div className={styles.error}>
          <div className={styles.errorInner}>
            <div className={styles.errorCode}>
              {error.code === 'plan_restricted' ? '402' : error.code === 'not_found' ? '404' : error.code === 'rate_limited' ? '429' : '500'}
            </div>
            <h1 className={styles.errorTitle}>Report unavailable</h1>
            <p className={styles.errorBody}>{errorBody(error)}</p>
            <p className={styles.errorNote}>{error.message}</p>
          </div>
        </div>
      )}

      {!loading && !error && report && (
        <ReportView report={report} />
      )}
    </div>
  )
}
