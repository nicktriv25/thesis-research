'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import styles from './ReportNav.module.css'

interface SearchResult {
  t: string
  n: string
}

export default function ReportNav() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const controllerRef = useRef<AbortController | null>(null)
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) { setResults([]); setOpen(false); return }

    const timer = setTimeout(() => {
      controllerRef.current?.abort()
      const controller = new AbortController()
      controllerRef.current = controller

      fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: controller.signal })
        .then(r => r.json())
        .then((data: unknown) => {
          const list = Array.isArray(data) ? (data as SearchResult[]) : []
          setResults(list)
          setOpen(list.length > 0)
        })
        .catch(() => {})
    }, 220)

    return () => clearTimeout(timer)
  }, [query])

  // Clean up copy timer on unmount
  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
    }
  }, [])

  const navigate = (ticker: string) => {
    setQuery('')
    setOpen(false)
    router.push(`/report/${ticker}`)
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API unavailable — no-op
    }
  }

  const handlePrint = () => {
    window.print()
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

      <div className={styles.actions}>
        <button className={styles.actionBtn} onClick={handleShare} title="Copy link to clipboard">
          {copied ? <span className={styles.copied}>Copied!</span> : (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                <polyline points="16 6 12 2 8 6"/>
                <line x1="12" y1="2" x2="12" y2="15"/>
              </svg>
              Share
            </>
          )}
        </button>

        <button className={styles.actionBtn} onClick={handlePrint} title="Download as PDF">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9"/>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
            <rect x="6" y="14" width="12" height="8"/>
          </svg>
          PDF
        </button>
      </div>

      <button className={styles.back} onClick={() => router.push('/')}>
        ← Back
      </button>
    </nav>
  )
}
