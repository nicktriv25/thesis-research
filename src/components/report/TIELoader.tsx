'use client'

import { useEffect, useState } from 'react'
import styles from './TIELoader.module.css'

const BRIEF_STEPS = [
  { label: 'Fetching market data',       activateAt: 0,     completeAt: 1500  },
  { label: 'Analyzing fundamentals',     activateAt: 1500,  completeAt: 4000  },
  { label: 'Writing research brief',     activateAt: 4000,  completeAt: 99999 },
]

const FULL_STEPS = [
  { label: 'Fetching market data',       activateAt: 0,     completeAt: 2000  },
  { label: 'Searching recent news',      activateAt: 2000,  completeAt: 8000  },
  { label: 'Building DCF model',         activateAt: 8000,  completeAt: 40000 },
  { label: 'Modeling scenarios',         activateAt: 40000, completeAt: 80000 },
  { label: 'Writing full analysis',      activateAt: 80000, completeAt: 99999 },
]

interface Props {
  ticker: string
  variant?: 'brief' | 'full'
}

export default function TIELoader({ ticker, variant = 'brief' }: Props) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const start = Date.now()
    const id = setInterval(() => setElapsed(Date.now() - start), 100)
    return () => clearInterval(id)
  }, [])

  const steps = variant === 'full' ? FULL_STEPS : BRIEF_STEPS
  const heading = variant === 'full' ? 'Generating Full Report' : 'Generating Research Brief'
  const timing = variant === 'full' ? 'typically 1–2 minutes' : 'typically under 15 seconds'

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>

        <h1 className={styles.heading}>{heading}</h1>
        <div className={styles.tickerBadge}>{ticker}</div>

        <div className={styles.steps}>
          {steps.map((step, i) => {
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
          <span className={styles.timing}>{timing}</span>
        </div>

      </div>
    </div>
  )
}
