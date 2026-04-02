import type { Comparable } from '@/lib/types'
import styles from './Comparables.module.css'

interface Props {
  comparables: Comparable[]
  focusTicker: string
}

function parseMultiple(s: string): number | null {
  const clean = s.replace(/[xX]/g, '').trim()
  const n = parseFloat(clean)
  return isNaN(n) ? null : n
}

function parsePercent(s: string): number | null {
  const clean = s.replace(/[%+]/g, '').trim()
  const n = parseFloat(clean)
  return isNaN(n) ? null : n
}

function median(nums: number[]): number {
  const sorted = [...nums].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
}

export default function Comparables({ comparables, focusTicker }: Props) {
  const peers = comparables.filter(c => c.ticker !== focusTicker)

  const peMeds  = peers.map(c => parseMultiple(c.peForward)).filter((n): n is number => n !== null)
  const evMeds  = peers.map(c => parseMultiple(c.evRevenue)).filter((n): n is number => n !== null)
  const revMeds = peers.map(c => parsePercent(c.revenueGrowth)).filter((n): n is number => n !== null)
  const gmMeds  = peers.map(c => parsePercent(c.grossMargin)).filter((n): n is number => n !== null)

  const medPE  = peMeds.length  ? median(peMeds).toFixed(1)  + 'x'  : '—'
  const medEV  = evMeds.length  ? median(evMeds).toFixed(1)  + 'x'  : '—'
  const medRevG = revMeds.length ? (median(revMeds) >= 0 ? '+' : '') + median(revMeds).toFixed(1) + '%' : '—'
  const medGM  = gmMeds.length  ? median(gmMeds).toFixed(1)  + '%'  : '—'

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
          <tfoot>
            <tr className={styles.medianRow}>
              <td className={styles.tdLeft}>
                <span className={styles.medianLabel}>Peer Median</span>
              </td>
              <td>—</td>
              <td>—</td>
              <td>{medPE}</td>
              <td>{medEV}</td>
              <td>{medRevG}</td>
              <td>{medGM}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
