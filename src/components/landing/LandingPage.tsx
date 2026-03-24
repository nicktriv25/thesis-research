'use client'

import Nav from '@/components/landing/Nav'
import Hero from '@/components/landing/Hero'
import Stats from '@/components/landing/Stats'
import TickerTape from '@/components/landing/TickerTape'
import Pillars from '@/components/landing/Pillars'
import PreviewCard from '@/components/landing/PreviewCard'
import EarningsCalendar from '@/components/landing/EarningsCalendar'
import styles from './LandingPage.module.css'

export default function LandingPage() {
  return (
    <div className={styles.landing}>
      <div className={styles.grid} aria-hidden />
      <div className={styles.glow} aria-hidden />

      <Nav />
      <Hero />
      <Stats />
      <TickerTape />
      <Pillars />
      <PreviewCard />
      <EarningsCalendar />

      <footer className={styles.footer}>
        <span className={styles.footerBrand}>Thesis Research © 2026</span>
        <div className={styles.footerLinks}>
          <a href="/about" className={styles.footerLink}>About</a>
          <a href="#" className={styles.footerLink}>Terms</a>
          <a href="#" className={styles.footerLink}>Privacy</a>
        </div>
      </footer>
    </div>
  )
}
