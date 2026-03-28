/**
 * TIE Engine — Thesis Intelligence Engine
 * Generates institutional equity research reports.
 * Phase 1: Web search for recent earnings, analyst coverage, and events.
 * Phase 2: Structured full report using gathered research context.
 * Also exports generateTIEBrief for the fast brief tier.
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
  // Snapshot
  businessDescription: string
  snapshotSummary: string
  snapshotThesis: string
  whyNow: string
  snapshotRisks: string
  // Full report sections
  investmentSummary: string
  investmentThesis: string
  businessOverview: string
  industryPositioning: string
  financialAnalysis: string
  forwardOutlook: string
  valuationIntro: string
  catalysts: string
  keyRisks: string
  // Quantitative
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
  description: 'Generate a complete institutional equity research report with snapshot card and full analysis sections.',
  input_schema: {
    type: 'object' as const,
    required: [
      'rating', 'priceTarget', 'reportType',
      'businessDescription', 'snapshotSummary', 'snapshotThesis', 'whyNow', 'snapshotRisks',
      'investmentSummary', 'investmentThesis', 'businessOverview', 'industryPositioning',
      'financialAnalysis', 'forwardOutlook', 'valuationIntro', 'catalysts', 'keyRisks',
      'dcf', 'scenarios', 'comparables',
    ],
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
      reportType: {
        type: 'string',
        description: '"Initiation of Coverage", "Update", or "Deep Dive".',
      },

      // ── Snapshot card ──────────────────────────────────────────────────────
      businessDescription: {
        type: 'string',
        description: 'One sentence: what the company does + its key competitive position. No fluff.',
      },
      snapshotSummary: {
        type: 'string',
        description: '4-5 sentences. S1: rating, price target, upside %. S2: one-line company identifier. S3-4: two core reasons for the rating (growth/moat/FCF/margin). S5: one valuation insight (cheap vs peers, premium but justified, etc). End with one key risk caveat.',
      },
      snapshotThesis: {
        type: 'string',
        description: 'Exactly 2 paragraphs separated by \\n\\n. Para 1: primary growth or structural driver with specific metrics. Para 2: financial strength, margins, or capital return story. One clear idea per paragraph. No blending.',
      },
      whyNow: {
        type: 'string',
        description: '2-3 bullet points, each on a new line starting with •. Each answers "why buy today" — timing catalyst: earnings momentum, valuation dislocation, macro setup, upcoming event. Be specific.',
      },
      snapshotRisks: {
        type: 'string',
        description: 'Exactly 3 risks separated by \\n\\n. Each 1-2 sentences. Each must tie directly to a thesis pillar — state the risk then state how it undermines the specific thesis point.',
      },

      // ── Full report sections ───────────────────────────────────────────────
      investmentSummary: {
        type: 'string',
        description: '1 paragraph, 5-6 sentences. Open with rating, price target, upside %. Include 2-3 core reasons. 1 valuation justification (cite multiple vs peers). End with 1 key risk caveat. Write for a PM reading in 30 seconds. No filler.',
      },
      investmentThesis: {
        type: 'string',
        description: '2-3 paragraphs separated by \\n\\n. Each paragraph = one clear pillar with a label concept: growth driver, competitive moat, OR margin/FCF story. No blending of ideas within a paragraph. Each pillar cites specific metrics.',
      },
      businessOverview: {
        type: 'string',
        description: '1-2 paragraphs separated by \\n\\n. What the company does, key revenue segments with percentages, business model. Concise.',
      },
      industryPositioning: {
        type: 'string',
        description: '1 paragraph. Industry growth rate/TAM, key named competitors, where this company sits (market leader/challenger/niche). Specific market share % if available.',
      },
      financialAnalysis: {
        type: 'string',
        description: '2-3 paragraphs separated by \\n\\n. Trend-focused, tied to thesis pillars. Para 1: revenue trajectory with YoY growth rates. Para 2: margin trends (gross/operating/net) and FCF quality. Para 3: balance sheet and capital allocation. Cite actual figures.',
      },
      forwardOutlook: {
        type: 'string',
        description: '1 paragraph. Expected growth trajectory, margin direction, key forward assumptions. Bridge from historical performance to valuation entry point.',
      },
      valuationIntro: {
        type: 'string',
        description: '1 short paragraph. Explain what primarily drives the valuation before the DCF output — methodology, key multiple, and how it compares to peers or historical range.',
      },
      catalysts: {
        type: 'string',
        description: '3-5 specific upcoming catalysts, each on a new line starting with •. Format: "• [Catalyst Name] — [expected impact direction]". Forward-looking events only, not news recaps.',
      },
      keyRisks: {
        type: 'string',
        description: '4-5 risks separated by \\n\\n. Each risk tied directly to a thesis pillar. State the risk name, then 1-2 sentences on how it specifically threatens the corresponding thesis point. Not generic.',
      },

      // ── Quantitative models ────────────────────────────────────────────────
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
              wacc: { type: 'number', description: 'WACC as a percentage.' },
              terminalGrowthRate: { type: 'number', description: 'Terminal growth rate as a percentage.' },
              projectionYears: { type: 'number', description: 'Number of projection years (5).' },
              revenueCAGR: { type: 'number', description: 'Revenue CAGR over the projection period.' },
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
                fcf: { type: 'number', description: 'FCF in billions USD.' },
                discountedFCF: { type: 'number', description: 'Discounted FCF in billions USD.' },
              },
            },
          },
        },
      },
      scenarios: {
        type: 'array',
        description: 'Exactly 3 scenarios: Bull, Base, Bear.',
        items: {
          type: 'object',
          required: ['label', 'target', 'upside', 'description', 'keyAssumptions'],
          properties: {
            label: { type: 'string', enum: ['Bull Case', 'Base Case', 'Bear Case'] },
            target: { type: 'number' },
            upside: { type: 'number' },
            description: { type: 'string', description: 'One-sentence scenario summary.' },
            keyAssumptions: {
              type: 'array',
              description: '3 specific quantified assumptions.',
              items: { type: 'string' },
            },
          },
        },
      },
      comparables: {
        type: 'array',
        description: 'Subject company first (use live data), then 4-5 sector peers.',
        items: {
          type: 'object',
          required: ['ticker', 'name', 'price', 'marketCap', 'peForward', 'evRevenue', 'revenueGrowth', 'grossMargin'],
          properties: {
            ticker: { type: 'string' },
            name: { type: 'string' },
            price: { type: 'string' },
            marketCap: { type: 'string' },
            peForward: { type: 'string' },
            evRevenue: { type: 'string' },
            revenueGrowth: { type: 'string' },
            grossMargin: { type: 'string' },
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

  const cappedContext = researchContext.length > 1500
    ? researchContext.slice(0, 1500) + '…'
    : researchContext
  const contextSection = cappedContext
    ? `\n## Recent Research (web search)\n${cappedContext}\n`
    : ''

  const description = (snap.description || `${snap.name} operates in the ${snap.sector} sector (${snap.industry}).`).slice(0, 400)

  return `Generate a complete institutional equity research report for ${snap.name} (${snap.ticker}).
${contextSection}
## Market Data
- Price: $${snap.price.toFixed(2)} ${snap.currency} (${snap.changePct >= 0 ? '+' : ''}${snap.changePct.toFixed(2)}% today)
- Market Cap: $${(snap.marketCap / 1e9).toFixed(1)}B | Exchange: ${snap.exchange}
- Sector: ${snap.sector} | Industry: ${snap.industry}
- P/E (TTM): ${snap.pe !== null ? `${snap.pe.toFixed(1)}x` : 'N/A'} | EV/Rev: ${snap.evToRevenue !== null ? `${snap.evToRevenue.toFixed(1)}x` : 'N/A'}
- Rev Growth: ${fmt(snap.revenueGrowth, 100, '%')} | Gross Margin: ${fmt(snap.grossMargin, 100, '%')}
- ${description}

## Instructions
Call generate_investment_report. Fill every field precisely:

SNAPSHOT (compact quick-read panel):
- businessDescription: 1 sentence, no fluff
- snapshotSummary: 4-5 sentences — rating/PT/upside, company ID, 2 core reasons, 1 valuation insight, 1 risk caveat
- snapshotThesis: 2 paragraphs (\\n\\n) — Para 1: growth driver, Para 2: financial/capital return story
- whyNow: 2-3 bullet points (•) on separate lines — specific timing catalysts
- snapshotRisks: 3 risks (\\n\\n) — each tied to a specific thesis pillar

FULL REPORT (9 sections in order):
1. investmentSummary: 1 paragraph, 5-6 sentences, PM-readable in 30 seconds
2. investmentThesis: 2-3 paragraphs, each = one clear pillar (growth/moat/margin)
3. businessOverview: 1-2 paragraphs, segments with percentages
4. industryPositioning: 1 paragraph, TAM/competitors/market position
5. financialAnalysis: 2-3 paragraphs, trend-focused, cite actual figures
6. forwardOutlook: 1 paragraph, trajectory + margin direction + bridge to valuation
7. valuationIntro: 1 short paragraph, methodology + key multiple vs peers
8. catalysts: 3-5 bullets (•) — "• [Event] — [impact direction]"
9. keyRisks: 4-5 paragraphs (\\n\\n), each tied to specific thesis pillar

QUANT: DCF (5-year projections in $B), 3 scenarios, 5-6 comparables (subject first)`
}

/**
 * Phase 1: Web search for recent earnings, analyst targets, and news.
 * Gracefully degrades to empty string if unavailable.
 */
async function gatherResearchContext(snap: StockSnapshot): Promise<string> {
  try {
    const messages: Anthropic.MessageParam[] = [
      { role: 'user', content: buildSearchPrompt(snap) },
    ]

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

      messages.push({ role: 'assistant', content: response.content })

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
