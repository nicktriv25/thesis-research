import styles from './ReportSkeleton.module.css'

export default function ReportSkeleton({ ticker }: { ticker: string }) {
  return (
    <div className={styles.wrap}>
      {/* Header skeleton */}
      <div className={styles.header}>
        <div className={styles.eyebrow}>
          <span className={`${styles.bone} ${styles.w120}`} />
          <span className={`${styles.bone} ${styles.w80}`} />
          <span className={`${styles.bone} ${styles.w100}`} />
        </div>
        <div className={styles.headerTop}>
          <div className={styles.identity}>
            <span className={`${styles.bone} ${styles.w80} ${styles.h12}`} />
            <span className={`${styles.bone} ${styles.w280} ${styles.h40} ${styles.mt8}`} />
            <span className={`${styles.bone} ${styles.w200} ${styles.h14} ${styles.mt8}`} />
          </div>
          <div className={`${styles.bone} ${styles.ratingBone}`} />
        </div>
      </div>

      {/* Metrics bar skeleton */}
      <div className={styles.metricsBar}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={styles.metricBone}>
            <span className={`${styles.bone} ${styles.w48} ${styles.h10}`} />
            <span className={`${styles.bone} ${styles.w64} ${styles.h18} ${styles.mt6}`} />
          </div>
        ))}
      </div>

      {/* Generating indicator */}
      <div className={styles.generating}>
        <div className={styles.genIcon}>
          <span className={styles.pulse} />
        </div>
        <div className={styles.genText}>
          <div className={styles.genTitle}>
            TIE is generating your report for {ticker}
          </div>
          <div className={styles.genSub}>
            Analyzing financials · Building DCF model · Identifying comparables
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className={styles.content}>
        {Array.from({ length: 3 }).map((_, si) => (
          <div key={si} className={styles.section}>
            <span className={`${styles.bone} ${styles.w160} ${styles.h22}`} />
            <div className={styles.lines}>
              {Array.from({ length: si === 1 ? 3 : 5 }).map((_, li) => (
                <span
                  key={li}
                  className={`${styles.bone} ${styles.h14}`}
                  style={{ width: li === (si === 1 ? 2 : 4) ? '72%' : '100%' }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
