'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './Stats.module.css'

function AnimatedNumber({ target, duration = 1500, suffix = '' }: { target: number; duration?: number; suffix?: string }) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !started.current) {
        started.current = true
        const start = performance.now()
        const step = (now: number) => {
          const progress = Math.min((now - start) / duration, 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          setValue(Math.round(eased * target))
          if (progress < 1) requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
        observer.disconnect()
      }
    })

    observer.observe(el)
    return () => observer.disconnect()
  }, [target, duration])

  return <span ref={ref}>{value.toLocaleString()}{suffix}</span>
}

export default function Stats() {
  const [reportsCount, setReportsCount] = useState(592)

  useEffect(() => {
    fetch('/api/counter')
      .then(r => r.json())
      .then(data => { if (typeof data.count === 'number') setReportsCount(data.count) })
      .catch(() => {/* keep default */})
  }, [])

  return (
    <div className={styles.stats}>
      <div className={styles.item}>
        <div className={styles.num}>
          <AnimatedNumber target={reportsCount} />
        </div>
        <div className={styles.label}>Reports Generated</div>
      </div>
      <div className={styles.item}>
        <div className={styles.num}>
          <AnimatedNumber target={200} suffix="+" />
        </div>
        <div className={styles.label}>Tickers Covered</div>
      </div>
      <div className={styles.item}>
        <div className={styles.num}>&lt;30s</div>
        <div className={styles.label}>Average Generation</div>
      </div>
    </div>
  )
}
