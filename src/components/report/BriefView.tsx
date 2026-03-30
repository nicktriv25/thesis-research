'use client'

import MetricsBar from './MetricsBar'
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

function parseParagraphs(text: string): string[] {
  return text.split('\n\n').map(p => p.trim()).filter(Boolean)
}

function parseBullets(text: string): string[] {
  return text
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.startsWith('•'))
    .map(l => l.replace(/^•\s*/, ''))
}

export default function BriefView({ brief, onGenerateFull, fullLoading }: Props) {
  const cls = ratingClass[brief.rating] ?? 'hold'
  const date = new Date(brief.generatedAt).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })

  const thesisParas = parseParagraphs(brief.investmentThesis.content)
  const whyNowItems = parseBullets(brief.whyNow.content)
  const riskParas   = parseParagraphs(brief.topRisks.content)

  return (
    <article id="report-content" className={styles.page}>

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
            <p className={styles.businessDesc}>{brief.businessDescription}</p>
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

      {/* Snapshot content */}
      <div className={styles.content}>

        {/* 1. Investment Summary */}
        <div className={styles.summaryCard}>
          <div className={styles.sectionLabel}>Investment Summary</div>
          <p className={styles.summaryText}>{brief.investmentSummary.content}</p>
        </div>

        {/* 2. Investment Thesis */}
        <div className={styles.section}>
          <div className={styles.sectionLabel}>Investment Thesis</div>
          {thesisParas.map((p, i) => (
            <p key={i} className={styles.bodyText}>{p}</p>
          ))}
        </div>

        {/* 3. Why Now */}
        <div className={styles.section}>
          <div className={styles.sectionLabel}>Why Now</div>
          <ul className={styles.whyNowList}>
            {whyNowItems.map((item, i) => (
              <li key={i} className={styles.whyNowItem}>{item}</li>
            ))}
          </ul>
        </div>

        {/* 4. Key Risks */}
        <div className={styles.section}>
          <div className={styles.sectionLabel}>Key Risks</div>
          {riskParas.map((p, i) => (
            <p key={i} className={styles.riskText}>{p}</p>
          ))}
        </div>

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
