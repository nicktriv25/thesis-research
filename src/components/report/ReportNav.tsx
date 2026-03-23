'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { searchTickers, type Ticker } from '@/lib/tickers'
import styles from './ReportNav.module.css'

export default function ReportNav() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Ticker[]>([])
  const [open, setOpen] = useState(false)

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value.toUpperCase()
    setQuery(q)
    const r = searchTickers(q)
    setResults(r)
    setOpen(r.length > 0 && q.length > 0)
  }

  const navigate = (ticker: string) => {
    setQuery('')
    setOpen(false)
    router.push(`/report/${ticker}`)
  }

  return (
    <nav className={styles.nav}>
      <span className={styles.brand} onClick={() => router.push('/')}>
        Thesis<span>research</span>
      </span>

      <div className={styles.divider} />

      <div className={styles.searchWrap}>
        <span className={styles.searchIcon}>⌕</span>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search ticker..."
          value={query}
          onChange={handleInput}
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
              </div>
            ))}
          </div>
        )}
      </div>

      <button className={styles.back} onClick={() => router.push('/')}>
        ← Back
      </button>
    </nav>
  )
}
