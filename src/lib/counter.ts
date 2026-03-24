/**
 * Simple report counter — persists to data/counter.json in local dev,
 * falls back to in-memory for read-only environments (Vercel).
 */

import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const FILE = join(process.cwd(), 'data', 'counter.json')

// In-memory cache — seeded from file on first read
let cached: number | null = null

function readFromFile(): number {
  try {
    const data = JSON.parse(readFileSync(FILE, 'utf8'))
    return typeof data.count === 'number' ? data.count : 592
  } catch {
    return 592
  }
}

export function getCount(): number {
  if (cached === null) cached = readFromFile()
  return cached
}

export function incrementCount(): number {
  const next = getCount() + 1
  cached = next
  try {
    writeFileSync(FILE, JSON.stringify({ count: next }))
  } catch {
    // Silently ignore in read-only environments (e.g. Vercel production)
  }
  return next
}
