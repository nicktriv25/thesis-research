'use client'

import { useRef } from 'react'
import Nav from '@/components/landing/Nav'
import Hero from '@/components/landing/Hero'
import Stats from '@/components/landing/Stats'
import TickerTape from '@/components/landing/TickerTape'
import Pillars from '@/components/landing/Pillars'
import PreviewCard from '@/components/landing/PreviewCard'
import BottomCTA from '@/components/landing/BottomCTA'
import styles from './LandingPage.module.css'

export default function LandingPage() {
  const searchRef = useRef<HTMLInputElement>(null)

  const focusSearch = () => {
    searchRef.current?.focus()
    searchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <div className={styles.landing}>
      {/* Decorative backgrounds */}
      <div className={styles.grid} aria-hidden />
      <div className={styles.glow} aria-hidden />

      <Nav onCTAClick={focusSearch} />
      <Hero searchRef={searchRef} />
      <Stats />
      <TickerTape />
      <Pillars />
      <PreviewCard />
      <BottomCTA />

      <footer className={styles.footer}>
        <span className={styles.footerBrand}>Thesis Research © 2026</span>
        <div className={styles.footerLinks}>
          <a href="#" className={styles.footerLink}>Terms</a>
          <a href="#" className={styles.footerLink}>Privacy</a>
        </div>
      </footer>
    </div>
  )
}
