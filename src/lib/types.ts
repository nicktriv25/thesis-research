export type Rating = 'BUY' | 'HOLD' | 'SELL'

export interface PriceTarget {
  base: number
  bull: number
  bear: number
  currency: string
}

export interface KeyMetric {
  label: string
  value: string
  sub?: string
}

export interface ScenarioCase {
  label: string
  target: number
  upside: number  // percent vs current
  description: string
  keyAssumptions: string[]
}

export interface Comparable {
  ticker: string
  name: string
  price: string
  marketCap: string
  peForward: string
  evRevenue: string
  revenueGrowth: string
  grossMargin: string
  rating?: Rating
}

export interface DCFInputs {
  wacc: number
  terminalGrowthRate: number
  projectionYears: number
  revenueCAGR: number
}

export interface DCFOutput {
  intrinsicValue: number
  impliedUpside: number
  inputs: DCFInputs
  yearlyProjections: Array<{
    year: number
    revenue: number
    fcf: number
    discountedFCF: number
  }>
}

export interface ReportSection {
  title: string
  content: string  // markdown-compatible prose
}

export interface TIEReport {
  // Identity
  ticker: string
  exchange: string
  companyName: string
  sector: string
  reportType: string   // "Initiation of Coverage" | "Update" | "Deep Dive"
  generatedAt: string  // ISO date

  // Verdict
  rating: Rating
  priceTarget: PriceTarget
  currentPrice: number

  // Key metrics (header bar)
  metrics: KeyMetric[]

  // Main narrative sections
  investmentThesis: ReportSection
  businessOverview: ReportSection
  financialAnalysis: ReportSection
  riskFactors: ReportSection

  // Quantitative
  dcf: DCFOutput
  scenarios: ScenarioCase[]
  comparables: Comparable[]
}

// Placeholder / loading state
export const EMPTY_REPORT: Partial<TIEReport> = {}
