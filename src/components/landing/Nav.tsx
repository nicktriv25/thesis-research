'use client'

import { useRouter } from 'next/navigation'
import styles from './Nav.module.css'

export default function Nav() {
  const router = useRouter()

  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>
        Thesis
      </div>
      <div className={styles.links}>
        <button className={styles.about} onClick={() => router.push('/about')}>
          About
        </button>
      </div>
    </nav>
  )
}
