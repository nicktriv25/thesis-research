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
  upside: number
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
  content: string
}

export interface NewsItem {
  headline: string
  source: string
  date: string
  url: string
}

export interface TIEBriefReport {
  ticker: string
  exchange: string
  companyName: string
  sector: string
  generatedAt: string
  rating: Rating
  priceTarget: PriceTarget
  currentPrice: number
  metrics: KeyMetric[]
  investmentThesis: ReportSection
  topRisks: ReportSection
}

export interface TIEReport {
  // Identity
  ticker: string
  exchange: string
  companyName: string
  sector: string
  reportType: string
  generatedAt: string

  // Verdict
  rating: Rating
  priceTarget: PriceTarget
  currentPrice: number
  metrics: KeyMetric[]

  // Snapshot card (compact quick-read panel)
  businessDescription: string
  snapshotSummary: ReportSection
  snapshotThesis: ReportSection
  whyNow: ReportSection
  snapshotRisks: ReportSection

  // Full report sections (in display order)
  investmentSummary: ReportSection
  investmentThesis: ReportSection
  businessOverview: ReportSection
  industryPositioning: ReportSection
  financialAnalysis: ReportSection
  forwardOutlook: ReportSection
  valuationIntro: ReportSection
  catalysts: ReportSection
  keyRisks: ReportSection

  // Quantitative models
  dcf: DCFOutput
  scenarios: ScenarioCase[]
  comparables: Comparable[]

  // News
  news: NewsItem[]
}

export const EMPTY_REPORT: Partial<TIEReport> = {}
