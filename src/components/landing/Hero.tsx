'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { searchTickers, type Ticker } from '@/lib/tickers'
import styles from './Hero.module.css'

interface HeroProps {
  searchRef?: React.RefObject<HTMLInputElement | null>
}

export default function Hero({ searchRef }: HeroProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Ticker[]>([])
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const internalRef = useRef<HTMLInputElement>(null)
  const inputRef = searchRef || internalRef

  useEffect(() => {
    const r = searchTickers(query)
    setResults(r)
    setOpen(r.length > 0 && query.length > 0)
  }, [query])

  const navigate = (ticker: string) => {
    router.push(`/report/${ticker.toUpperCase()}`)
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
      navigate(query.trim())
    }
  }

  return (
    <section className={styles.hero}>
      <div className={styles.eyebrow}>
        <span className={styles.eyebrowLine} />
        AI-Powered Equity Research
        <span className={styles.eyebrowLine} />
      </div>

      <h1 className={styles.h1}>
        Institutional research.<br />
        <em>Instantly.</em>
      </h1>

      <p className={styles.sub}>
        Generate sell-side quality equity research reports on any public company.
        DCF valuation, comparable analysis, and AI-driven insights — in seconds.
      </p>

      <div className={styles.searchWrap}>
        <span className={styles.searchIcon}>⌕</span>
        <input
          ref={inputRef}
          type="text"
          className={styles.searchInput}
          placeholder="Enter a ticker — NVDA, AAPL, AMZN..."
          value={query}
          onChange={e => setQuery(e.target.value.toUpperCase())}
          onKeyDown={handleKey}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          autoComplete="off"
          spellCheck={false}
        />

        {open && (
          <div className={styles.dropdown}>
            {results.map(t => (
              <div
                key={t.t}
                className={styles.result}
                onMouseDown={() => navigate(t.t)}
              >
                <span className={styles.rTicker}>{t.t}</span>
                <span className={styles.rName}>{t.n}</span>
                <span className={styles.rGo}>Generate Report →</span>
              </div>
            ))}
          </div>
        )}

        <p className={styles.hint}>
          Press <kbd>Enter</kbd> to generate report
        </p>
      </div>
    </section>
  )
}
