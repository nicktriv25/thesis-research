import type { ReportSection } from '@/lib/types'
import styles from './NarrativeSection.module.css'

interface Props {
  section: ReportSection
}

export default function NarrativeSection({ section }: Props) {
  // Normalize literal \n escape sequences the AI sometimes outputs, then split on double newlines
  const normalized = section.content.replace(/\\n/g, '\n')
  const paragraphs = normalized.split('\n\n').filter(Boolean)

  return (
    <div className={styles.wrap}>
      <h2 className={styles.title}>{section.title}</h2>
      {paragraphs.map((p, i) => (
        <p key={i} className={styles.body}>{p}</p>
      ))}
    </div>
  )
}
