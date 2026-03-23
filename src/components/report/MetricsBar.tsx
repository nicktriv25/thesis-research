import type { KeyMetric } from '@/lib/types'
import styles from './MetricsBar.module.css'

interface Props {
  metrics: KeyMetric[]
}

export default function MetricsBar({ metrics }: Props) {
  return (
    <div className={styles.bar}>
      {metrics.map(m => (
        <div key={m.label} className={styles.metric}>
          <div className={styles.label}>{m.label}</div>
          <div className={styles.value}>{m.value}</div>
          {m.sub && <div className={styles.sub}>{m.sub}</div>}
        </div>
      ))}
    </div>
  )
}
