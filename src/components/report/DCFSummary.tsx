import type { DCFOutput } from '@/lib/types'
import styles from './DCFSummary.module.css'

interface Props {
  dcf: DCFOutput
  currentPrice: number
}

export default function DCFSummary({ dcf, currentPrice }: Props) {
  const upside = ((dcf.intrinsicValue - currentPrice) / currentPrice * 100).toFixed(1)
  const sign = parseFloat(upside) >= 0 ? '+' : ''

  return (
    <div className={styles.wrap}>
      <h2 className={styles.sectionTitle}>DCF Valuation</h2>

      <div className={styles.topRow}>
        <div className={styles.verdict}>
          <div className={styles.verdictLabel}>Intrinsic Value</div>
          <div className={styles.verdictValue}>${dcf.intrinsicValue}</div>
          <div className={`${styles.verdictUpside} ${parseFloat(upside) >= 0 ? styles.pos : styles.neg}`}>
            {sign}{upside}% vs current price
          </div>
        </div>

        <div className={styles.inputs}>
          <div className={styles.inputsTitle}>Model Inputs</div>
          <div className={styles.inputsGrid}>
            <div className={styles.inputItem}>
              <span className={styles.inputLabel}>WACC</span>
              <span className={styles.inputValue}>{dcf.inputs.wacc}%</span>
            </div>
            <div className={styles.inputItem}>
              <span className={styles.inputLabel}>Terminal Growth</span>
              <span className={styles.inputValue}>{dcf.inputs.terminalGrowthRate}%</span>
            </div>
            <div className={styles.inputItem}>
              <span className={styles.inputLabel}>Rev CAGR</span>
              <span className={styles.inputValue}>{dcf.inputs.revenueCAGR}%</span>
            </div>
            <div className={styles.inputItem}>
              <span className={styles.inputLabel}>Projection</span>
              <span className={styles.inputValue}>{dcf.inputs.projectionYears}yr</span>
            </div>
          </div>
        </div>
      </div>

      {/* Projection table */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Year</th>
              <th>Revenue ($B)</th>
              <th>FCF ($B)</th>
              <th>Discounted FCF ($B)</th>
            </tr>
          </thead>
          <tbody>
            {dcf.yearlyProjections.map(row => (
              <tr key={row.year}>
                <td className={styles.yearCol}>{row.year}E</td>
                <td>${row.revenue.toFixed(1)}</td>
                <td>${row.fcf.toFixed(1)}</td>
                <td>${row.discountedFCF.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
