'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import styles from './ReportNav.module.css'

interface SearchResult {
  t: string
  n: string
  exchange: string
}

export default function ReportNav() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [open, setOpen] = useState(false)
  const controllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const q = query.trim()
    if (!q) { setResults([]); setOpen(false); return }

    const timer = setTimeout(() => {
      controllerRef.current?.abort()
      const controller = new AbortController()
      controllerRef.current = controller

      fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: controller.signal })
        .then(r => r.json())
        .then((data: SearchResult[]) => {
          setResults(data)
          setOpen(data.length > 0)
        })
        .catch(() => {})
    }, 220)

    return () => clearTimeout(timer)
  }, [query])

  const navigate = (ticker: string) => {
    setQuery('')
    setOpen(false)
    router.push(`/report/${ticker}`)
  }

  return (
    <nav className={styles.nav}>
      <span className={styles.brand} onClick={() => router.push('/')}>
        Thesis
      </span>

      <div className={styles.divider} />

      <div className={styles.searchWrap}>
        <span className={styles.searchIcon}>⌕</span>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search any ticker..."
          value={query}
          onChange={e => setQuery(e.target.value.toUpperCase())}
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
