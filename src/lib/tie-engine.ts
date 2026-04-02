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
        description: '3-5 specific upcoming catalysts, each on a new line starting with •. Format: "• [Catalyst Name] — [expected impact direction]". Forward-looking events only, not news recaps. ONLY include catalysts that directly name or involve this specific company — no generic sector/macro commentary. Prefer: earnings dates, product/drug launches, regulatory decisions, analyst rating changes citing this company, executive changes, M&A involving this company directly.',
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
        description: 'Subject company first (rowType: "subject", name wrapped in **), then 4-5 sector peers (rowType: "peer"), then one final Peer Median row (rowType: "peerMedian") with ticker "—" and median values for each numeric column calculated across peers only.',
        items: {
          type: 'object',
          required: ['ticker', 'name', 'price', 'marketCap', 'peForward', 'evRevenue', 'revenueGrowth', 'grossMargin'],
          properties: {
            ticker: { type: 'string' },
            name: { type: 'string', description: 'For subject company wrap in ** e.g. "**Apple Inc.**". For peerMedian row use "Peer Median".' },
            price: { type: 'string' },
            marketCap: { type: 'string' },
            peForward: { type: 'string' },
            evRevenue: { type: 'string' },
            revenueGrowth: { type: 'string', description: 'If inorganic growth (>40% YoY from M&A), append asterisk: "+85%*".' },
            grossMargin: { type: 'string' },
            rating: {
              type: 'string',
              enum: ['BUY', 'OUTPERFORM', 'HOLD', 'UNDERPERFORM', 'SELL', 'N/A'],
              description: 'Omit or use "N/A" for the peerMedian row.',
            },
            rowType: {
              type: 'string',
              enum: ['subject', 'peer', 'peerMedian'],
              description: '"subject" for the analyzed company (first row), "peer" for comparables, "peerMedian" for the final median summary row.',
            },
          },
        },
      },
    },
  },
}

function buildSystemPrompt(): string {
  return `You are the TIE Engine (Thesis Intelligence Engine), an institutional-grade AI equity research analyst. Write with the precision of a senior sell-side analyst at a top-tier investment bank. Analysis is data-driven and specific — cite real numbers, exact revenue figures, analyst price targets by firm name, actual margin percentages, and named catalysts. Never write vague platitudes without backing them with specific figures. Anchor narrative in the most recent quarterly earnings, management guidance, and analyst consensus.

OPERATING RULES — FOLLOW EXACTLY

RULE 1 — N/A METRIC HANDLING
When a financial metric is null or unavailable, substitute the most relevant industry-specific alternative: FFO/NAV for REITs; NIM/ROE for banks and insurance; NRR/ARR for SaaS; FRE/Distributable Earnings for asset managers; GMV/take rate for marketplaces; burn rate/cash runway for pre-revenue biotech; EBITDA margin for infrastructure/utilities. If no substitute exists, display "— N/M" with a brief parenthetical. Never show more than one raw N/A in the metrics bar.

RULE 2 — INORGANIC GROWTH DETECTION
When revenue growth exceeds 40% YoY, investigate whether acquisition-driven. If so: note in Financial Analysis with the acquisition name, close date, and estimated organic growth rate. Flag in comparables revenueGrowth with an asterisk (e.g., "+85%*"). Source the organic/inorganic split from management guidance or earnings transcripts; if undisclosed, note it explicitly.

RULE 3 — CATALYSTS: COMPANY-SPECIFIC ONLY
Include only events directly involving this company: earnings dates, product/drug/service launches, regulatory decisions (FDA/FCC/DOJ/CFIUS), leadership changes (CEO/CFO/board), analyst upgrades or downgrades naming this company, M&A as buyer or target, major contract wins, capital markets events (buybacks, offerings). Exclude generic sector commentary, macro trends, or competitor news unless it directly and materially impacts this company — name the specific mechanism.

RULE 4 — COMPARABLES TABLE ORDER
Mandatory order: (1) subject company first — rowType:"subject", name in **bold**; (2) 4-5 peer companies — rowType:"peer"; (3) one Peer Median row — rowType:"peerMedian", ticker:"—", name:"Peer Median", price:"—", marketCap:"—", with medians calculated across peers only, excluding the subject company. Do not include a rating for the peerMedian row.

RULE 5 — CALLOUT BOXES
In investmentThesis and businessOverview, after every 2-3 paragraphs insert:
[CALLOUT: MetricName: Value | MetricName: Value | MetricName: Value]
Use 2-3 data points from SEC filings or management commentary only. Callouts must reinforce the preceding paragraph's narrative.

RULE 6 — SOURCE STANDARDS
Tier 1 (primary): SEC filings (10-K/10-Q/8-K), earnings transcripts, press releases, investor day presentations.
Tier 2 (secondary): Reuters, Bloomberg, FT, WSJ, Barron's.
Tier 3 (supplemental): sell-side consensus, analyst price target history, industry research.
Forbidden: blogs, social media, unverified aggregators, Wikipedia as primary source.
Cite source type inline for material claims (e.g., "per the Q4 2024 earnings call").

RULE 7 — SOURCE DIVERSITY PER SECTION
Investment Thesis → Tier 1 + Tier 3. Financial Analysis → Tier 1 + Tier 2. Catalysts → Tier 2 + Tier 1. Industry Positioning → Tier 1 + Tier 3. No section may rely entirely on one source type.`
}

function buildBriefSystemPrompt(): string {
  return `You are TIE (Thesis Intelligence Engine), an AI equity research analyst. Generate concise, institutional-quality analysis. Be specific with numbers — cite actual revenue figures, margin percentages, earnings beats/misses, and named catalysts. No marketing language or vague platitudes. Write in a sell-side research tone for professional portfolio managers. Every claim should be backed by a specific data point. Anchor analysis in the most recent quarterly earnings, management guidance, and analyst consensus. Risks must tie directly to thesis pillars — not generic boilerplate.`
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

  const revenueGrowthPct = snap.revenueGrowth !== null ? snap.revenueGrowth * 100 : null
  const highGrowthFlag = revenueGrowthPct !== null && revenueGrowthPct > 40
    ? `\n⚠️  Revenue growth of ${revenueGrowthPct.toFixed(1)}% exceeds 40% — investigate whether this is M&A-driven (see Rule 2).`
    : ''

  const nullMetrics: string[] = []
  if (snap.pe === null) nullMetrics.push('P/E')
  if (snap.evToRevenue === null) nullMetrics.push('EV/Revenue')
  if (snap.revenueGrowth === null) nullMetrics.push('Rev Growth')
  if (snap.grossMargin === null) nullMetrics.push('Gross Margin')
  const naNote = nullMetrics.length > 0
    ? `\n⚠️  Null metrics: [${nullMetrics.join(', ')}] — apply Rule 1: substitute industry-specific alternatives for ${snap.sector} / ${snap.industry}.`
    : ''

  return `Generate a complete institutional equity research report for ${snap.name} (${snap.ticker}).
${contextSection}
## Market Data
- Price: $${snap.price.toFixed(2)} ${snap.currency} (${snap.changePct >= 0 ? '+' : ''}${snap.changePct.toFixed(2)}% today)
- Market Cap: $${(snap.marketCap / 1e9).toFixed(1)}B | Exchange: ${snap.exchange}
- Sector: ${snap.sector} | Industry: ${snap.industry}
- P/E (TTM): ${snap.pe !== null ? `${snap.pe.toFixed(1)}x` : 'N/A'} | EV/Rev: ${snap.evToRevenue !== null ? `${snap.evToRevenue.toFixed(1)}x` : 'N/A'}
- Rev Growth: ${fmt(snap.revenueGrowth, 100, '%')} | Gross Margin: ${fmt(snap.grossMargin, 100, '%')}
- ${description}
${naNote}${highGrowthFlag}

## Instructions
Call generate_investment_report. Fill every field precisely. Follow ALL operating rules in the system prompt.

SNAPSHOT (compact quick-read panel):
- businessDescription: 1 sentence, no fluff
- snapshotSummary: 4-5 sentences — rating/PT/upside, company ID, 2 core reasons, 1 valuation insight, 1 risk caveat
- snapshotThesis: 2 paragraphs (\\n\\n) — Para 1: growth driver, Para 2: financial/capital return story
- whyNow: 2-3 bullet points (•) on separate lines — specific timing catalysts
- snapshotRisks: 3 risks (\\n\\n) — each tied to a specific thesis pillar

FULL REPORT (9 sections in order):
1. investmentSummary: 1 paragraph, 5-6 sentences, PM-readable in 30 seconds
2. investmentThesis: 2-3 paragraphs + [CALLOUT] boxes per Rule 5
3. businessOverview: 1-2 paragraphs + [CALLOUT] boxes per Rule 5, segments with percentages
4. industryPositioning: 1 paragraph, TAM/competitors/market position (Tier 1 + Tier 3 sources)
5. financialAnalysis: 2-3 paragraphs, trend-focused, cite actual figures (Tier 1 primary); flag inorganic growth per Rule 2
6. forwardOutlook: 1 paragraph, trajectory + margin direction + bridge to valuation
7. valuationIntro: 1 short paragraph, methodology + key multiple vs peers
8. catalysts: 3-5 bullets (•) — company-specific only per Rule 3 — "• [Event] — [impact direction]"
9. keyRisks: 4-5 paragraphs (\\n\\n), each tied to specific thesis pillar

QUANT: DCF (5-year projections in $B), 3 scenarios, comparables (subject first with rowType:"subject", peers with rowType:"peer", final Peer Median row with rowType:"peerMedian")`
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
  description: 'Generate a fast research brief snapshot with 5 structured blocks.',
  input_schema: {
    type: 'object' as const,
    required: ['rating', 'priceTarget', 'businessDescription', 'investmentSummary', 'investmentThesis', 'whyNow', 'topRisks'],
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
      businessDescription: {
        type: 'string',
        description: 'One sentence: what the company does + its key competitive position. No filler, no "is a company that". Start directly with what it does.',
      },
      investmentSummary: {
        type: 'string',
        description: '4-5 sentences. S1: rating + price target + upside %. S2: one-line company identifier. S3-S4: two core reasons for the rating (growth driver, moat, FCF, margin). S5: one valuation insight vs peers. End with one key risk caveat. Write for a PM reading in 30 seconds.',
      },
      investmentThesis: {
        type: 'string',
        description: 'Exactly 2 short paragraphs separated by \\n\\n. Para 1: primary growth driver or structural tailwind with specific metrics. Para 2: financial strength, margin profile, or capital return story. One clear idea per paragraph. No blending. No walls of text.',
      },
      whyNow: {
        type: 'string',
        description: '2-3 bullet points, each on a new line starting with •. Each is one sentence answering "why buy today" — a specific timing catalyst: valuation dislocation, earnings momentum, upcoming event, macro setup. Be specific and forward-looking.',
      },
      topRisks: {
        type: 'string',
        description: 'Exactly 3 risks, each separated by \\n\\n. Each risk is 1-2 sentences. Each must directly tie to a thesis pillar — state the risk then state how it specifically threatens the corresponding thesis point. Not generic boilerplate.',
      },
    },
  },
}

export interface TIEBriefAnalysis {
  rating: Rating
  priceTarget: { base: number; bull: number; bear: number }
  businessDescription: string
  investmentSummary: string
  investmentThesis: string
  whyNow: string
  topRisks: string
}

function buildBriefPrompt(snap: StockSnapshot): string {
  const fmt = (v: number | null, multiplier = 1, suffix = '') =>
    v !== null ? `${(v * multiplier).toFixed(1)}${suffix}` : 'N/A'

  const description = (snap.description || `${snap.name} operates in the ${snap.sector} sector.`).slice(0, 300)

  return `Generate a research brief snapshot for ${snap.name} (${snap.ticker}).

## Market Data
- Price: $${snap.price.toFixed(2)} ${snap.currency} | Mkt Cap: $${(snap.marketCap / 1e9).toFixed(1)}B
- Sector: ${snap.sector} | Industry: ${snap.industry}
- P/E (TTM): ${snap.pe !== null ? `${snap.pe.toFixed(1)}x` : 'N/A'} | EV/Rev: ${snap.evToRevenue !== null ? `${snap.evToRevenue.toFixed(1)}x` : 'N/A'}
- Rev Growth: ${fmt(snap.revenueGrowth, 100, '%')} | Gross Margin: ${fmt(snap.grossMargin, 100, '%')}
- ${description}

Call generate_research_brief with all 5 snapshot blocks:
1. businessDescription: 1 sentence, no filler, start with what it does
2. investmentSummary: 4-5 sentences — rating/PT/upside, company ID, 2 core reasons, valuation insight vs peers, 1 risk caveat
3. investmentThesis: 2 paragraphs (\\n\\n) — Para 1: growth driver with metrics, Para 2: financial/margin story
4. whyNow: 2-3 bullets (•) on separate lines — specific timing catalysts only
5. topRisks: 3 risks (\\n\\n) — each 1-2 sentences, each tied to a thesis pillar

Cite specific numbers throughout. No generic language.`
}

export async function generateTIEBrief(snap: StockSnapshot): Promise<TIEBriefAnalysis> {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1500,
    system: buildBriefSystemPrompt(),
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
