import type { TIEReport } from '@/lib/types'
import styles from './SnapshotCard.module.css'

interface Props {
  report: TIEReport
}

function parseBullets(content: string): string[] {
  return content
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.startsWith('•'))
    .map(l => l.replace(/^•\s*/, ''))
}

function parseParagraphs(content: string): string[] {
  return content.split('\n\n').filter(Boolean)
}

export default function SnapshotCard({ report }: Props) {
  const whyNowItems    = parseBullets(report.whyNow.content)
  const thesisParas    = parseParagraphs(report.snapshotThesis.content)
  const riskParas      = parseParagraphs(report.snapshotRisks.content)

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.label}>Snapshot</span>
        <p className={styles.desc}>{report.businessDescription}</p>
      </div>

      <div className={styles.grid}>
        <div className={styles.col}>
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Investment Summary</h3>
            <p className={styles.summaryText}>{report.snapshotSummary.content}</p>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Investment Thesis</h3>
            {thesisParas.map((p, i) => (
              <p key={i} className={styles.thesisText}>{p}</p>
            ))}
          </section>
        </div>

        <div className={styles.col}>
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Why Now</h3>
            <ul className={styles.bullets}>
              {whyNowItems.map((item, i) => (
                <li key={i} className={styles.bulletItem}>{item}</li>
              ))}
            </ul>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Key Risks</h3>
            {riskParas.map((p, i) => (
              <p key={i} className={styles.riskText}>{p}</p>
            ))}
          </section>
        </div>
      </div>
    </div>
  )
}
