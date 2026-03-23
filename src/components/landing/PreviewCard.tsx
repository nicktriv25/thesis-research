'use client'

import { useRouter } from 'next/navigation'
import styles from './PreviewCard.module.css'

export default function PreviewCard() {
  const router = useRouter()

  return (
    <div className={styles.section}>
      <p className={styles.label}>Sample Report Preview</p>
      <div
        className={styles.frame}
        onClick={() => router.push('/report/NVDA')}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && router.push('/report/NVDA')}
      >
        {/* Report header */}
        <div className={styles.miniHeader}>
          <span className={styles.miniBrand}>Thesis</span>
          <span className={styles.miniDate}>March 20, 2026 · Initiation of Coverage</span>
        </div>

        {/* Company + rating */}
        <div className={styles.miniHero}>
          <div className={styles.miniLeft}>
            <div className={styles.miniExchange}>NASDAQ: NVDA</div>
            <div className={styles.miniCompany}>NVIDIA Corporation</div>
            <div className={styles.miniSector}>AI Infrastructure &amp; Data Center Semiconductors</div>
          </div>
          <div className={styles.miniRating}>
            <div className={styles.miniRatingLabel}>Rating</div>
            <div className={styles.miniRatingAction}>BUY</div>
            <div className={styles.miniRatingTarget}>PT $235</div>
          </div>
        </div>

        {/* Metrics bar */}
        <div className={styles.miniMetrics}>
          {[
            { l: 'Price',   v: '$174.90' },
            { l: 'Mkt Cap', v: '$4.28T'  },
            { l: 'P/E',     v: '34.8x'   },
            { l: 'EV/Rev',  v: '27.2x'   },
            { l: 'Growth',  v: '+62%'    },
            { l: 'Margin',  v: '73.5%'   },
          ].map(m => (
            <div key={m.l} className={styles.miniMetric}>
              <div className={styles.miniMetricLabel}>{m.l}</div>
              <div className={styles.miniMetricValue}>{m.v}</div>
            </div>
          ))}
        </div>

        {/* Fade CTA */}
        <div className={styles.miniFade}>
          <span className={styles.miniCta}>Click to view full report →</span>
        </div>
      </div>
    </div>
  )
}
