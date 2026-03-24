/**
 * TIE Engine — Thesis Intelligence Engine
 * Session 3: Uses Claude claude-sonnet-4-20250514 to generate a full investment thesis,
 * DCF valuation, bull/base/bear scenarios, and risk factors from live FMP data.
 */

import Anthropic from '@anthropic-ai/sdk'
import type { StockSnapshot } from './fmp'
import type { Rating, ScenarioCase, DCFOutput, Comparable } from './types'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export interface TIEAnalysis {
  rating: Rating
  priceTarget: { base: number; bull: number; bear: number }
  reportType: string
  investmentThesis: string
  businessOverview: string
  financialAnalysis: string
  riskFactors: string
  dcf: DCFOutput
  scenarios: ScenarioCase[]
  comparables: Comparable[]
}

const TOOL_NAME = 'generate_investment_report'

const TOOL_SCHEMA: Anthropic.Tool = {
  name: TOOL_NAME,
  description:
    'Generate a complete institutional-grade equity research report including investment thesis, DCF valuation, scenarios, and risk factors.',
  input_schema: {
    type: 'object' as const,
    required: [
      'rating',
      'priceTarget',
      'reportType',
      'investmentThesis',
      'businessOverview',
      'financialAnalysis',
      'riskFactors',
      'dcf',
      'scenarios',
      'comparables',
    ],
    properties: {
      rating: {
        type: 'string',
        enum: ['BUY', 'HOLD', 'SELL'],
        description: 'Analyst rating: BUY (meaningful upside), HOLD (fairly valued), SELL (downside risk).',
      },
      priceTarget: {
        type: 'object',
        required: ['base', 'bull', 'bear'],
        properties: {
          base: { type: 'number', description: '12-month base case price target.' },
          bull: { type: 'number', description: '12-month bull case price target.' },
          bear: { type: 'number', description: '12-month bear case price target.' },
        },
      },
      reportType: {
        type: 'string',
        description: 'Report classification e.g. "Initiation of Coverage", "Update", "Deep Dive".',
      },
      investmentThesis: {
        type: 'string',
        description:
          '3–5 paragraph institutional-quality investment thesis. Cover the key catalyst, competitive moat, valuation setup, and why now. Write in the voice of a senior sell-side analyst.',
      },
      businessOverview: {
        type: 'string',
        description:
          '2–3 paragraph business overview covering revenue model, segment breakdown, go-to-market, and key operational drivers.',
      },
      financialAnalysis: {
        type: 'string',
        description:
          '2–4 paragraph financial analysis covering revenue trajectory, margin profile, cash flow quality, and balance sheet. Reference specific numbers from the provided metrics.',
      },
      riskFactors: {
        type: 'string',
        description:
          '3–5 paragraph risk factors section covering competitive, regulatory, macro, and company-specific risks. Be specific and quantify where possible.',
      },
      dcf: {
        type: 'object',
        required: ['intrinsicValue', 'impliedUpside', 'inputs', 'yearlyProjections'],
        properties: {
          intrinsicValue: { type: 'number', description: 'DCF-derived intrinsic value per share.' },
          impliedUpside: { type: 'number', description: 'Percent upside/downside vs current price.' },
          inputs: {
            type: 'object',
            required: ['wacc', 'terminalGrowthRate', 'projectionYears', 'revenueCAGR'],
            properties: {
              wacc: { type: 'number', description: 'Weighted average cost of capital as a percentage (e.g. 9.5 for 9.5%).' },
              terminalGrowthRate: { type: 'number', description: 'Terminal growth rate as a percentage (e.g. 3.0 for 3%).' },
              projectionYears: { type: 'number', description: 'Number of explicit projection years (typically 5).' },
              revenueCAGR: { type: 'number', description: 'Projected revenue CAGR as a percentage over the projection period.' },
            },
          },
          yearlyProjections: {
            type: 'array',
            description: '5 years of DCF projections.',
            items: {
              type: 'object',
              required: ['year', 'revenue', 'fcf', 'discountedFCF'],
              properties: {
                year: { type: 'number' },
                revenue: { type: 'number', description: 'Revenue in billions USD.' },
                fcf: { type: 'number', description: 'Free cash flow in billions USD.' },
                discountedFCF: { type: 'number', description: 'Discounted FCF in billions USD.' },
              },
            },
          },
        },
      },
      scenarios: {
        type: 'array',
        description: 'Exactly 3 scenarios: Bull, Base, Bear in that order.',
        items: {
          type: 'object',
          required: ['label', 'target', 'upside', 'description', 'keyAssumptions'],
          properties: {
            label: { type: 'string', enum: ['Bull Case', 'Base Case', 'Bear Case'] },
            target: { type: 'number', description: '12-month price target for this scenario.' },
            upside: { type: 'number', description: 'Percent upside vs current price (negative for downside).' },
            description: { type: 'string', description: 'One-sentence scenario summary.' },
            keyAssumptions: {
              type: 'array',
              description: '3 specific quantified assumptions driving this scenario.',
              items: { type: 'string' },
            },
          },
        },
      },
      comparables: {
        type: 'array',
        description:
          'The subject company plus 4–6 peer comparables. Subject company first, use actual live data provided for it.',
        items: {
          type: 'object',
          required: ['ticker', 'name', 'price', 'marketCap', 'peForward', 'evRevenue', 'revenueGrowth', 'grossMargin'],
          properties: {
            ticker: { type: 'string' },
            name: { type: 'string' },
            price: { type: 'string', description: 'Formatted price string e.g. "$145.32".' },
            marketCap: { type: 'string', description: 'Formatted market cap e.g. "$2.4T" or "$180B".' },
            peForward: { type: 'string', description: 'Forward P/E multiple e.g. "24.5x" or "N/A".' },
            evRevenue: { type: 'string', description: 'EV/Revenue multiple e.g. "8.2x" or "N/A".' },
            revenueGrowth: { type: 'string', description: 'Revenue growth e.g. "+18%" or "-3%".' },
            grossMargin: { type: 'string', description: 'Gross margin e.g. "62.4%".' },
            rating: { type: 'string', enum: ['BUY', 'OUTPERFORM', 'HOLD', 'UNDERPERFORM', 'SELL'] },
          },
        },
      },
    },
  },
}

function buildSystemPrompt(): string {
  return `You are the TIE Engine (Thesis Intelligence Engine), an institutional-grade AI equity research analyst.
You write with the precision and authority of a senior sell-side analyst at a top-tier investment bank.
Your analysis is data-driven, specific, and actionable. You avoid vague platitudes and instead provide
concrete numbers, specific catalysts, and well-reasoned valuation frameworks.
Always use the real financial data provided to you. For comparables, use your training knowledge to
populate realistic peer company data — be accurate to the best of your knowledge about market caps,
multiples, and growth rates for well-known companies in the sector.`
}

function buildUserPrompt(snap: StockSnapshot): string {
  const fmt = (v: number | null, multiplier = 1, suffix = '') =>
    v !== null ? `${(v * multiplier).toFixed(1)}${suffix}` : 'N/A'

  return `Generate a complete institutional equity research report for ${snap.name} (${snap.ticker}).

## Live Market Data (as of now)
- **Ticker:** ${snap.ticker} | **Exchange:** ${snap.exchange}
- **Company:** ${snap.name}
- **Sector:** ${snap.sector} | **Industry:** ${snap.industry}
- **Current Price:** $${snap.price.toFixed(2)} ${snap.currency}
- **Market Cap:** $${(snap.marketCap / 1e9).toFixed(1)}B
- **Daily Change:** ${snap.changePct >= 0 ? '+' : ''}${snap.changePct.toFixed(2)}%

## Key Financial Metrics (TTM / Most Recent)
- **P/E Ratio (TTM):** ${snap.pe !== null ? `${snap.pe.toFixed(1)}x` : 'N/A'}
- **EV / Revenue:** ${snap.evToRevenue !== null ? `${snap.evToRevenue.toFixed(1)}x` : 'N/A'}
- **Revenue Growth (YoY):** ${fmt(snap.revenueGrowth, 100, '%')}
- **Gross Margin:** ${fmt(snap.grossMargin, 100, '%')}

## Company Description
${snap.description || `${snap.name} operates in the ${snap.sector} sector (${snap.industry}).`}

## Instructions
1. Analyze this company using the data above combined with your knowledge of the company, sector, and competitive landscape.
2. Generate a full investment report using the generate_investment_report tool.
3. For the DCF, model 5 years of explicit projections in billions USD. Base your revenue CAGR on the company's historical growth rate and sector dynamics.
4. For comparables, include the subject company first (use the live data above), then add 4–6 relevant sector peers from your training knowledge.
5. Price targets should be specific and grounded in your DCF + scenario analysis.
6. Write at least 3 substantive paragraphs for each narrative section.`
}

export async function generateTIEAnalysis(snap: StockSnapshot): Promise<TIEAnalysis> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    system: buildSystemPrompt(),
    tools: [TOOL_SCHEMA],
    tool_choice: { type: 'tool', name: TOOL_NAME },
    messages: [
      {
        role: 'user',
        content: buildUserPrompt(snap),
      },
    ],
  })

  const toolBlock = response.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
  )

  if (!toolBlock) {
    throw new Error('TIE Engine: Claude did not return a tool_use block')
  }

  const raw = toolBlock.input as TIEAnalysis
  return raw
}
