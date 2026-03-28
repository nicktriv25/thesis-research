'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import ReportNav from '@/components/report/ReportNav'
import ReportView from '@/components/report/ReportView'
import BriefView from '@/components/report/BriefView'
import TIELoader from '@/components/report/TIELoader'
import type { TIEReport, TIEBriefReport } from '@/lib/types'
import styles from './page.module.css'

interface ReportError {
  code: 'plan_restricted' | 'not_found' | 'rate_limited' | 'internal' | 'unknown'
  message: string
}

type Phase =
  | { status: 'loading-brief' }
  | { status: 'brief'; data: TIEBriefReport }
  | { status: 'loading-full'; brief: TIEBriefReport }
  | { status: 'full'; data: TIEReport }
  | { status: 'error'; error: ReportError }

export default function ReportPage() {
  const params = useParams()
  const ticker = (params?.ticker as string ?? '').toUpperCase()

  const [phase, setPhase] = useState<Phase>({ status: 'loading-brief' })

  // Phase 1: load the research brief
  useEffect(() => {
    if (!ticker) return
    setPhase({ status: 'loading-brief' })

    const controller = new AbortController()

    fetch(`/api/brief/${ticker}`, { signal: controller.signal })
      .then(async res => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          const err = Object.assign(new Error(body.error ?? `Failed to fetch brief for ${ticker}`), {
            code: body.code ?? 'unknown',
          })
          throw err
        }
        return res.json() as Promise<TIEBriefReport>
      })
      .then(data => setPhase({ status: 'brief', data }))
      .catch(err => {
        if (err.name === 'AbortError') return
        setPhase({
          status: 'error',
          error: { code: err.code ?? 'unknown', message: err.message },
        })
      })

    return () => controller.abort()
  }, [ticker])

  // Phase 2: generate the full report (triggered by user)
  function handleGenerateFull(brief: TIEBriefReport) {
    setPhase({ status: 'loading-full', brief })

    fetch(`/api/report/${ticker}`)
      .then(async res => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          const err = Object.assign(new Error(body.error ?? `Failed to fetch report for ${ticker}`), {
            code: body.code ?? 'unknown',
          })
          throw err
        }
        return res.json() as Promise<TIEReport>
      })
      .then(data => setPhase({ status: 'full', data }))
      .catch(err => {
        // On full-report failure, fall back to brief view with the error surfaced
        setPhase({ status: 'brief', data: brief })
        // Surface the error as a non-blocking alert
        console.error('Full report generation failed:', err.message)
      })
  }

  function errorBody(e: ReportError): string {
    if (e.code === 'plan_restricted') return `Market data unavailable for ${ticker}. The data provider may lack coverage for this ticker.`
    if (e.code === 'not_found') return `No market data found for ${ticker}. Check the ticker symbol is correct and the company is actively traded.`
    if (e.code === 'rate_limited') return `Rate limited — please wait a moment and try again for ${ticker}.`
    return `We couldn't generate a report for ${ticker}.`
  }

  return (
    <div className={styles.bg}>
      <ReportNav ticker={ticker} />

      {phase.status === 'loading-brief' && (
        <TIELoader ticker={ticker} variant="brief" />
      )}

      {phase.status === 'loading-full' && (
        <TIELoader ticker={ticker} variant="full" />
      )}

      {phase.status === 'brief' && (
        <BriefView
          brief={phase.data}
          onGenerateFull={() => handleGenerateFull(phase.data)}
        />
      )}

      {phase.status === 'full' && (
        <ReportView report={phase.data} />
      )}

      {phase.status === 'error' && (
        <div className={styles.error}>
          <div className={styles.errorInner}>
            <div className={styles.errorCode}>
              {phase.error.code === 'plan_restricted' ? '402'
                : phase.error.code === 'not_found' ? '404'
                : phase.error.code === 'rate_limited' ? '429'
                : '500'}
            </div>
            <h1 className={styles.errorTitle}>Report unavailable</h1>
            <p className={styles.errorBody}>{errorBody(phase.error)}</p>
            <p className={styles.errorNote}>{phase.error.message}</p>
          </div>
        </div>
      )}
    </div>
  )
}
