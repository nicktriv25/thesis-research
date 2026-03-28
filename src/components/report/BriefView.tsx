'use client'

import MetricsBar from './MetricsBar'
import NarrativeSection from './NarrativeSection'
import type { TIEBriefReport } from '@/lib/types'
import styles from './BriefView.module.css'

interface Props {
  brief: TIEBriefReport
  onGenerateFull: () => void
  fullLoading?: boolean
}

const ratingClass: Record<string, string> = {
  BUY: 'buy', HOLD: 'hold', SELL: 'sell',
}

export default function BriefView({ brief, onGenerateFull, fullLoading }: Props) {
  const cls = ratingClass[brief.rating] ?? 'hold'
  const date = new Date(brief.generatedAt).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })

  return (
    <article className={styles.page}>

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.eyebrow}>
          <span className={styles.briefTag}>Research Brief</span>
          <span className={styles.dot} />
          <span>{date}</span>
          <span className={styles.dot} />
          <span>{brief.sector}</span>
        </div>

        <div className={styles.top}>
          <div className={styles.identity}>
            <div className={styles.exchange}>{brief.exchange}: {brief.ticker}</div>
            <h1 className={styles.company}>{brief.companyName}</h1>
            <p className={styles.sector}>{brief.sector}</p>
          </div>

          <div className={`${styles.ratingBox} ${styles[cls]}`}>
            <div className={styles.ratingLabel}>Rating</div>
            <div className={styles.ratingAction}>{brief.rating}</div>
            <div className={styles.ratingTarget}>PT ${brief.priceTarget.base.toFixed(2)}</div>
          </div>
        </div>
      </header>

      {/* Metrics bar */}
      <MetricsBar metrics={brief.metrics} />

      {/* Narrative */}
      <div className={styles.content}>
        <NarrativeSection section={brief.investmentThesis} />
        <NarrativeSection section={brief.topRisks} />
      </div>

      {/* CTA — upgrade to full report */}
      <div className={styles.cta}>
        <div className={styles.ctaInner}>
          <div className={styles.ctaLeft}>
            <p className={styles.ctaLabel}>Full Institutional Report</p>
            <h2 className={styles.ctaTitle}>Go deeper with the complete TIE analysis</h2>
            <ul className={styles.ctaList}>
              <li>DCF valuation model with 5-year projections</li>
              <li>Bull / Base / Bear scenario analysis</li>
              <li>Comparable company multiples table</li>
              <li>Business overview &amp; financial analysis</li>
              <li>Recent news &amp; analyst coverage (web search)</li>
            </ul>
          </div>
          <div className={styles.ctaRight}>
            <button
              className={styles.ctaBtn}
              onClick={onGenerateFull}
              disabled={fullLoading}
            >
              {fullLoading ? 'Generating…' : 'Generate Full Institutional Report →'}
            </button>
            <p className={styles.ctaTiming}>Typically 1–2 minutes</p>
          </div>
        </div>
      </div>

    </article>
  )
}
