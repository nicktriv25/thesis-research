import type { Comparable } from '@/lib/types'
import styles from './Comparables.module.css'

interface Props {
  comparables: Comparable[]
  focusTicker: string
}

export default function Comparables({ comparables, focusTicker }: Props) {
  return (
    <div className={styles.wrap}>
      <h2 className={styles.sectionTitle}>Comparable Companies</h2>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thLeft}>Company</th>
              <th>Price</th>
              <th>Mkt Cap</th>
              <th>P/E (Fwd)</th>
              <th>EV/Revenue</th>
              <th>Rev Growth</th>
              <th>Gross Margin</th>
            </tr>
          </thead>
          <tbody>
            {comparables.map(c => (
              <tr
                key={c.ticker}
                className={c.ticker === focusTicker ? styles.focusRow : ''}
              >
                <td className={styles.tdLeft}>
                  <span className={styles.ticker}>{c.ticker}</span>
                  <span className={styles.name}>{c.name}</span>
                </td>
                <td>{c.price}</td>
                <td>{c.marketCap}</td>
                <td>{c.peForward}</td>
                <td>{c.evRevenue}</td>
                <td className={
                  c.revenueGrowth.startsWith('+') ? styles.positive :
                  c.revenueGrowth.startsWith('-') ? styles.negative : ''
                }>
                  {c.revenueGrowth}
                </td>
                <td>{c.grossMargin}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
