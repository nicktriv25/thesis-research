import type { NewsItem } from '@/lib/types'
import styles from './NewsSection.module.css'

interface Props {
  news: NewsItem[]
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function NewsSection({ news }: Props) {
  if (!news || news.length === 0) return null

  return (
    <div className={styles.wrap}>
      <h2 className={styles.title}>Recent News</h2>
      <ul className={styles.list}>
        {news.map((item, i) => (
          <li key={i} className={styles.item}>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.headline}
            >
              {item.headline}
            </a>
            <div className={styles.meta}>
              <span className={styles.source}>{item.source}</span>
              <span className={styles.dot}>·</span>
              <span className={styles.date}>{formatDate(item.date)}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
