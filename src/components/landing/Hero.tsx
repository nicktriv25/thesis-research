'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from './Hero.module.css'

interface SearchResult {
  t: string
  n: string
}

export default function Hero() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [open, setOpen] = useState(false)
  const [searching, setSearching] = useState(false)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) { setResults([]); setOpen(false); setSearching(false); return }

    setSearching(true)
    const controller = new AbortController()
    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: controller.signal })
        .then(r => r.json())
        .then((data: SearchResult[]) => {
          setResults(Array.isArray(data) ? data : [])
          setOpen(true)
          setSearching(false)
        })
        .catch(err => {
          if (err.name !== 'AbortError') { setResults([]); setOpen(false); setSearching(false) }
        })
    }, 220)

    return () => { clearTimeout(timer); controller.abort() }
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
        <svg className={styles.searchIcon} viewBox="0 0 20 20" fill="none" aria-hidden>
          <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M13 13l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
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
            {results.length > 0 ? results.map(t => (
              <div
                key={t.t}
                className={styles.result}
                onMouseDown={() => navigate(t.t)}
              >
                <span className={styles.rTicker}>{t.t}</span>
                <span className={styles.rName}>{t.n}</span>
                <span className={styles.rGo}>Generate Report →</span>
              </div>
            )) : (
              <div className={styles.noResults}>
                {searching ? 'Searching…' : `No results for "${query}" — press Enter to try anyway`}
              </div>
            )}
          </div>
        )}

        <p className={styles.hint}>
          Press <kbd>Enter</kbd> to generate report
        </p>
      </div>
    </section>
  )
}
