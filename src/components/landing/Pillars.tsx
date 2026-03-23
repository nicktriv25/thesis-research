import styles from './Pillars.module.css'

const PILLARS = [
  {
    icon: '◎',
    title: 'DCF Valuation',
    body: 'Full discounted cash flow model with customizable WACC, terminal growth, and multi-stage revenue forecasts. See the intrinsic value behind the price.',
    color: 'blue',
  },
  {
    icon: '⊞',
    title: 'Comparable Analysis',
    body: 'AI identifies the most relevant peers and builds a comp table with forward multiples, growth rates, and margin profiles. Spot the outliers instantly.',
    color: 'gold',
  },
  {
    icon: '◆',
    title: 'Scenario Modeling',
    body: 'Bull, base, and bear case price targets backed by specific assumptions. Understand the upside and the risk before you commit capital.',
    color: 'green',
  },
]

export default function Pillars() {
  return (
    <div className={styles.grid}>
      {PILLARS.map(p => (
        <div key={p.title} className={`${styles.pillar} ${styles[p.color]}`}>
          <div className={styles.icon}>{p.icon}</div>
          <h3 className={styles.title}>{p.title}</h3>
          <p className={styles.body}>{p.body}</p>
        </div>
      ))}
    </div>
  )
}
