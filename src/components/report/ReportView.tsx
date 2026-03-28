import type { TIEReport } from '@/lib/types'
import ReportHeader from './ReportHeader'
import MetricsBar from './MetricsBar'
import SnapshotCard from './SnapshotCard'
import NarrativeSection from './NarrativeSection'
import DCFSummary from './DCFSummary'
import Scenarios from './Scenarios'
import Comparables from './Comparables'
import NewsSection from './NewsSection'
import styles from './ReportView.module.css'

interface Props {
  report: TIEReport
}

export default function ReportView({ report }: Props) {
  return (
    <article id="report-content" className={styles.page}>
      <ReportHeader report={report} />
      <MetricsBar metrics={report.metrics} />
      <SnapshotCard report={report} />

      <div className={styles.content}>
        <NarrativeSection section={report.investmentSummary} />
        <NarrativeSection section={report.investmentThesis} />
        <NarrativeSection section={report.businessOverview} />
        <NarrativeSection section={report.industryPositioning} />
        <NarrativeSection section={report.financialAnalysis} />
        <NarrativeSection section={report.forwardOutlook} />

        <NarrativeSection section={report.valuationIntro} />
        <DCFSummary dcf={report.dcf} currentPrice={report.currentPrice} />
        <Scenarios scenarios={report.scenarios} currentPrice={report.currentPrice} />
        <Comparables comparables={report.comparables} focusTicker={report.ticker} />

        <NarrativeSection section={report.catalysts} />
        <NarrativeSection section={report.keyRisks} />
        <NewsSection news={report.news ?? []} />
      </div>

      <footer className={styles.footer}>
        <p className={styles.disclaimer}>
          This report is produced by Thesis for informational purposes only and does not constitute
          investment advice. Generated using TIE (Thesis Intelligence Engine), an AI-powered equity
          analysis system. All data should be independently verified before making investment decisions.
        </p>
        <p className={styles.brand}>Thesis — AI-Powered Equity Research</p>
      </footer>
    </article>
  )
}
