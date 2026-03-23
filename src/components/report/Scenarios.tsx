import type { ScenarioCase } from '@/lib/types'
import styles from './Scenarios.module.css'

interface Props {
  scenarios: ScenarioCase[]
  currentPrice: number
}

export default function Scenarios({ scenarios, currentPrice }: Props) {
  return (
    <div className={styles.wrap}>
      <h2 className={styles.sectionTitle}>Price Target Scenarios</h2>
      <div className={styles.grid}>
        {scenarios.map(s => {
          const isBull = s.label.toLowerCase().includes('bull')
          const isBear = s.label.toLowerCase().includes('bear')
          const cls = isBull ? styles.bull : isBear ? styles.bear : styles.base
          const sign = s.upside >= 0 ? '+' : ''

          return (
            <div key={s.label} className={`${styles.card} ${cls}`}>
              <div className={styles.cardHeader}>
                <span className={styles.caseLabel}>{s.label}</span>
                <div className={styles.caseTarget}>${s.target}</div>
                <div className={styles.caseUpside}>{sign}{s.upside.toFixed(1)}%</div>
              </div>
              <p className={styles.caseDesc}>{s.description}</p>
              <ul className={styles.assumptions}>
                {s.keyAssumptions.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}
