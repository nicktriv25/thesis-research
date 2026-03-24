import { NextResponse } from 'next/server'
import { getCount } from '@/lib/counter'

export const dynamic = 'force-dynamic'

export function GET() {
  return NextResponse.json({ count: getCount() })
}
