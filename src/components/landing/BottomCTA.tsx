'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './BottomCTA.module.css'

export default function BottomCTA() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
      router.push(`/report/${query.trim().toUpperCase()}`)
    }
  }

  return (
    <div className={styles.wrap}>
      <h2 className={styles.heading}>Run your analysis.</h2>
      <div className={styles.searchWrap}>
        <span className={styles.icon}>⌕</span>
        <input
          type="text"
          className={styles.input}
          placeholder="Enter a ticker..."
          value={query}
          onChange={e => setQuery(e.target.value.toUpperCase())}
          onKeyDown={handleKey}
          autoComplete="off"
          spellCheck={false}
        />
      </div>
    </div>
  )
}
