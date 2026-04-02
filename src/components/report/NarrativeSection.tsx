import type { ReportSection } from '@/lib/types'
import styles from './NarrativeSection.module.css'

interface Props {
  section: ReportSection
  variant?: 'default' | 'summary' | 'risks'
}

export default function NarrativeSection({ section, variant = 'default' }: Props) {
  // Normalize literal \n escape sequences the AI sometimes outputs, then split on double newlines
  const normalized = section.content.replace(/\\n/g, '\n')
  const paragraphs = normalized.split('\n\n').filter(Boolean)

  const wrapClass =
    variant === 'summary' ? styles.summaryWrap :
    variant === 'risks'   ? styles.risksWrap   :
    styles.wrap

  const titleClass =
    variant === 'summary' ? styles.summaryTitle : styles.title

  return (
    <div className={wrapClass}>
      <h2 className={titleClass}>{section.title}</h2>
      {paragraphs.map((p, i) => (
        <p key={i} className={styles.body}>{p}</p>
      ))}
    </div>
  )
}
