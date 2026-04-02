import type { TIEReport } from '@/lib/types'
import styles from './ReportHeader.module.css'

const ratingClass: Record<string, string> = {
  BUY:          'buy',
  OUTPERFORM:   'buy',
  HOLD:         'hold',
  SELL:         'sell',
  UNDERPERFORM: 'sell',
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
      <div className={styles.banner}>
        <span className={styles.bannerBrand}>THESIS</span>
        <span className={styles.bannerMeta}>{report.reportType} · {date}</span>
      </div>

      <div className={styles.body}>
        <div className={styles.identity}>
          <div className={styles.tickerLine}>{report.exchange}: {report.ticker}</div>
          <h1 className={styles.company}>{report.companyName}</h1>
          {report.businessDescription && (
            <p className={styles.description}>{report.businessDescription}</p>
          )}
        </div>

        <div className={`${styles.ratingBox} ${styles[cls]}`}>
          <div className={styles.ratingLabel}>Rating</div>
          <div className={styles.ratingAction}>{report.rating}</div>
          <div className={styles.ratingTarget}>PT ${report.priceTarget.base.toFixed(2)}</div>
        </div>
      </div>
    </header>
  )
}
