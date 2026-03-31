import fs from 'fs'
import path from 'path'

const CACHE_DIR = '/tmp/thesis-cache'
const MAX_AGE_MS = 24 * 60 * 60 * 1000 // 24 hours

function ensureCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true })
  }
}

function cachePath(ticker: string, kind: 'brief' | 'full'): string {
  return path.join(CACHE_DIR, `${ticker}-${kind}.json`)
}

interface CacheEntry<T> {
  ticker: string
  timestamp: number
  report: T
}

export function readCache<T>(ticker: string, kind: 'brief' | 'full'): T | null {
  try {
    const file = cachePath(ticker, kind)
    if (!fs.existsSync(file)) return null
    const entry: CacheEntry<T> = JSON.parse(fs.readFileSync(file, 'utf-8'))
    if (Date.now() - entry.timestamp > MAX_AGE_MS) return null
    return entry.report
  } catch {
    return null
  }
}

export function writeCache<T>(ticker: string, kind: 'brief' | 'full', report: T): void {
  try {
    ensureCacheDir()
    const entry: CacheEntry<T> = { ticker, timestamp: Date.now(), report }
    fs.writeFileSync(cachePath(ticker, kind), JSON.stringify(entry), 'utf-8')
  } catch {
    // Cache write failure is non-fatal — log and continue
    console.warn(`[cache] Failed to write ${ticker}-${kind}`)
  }
}
