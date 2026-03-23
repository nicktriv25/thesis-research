import type { TIEReport } from '@/lib/types'
import styles from './ReportHeader.module.css'

const ratingClass: Record<string, string> = {
  BUY:         'buy',
  OUTPERFORM:  'buy',
  HOLD:        'hold',
  SELL:        'sell',
  UNDERPERFORM:'sell',
}

interface Props {
  report: TIEReport
}

export default function ReportHeader({ report }: Props) {
  const cls = ratingClass[report.rating] ?? 'hold'
  const date = new Date(report.generatedAt).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })

  return (
    <header className={styles.header}>
      <div className={styles.eyebrow}>
        <span>{report.reportType}</span>
        <span className={styles.dot} />
        <span>{date}</span>
        <span className={styles.dot} />
        <span>{report.sector.split('&')[0].trim()}</span>
      </div>

      <div className={styles.top}>
        <div className={styles.identity}>
          <div className={styles.exchange}>{report.exchange}: {report.ticker}</div>
          <h1 className={styles.company}>{report.companyName}</h1>
          <p className={styles.sector}>{report.sector}</p>
        </div>

        <div className={`${styles.ratingBox} ${styles[cls]}`}>
          <div className={styles.ratingLabel}>Rating</div>
          <div className={styles.ratingAction}>{report.rating}</div>
          <div className={styles.ratingTarget}>
            PT ${report.priceTarget.base.toFixed(2)}
          </div>
        </div>
      </div>
    </header>
  )
}
