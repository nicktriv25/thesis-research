'use client'

import { useRouter } from 'next/navigation'
import { TICKERS } from '@/lib/tickers'
import styles from './TickerTape.module.css'

export default function TickerTape() {
  const router = useRouter()

  return (
    <div className={styles.section}>
      <p className={styles.label}>Recently Analyzed Companies</p>
      <div className={styles.overflow}>
        <div className={styles.tape}>
          {[...TICKERS, ...TICKERS].map((t, i) => (
            <div
              key={`${t.t}-${i}`}
              className={styles.item}
              onClick={() => router.push(`/report/${t.t}`)}
            >
              <span className={styles.ticker}>{t.t}</span>
              <span className={styles.name}>{t.n}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
