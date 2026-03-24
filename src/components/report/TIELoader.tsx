'use client'

import { useEffect, useState } from 'react'
import styles from './TIELoader.module.css'

const STEPS = [
  { label: 'Fetching market data',      activateAt: 0,    completeAt: 2000  },
  { label: 'Analyzing financials',      activateAt: 2000, completeAt: 4000  },
  { label: 'Writing investment thesis', activateAt: 4000, completeAt: 6000  },
  { label: 'Building DCF model',        activateAt: 6000, completeAt: 99999 },
]

interface Props {
  ticker: string
}

export default function TIELoader({ ticker }: Props) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const start = Date.now()
    const id = setInterval(() => setElapsed(Date.now() - start), 100)
    return () => clearInterval(id)
  }, [])

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>

        <h1 className={styles.heading}>Generating Report</h1>
        <div className={styles.tickerBadge}>{ticker}</div>

        <div className={styles.steps}>
          {STEPS.map((step, i) => {
            const isComplete = elapsed >= step.completeAt
            const isActive   = elapsed >= step.activateAt && !isComplete
            const isPending  = elapsed < step.activateAt

            return (
              <div
                key={i}
                className={[
                  styles.step,
                  isComplete ? styles.complete : '',
                  isActive   ? styles.active   : '',
                  isPending  ? styles.pending  : '',
                ].join(' ')}
              >
                <div className={styles.iconWrap}>
                  {isComplete && (
                    <svg className={styles.checkIcon} viewBox="0 0 16 16" fill="none">
                      <path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  {isActive && <span className={styles.spinner} />}
                  {isPending && <span className={styles.emptyDot} />}
                </div>
                <span className={styles.stepLabel}>{step.label}</span>
                {isActive && (
                  <span className={styles.activePulse}>
                    <span />
                    <span />
                    <span />
                  </span>
                )}
                {isComplete && <span className={styles.doneTag}>done</span>}
              </div>
            )
          })}
        </div>

        <div className={styles.footer}>
          <span className={styles.model}>claude-sonnet-4-20250514</span>
          <span className={styles.sep}>·</span>
          <span className={styles.timing}>typically 15–30 seconds</span>
        </div>

      </div>
    </div>
  )
}
