'use client'

import styles from './Nav.module.css'

interface NavProps {
  onCTAClick: () => void
}

export default function Nav({ onCTAClick }: NavProps) {
  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>
        Thesis<span>research</span>
      </div>
      <div className={styles.links}>
        <button className={styles.cta} onClick={onCTAClick}>
          Generate Report
        </button>
      </div>
    </nav>
  )
}
