/**
 * TIE Engine — Thesis Intelligence Engine
 * Uses Claude claude-sonnet-4-20250514 to generate a full investment thesis,
 * DCF valuation, bull/base/bear scenarios, and risk factors from live Polygon data.
 * Phase 1: Web search for recent earnings, analyst coverage, and events.
 * Phase 2: Structured report generation using gathered research context.
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

// Built-in Anthropic web search tool — executed server-side
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const WEB_SEARCH_TOOL: any = {
  type: 'web_search_20250305',
  name: 'web_search',
}

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
          'Exactly 3 paragraphs separated by \\n\\n. Para 1: core thesis with specific recent catalyst — cite actual Q numbers (revenue, EPS, beat/miss vs consensus). Para 2: competitive moat with hard evidence — cite market share %, segment margins, or specific product metrics. Para 3: valuation entry point — cite current multiple vs peers, and why this is the right time to own it. Be precise. No filler.',
      },
      businessOverview: {
        type: 'string',
        description:
          'Exactly 3 paragraphs separated by \\n\\n. Para 1: core business model and revenue segments with percentages from most recent annual report. Para 2: go-to-market strategy, key operational drivers, and recent management commentary from earnings calls. Para 3: competitive positioning — name specific competitors, cite market share data or relative growth rates. Be specific.',
      },
      financialAnalysis: {
        type: 'string',
        description:
          'Exactly 3 paragraphs separated by \\n\\n. Para 1: most recent quarter revenue and EPS with year-over-year comparisons — cite actual numbers ($B, %). Para 2: margin trajectory with specific gross/operating/net margin figures; cite FCF and FCF margin. Para 3: balance sheet health — cite cash, debt, buyback program size, and dividend if applicable. Reference figures from the most recent earnings. No generic filler.',
      },
      riskFactors: {
        type: 'string',
        description:
          'Exactly 3 paragraphs separated by \\n\\n. Para 1: competitive and market-share risks — name specific competitors and their recent moves. Para 2: regulatory, macro, and valuation risks — cite specific regulatory proceedings, interest rate sensitivity, or multiple compression risk. Para 3: company-specific execution risks — cite management guidance, supply chain issues, or product cycle risks with specific timelines. Quantify each risk where possible.',
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
Your analysis is data-driven, specific, and actionable. You cite real numbers — earnings beats/misses, exact revenue figures,
specific analyst price targets by name (e.g., "Goldman Sachs raised to $220"), actual margin percentages, and named catalysts.
You NEVER write vague platitudes like "strong growth trajectory" without backing them with specific figures.
Always anchor your narrative in the most recent quarterly earnings, management guidance, and analyst consensus.`
}

function buildResearchSystemPrompt(): string {
  return `You are a financial research analyst. Search for recent data and return a concise bullet-point brief — max 250 words. Cover: latest quarterly earnings (revenue, EPS, beat/miss), 2-3 analyst price target changes with firm names, one key recent catalyst. Numbers and dates only. No preamble or padding.`
}

function buildSearchPrompt(snap: StockSnapshot): string {
  return `${snap.name} (${snap.ticker}), $${snap.price.toFixed(2)}, mkt cap $${(snap.marketCap / 1e9).toFixed(1)}B. Find: (1) most recent quarterly earnings — revenue, EPS, beat/miss vs consensus; (2) 2-3 recent analyst target changes with firm names; (3) one major recent catalyst. Bullet points only, max 200 words.`
}

function buildUserPrompt(snap: StockSnapshot, researchContext: string): string {
  const fmt = (v: number | null, multiplier = 1, suffix = '') =>
    v !== null ? `${(v * multiplier).toFixed(1)}${suffix}` : 'N/A'

  // Cap research context at 1,500 chars (~375 tokens) to keep total input under 20k tokens
  const cappedContext = researchContext.length > 1500
    ? researchContext.slice(0, 1500) + '…'
    : researchContext
  const contextSection = cappedContext
    ? `\n## Recent Research (web search)\n${cappedContext}\n`
    : ''

  // Truncate description to 400 chars to avoid bloating the prompt
  const description = (snap.description || `${snap.name} operates in the ${snap.sector} sector (${snap.industry}).`).slice(0, 400)

  return `Generate an institutional equity research report for ${snap.name} (${snap.ticker}).
${contextSection}
## Market Data
- Price: $${snap.price.toFixed(2)} ${snap.currency} (${snap.changePct >= 0 ? '+' : ''}${snap.changePct.toFixed(2)}% today)
- Market Cap: $${(snap.marketCap / 1e9).toFixed(1)}B | Exchange: ${snap.exchange}
- Sector: ${snap.sector} | Industry: ${snap.industry}
- P/E (TTM): ${snap.pe !== null ? `${snap.pe.toFixed(1)}x` : 'N/A'} | EV/Rev: ${snap.evToRevenue !== null ? `${snap.evToRevenue.toFixed(1)}x` : 'N/A'}
- Rev Growth: ${fmt(snap.revenueGrowth, 100, '%')} | Gross Margin: ${fmt(snap.grossMargin, 100, '%')}
- ${description}

## Instructions
Use the live data and web research above. Call generate_investment_report with:
- Specific numbers in every paragraph (cite quarters, dollar amounts, analyst firm names)
- DCF: 5-year projections in billions USD based on actual recent growth rate
- Comparables: subject company first (use live data), then 4–5 sector peers
- Exactly 3 paragraphs per narrative section, separated by \\n\\n`
}

/**
 * Phase 1: Use web search to gather recent earnings, analyst targets, and news.
 * Gracefully degrades to empty string if web search is unavailable.
 */
async function gatherResearchContext(snap: StockSnapshot): Promise<string> {
  try {
    const messages: Anthropic.MessageParam[] = [
      { role: 'user', content: buildSearchPrompt(snap) },
    ]

    // Max 2 rounds to cap token usage; 1024 tokens is plenty for a bullet-point brief
    for (let round = 0; round < 2; round++) {
      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: buildResearchSystemPrompt(),
        tools: [WEB_SEARCH_TOOL],
        messages,
      })

      const textParts = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === 'text')
        .map(b => b.text)

      if (response.stop_reason === 'end_turn' || response.stop_reason === 'max_tokens') {
        return textParts.join('\n\n')
      }

      // Continue multi-turn: add assistant response, then continue conversation
      messages.push({ role: 'assistant', content: response.content })

      // Provide empty tool results for any tool_use blocks so the conversation can continue
      const toolUseBlocks = response.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use'
      )
      if (toolUseBlocks.length === 0) {
        return textParts.join('\n\n')
      }

      messages.push({
        role: 'user',
        content: toolUseBlocks.map(b => ({
          type: 'tool_result' as const,
          tool_use_id: b.id,
          content: '(search executed server-side)',
        })),
      })
    }

    return ''
  } catch {
    // Web search unavailable — report generation continues with financial data only
    return ''
  }
}

// ─── Brief generation (fast, no web search) ──────────────────────────────────

const BRIEF_TOOL_NAME = 'generate_research_brief'

const BRIEF_TOOL_SCHEMA: Anthropic.Tool = {
  name: BRIEF_TOOL_NAME,
  description: 'Generate a fast research brief with rating, price target, investment thesis, and top risks.',
  input_schema: {
    type: 'object' as const,
    required: ['rating', 'priceTarget', 'investmentThesis', 'topRisks'],
    properties: {
      rating: {
        type: 'string',
        enum: ['BUY', 'HOLD', 'SELL'],
        description: 'Analyst rating.',
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
      investmentThesis: {
        type: 'string',
        description: 'Exactly 2 paragraphs separated by \\n\\n. Para 1: core thesis with specific catalyst, citing actual metrics (revenue, margins, growth rates). Para 2: valuation setup and why now — cite current multiple vs peers.',
      },
      topRisks: {
        type: 'string',
        description: 'Exactly 2 paragraphs separated by \\n\\n. Para 1: key competitive and macro risks, quantified. Para 2: company-specific execution risks with specific timelines or figures.',
      },
    },
  },
}

export interface TIEBriefAnalysis {
  rating: Rating
  priceTarget: { base: number; bull: number; bear: number }
  investmentThesis: string
  topRisks: string
}

function buildBriefPrompt(snap: StockSnapshot): string {
  const fmt = (v: number | null, multiplier = 1, suffix = '') =>
    v !== null ? `${(v * multiplier).toFixed(1)}${suffix}` : 'N/A'

  const description = (snap.description || `${snap.name} operates in the ${snap.sector} sector.`).slice(0, 300)

  return `Write a research brief for ${snap.name} (${snap.ticker}).

## Market Data
- Price: $${snap.price.toFixed(2)} ${snap.currency} | Mkt Cap: $${(snap.marketCap / 1e9).toFixed(1)}B
- Sector: ${snap.sector} | Industry: ${snap.industry}
- P/E (TTM): ${snap.pe !== null ? `${snap.pe.toFixed(1)}x` : 'N/A'} | EV/Rev: ${snap.evToRevenue !== null ? `${snap.evToRevenue.toFixed(1)}x` : 'N/A'}
- Rev Growth: ${fmt(snap.revenueGrowth, 100, '%')} | Gross Margin: ${fmt(snap.grossMargin, 100, '%')}
- ${description}

Call generate_research_brief. Each narrative field: exactly 2 paragraphs separated by \\n\\n. Cite specific numbers.`
}

export async function generateTIEBrief(snap: StockSnapshot): Promise<TIEBriefAnalysis> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    system: buildSystemPrompt(),
    tools: [BRIEF_TOOL_SCHEMA],
    tool_choice: { type: 'tool', name: BRIEF_TOOL_NAME },
    messages: [{ role: 'user', content: buildBriefPrompt(snap) }],
  })

  const toolBlock = response.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
  )
  if (!toolBlock) throw new Error('TIE Engine: No brief tool_use block returned')

  return toolBlock.input as TIEBriefAnalysis
}

export async function generateTIEAnalysis(snap: StockSnapshot): Promise<TIEAnalysis> {
  // Phase 1: Gather recent research context via web search
  const researchContext = await gatherResearchContext(snap)

  // Phase 2: Generate structured report using live data + research context
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    system: buildSystemPrompt(),
    tools: [TOOL_SCHEMA],
    tool_choice: { type: 'tool', name: TOOL_NAME },
    messages: [
      {
        role: 'user',
        content: buildUserPrompt(snap, researchContext),
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
