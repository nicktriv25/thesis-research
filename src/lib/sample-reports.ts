import type { TIEReport } from './types'

export const NVDA_REPORT: TIEReport = {
  ticker: 'NVDA',
  exchange: 'NASDAQ',
  companyName: 'NVIDIA Corporation',
  sector: 'AI Infrastructure & Data Center Semiconductors',
  reportType: 'Initiation of Coverage',
  generatedAt: '2026-03-20T09:00:00Z',

  rating: 'BUY',
  currentPrice: 174.90,
  priceTarget: {
    base: 235,
    bull: 290,
    bear: 130,
    currency: 'USD',
  },

  metrics: [
    { label: 'Price',        value: '$174.90' },
    { label: 'Market Cap',   value: '$4.28T'  },
    { label: 'P/E (FWD)',    value: '34.8x'   },
    { label: 'EV/Revenue',   value: '27.2x'   },
    { label: 'Rev Growth',   value: '+62%'    },
    { label: 'Gross Margin', value: '73.5%'   },
  ],

  investmentThesis: {
    title: 'Investment Thesis',
    content: `We initiate coverage of NVIDIA with a BUY rating and a 12-month price target of $235, representing 34% upside from current levels. NVIDIA remains the singular beneficiary of the most significant infrastructure buildout in technology history. With $1 trillion in cumulative GPU orders through 2027, accelerating hyperscaler capex, and no viable competitor at scale in AI training, the current pullback from $212 creates an attractive entry point for long-term investors.

The Blackwell architecture cycle is proving more durable than initial estimates. H200 supply constraints have resolved, GB200 NVL72 rack systems are shipping at scale, and early GB300 orders suggest the upgrade cycle extends well into 2027. Data center revenue grew 93% year-over-year in the most recent quarter and we model 54% growth in FY2026 with margin expansion as Blackwell mix improves.

NVIDIA's competitive moat extends far beyond silicon. The CUDA ecosystem represents 15+ years of developer lock-in that cannot be replicated in a product cycle. With 4 million CUDA developers and frameworks like cuDNN, cuBLAS, and TensorRT deeply embedded in every major AI training stack, the switching cost for alternatives is measured in years, not quarters.`,
  },

  businessOverview: {
    title: 'Business Overview',
    content: `NVIDIA designs and markets graphics processing units (GPUs), system-on-chip units, and application programming interfaces (APIs) for gaming, professional visualization, data center, and automotive markets. The company's Data Center segment — which includes compute and networking — has emerged as the dominant revenue driver, representing 88% of total revenue in the most recent quarter.

The company operates a fabless model, relying primarily on TSMC for advanced node manufacturing (currently 4N and transitioning to N3E). This creates meaningful geopolitical supply chain exposure but also eliminates capital-intensive fab ownership. NVIDIA's Compute & Networking revenue is driven by GPU sales into hyperscalers (Microsoft Azure, Amazon AWS, Google Cloud, Meta), sovereign AI initiatives, and enterprise AI adoption.

The gaming segment, once NVIDIA's core business, has stabilized at approximately $3B per quarter and benefits from the same architectural improvements as data center products. The automotive segment remains nascent but represents a significant long-duration optionality with DRIVE Orin and Thor gaining design wins at major OEMs.`,
  },

  financialAnalysis: {
    title: 'Financial Analysis',
    content: `NVIDIA's financial profile has transformed dramatically over the past 24 months. Revenue has compounded at 147% annually over the last two fiscal years, driven entirely by Data Center. Gross margins have expanded from 64% to 73.5% as higher-ASP Blackwell systems displace Hopper, with further expansion expected as NVL72 rack economics improve.

Free cash flow conversion remains exceptional at approximately 94% of net income, reflecting the asset-light fabless model. The company generated $60B in FCF in FY2025 and returned $33.5B to shareholders through buybacks and dividends. The balance sheet is fortress-grade with $43B in cash against minimal debt.

We model FY2026E revenue of $198B (+54% YoY), operating income of $131B (66% margin), and EPS of $4.22. Our FY2027E assumptions of $248B revenue and $5.10 EPS reflect continued Blackwell uptake, sovereign AI demand acceleration, and early GB300 contribution in the back half. These estimates sit approximately 8% above consensus, which we believe underestimates the durability of hyperscaler capex.`,
  },

  riskFactors: {
    title: 'Key Risks',
    content: `Custom silicon displacement from hyperscaler-built chips (Google TPU v5, Amazon Trainium2, Microsoft Maia) represents the primary structural risk. While none have achieved meaningful training workload displacement to date, the hyperscalers' long-term desire to reduce GPU dependency and improve unit economics is well-documented. We estimate custom silicon currently handles less than 8% of hyperscaler AI compute but could reach 20-25% by 2028.

Export control tightening remains an overhang. China represented approximately 17% of data center revenue in FY2024 before BIS restrictions eliminated the H20 export pathway. Any further expansion of restrictions to additional geographies (Middle East, Southeast Asia) could remove meaningful incremental TAM. We haircut our international sovereign AI estimates by 15% to account for this risk.

Valuation compression at 35x forward earnings leaves limited room for execution miss. Any quarter where data center growth decelerates meaningfully below 40% YoY will likely reprice the stock to 25-28x, implying 20-25% downside from current levels. TSMC concentration and CoWoS advanced packaging supply constraints remain near-term watch items for Blackwell ramp execution.`,
  },

  dcf: {
    intrinsicValue: 228,
    impliedUpside: 30.4,
    inputs: {
      wacc: 9.5,
      terminalGrowthRate: 3.5,
      projectionYears: 5,
      revenueCAGR: 28,
    },
    yearlyProjections: [
      { year: 2026, revenue: 198.0, fcf: 118.8, discountedFCF: 108.5 },
      { year: 2027, revenue: 248.0, fcf: 152.0, discountedFCF: 126.7 },
      { year: 2028, revenue: 295.0, fcf: 183.9, discountedFCF: 139.5 },
      { year: 2029, revenue: 336.0, fcf: 211.7, discountedFCF: 146.4 },
      { year: 2030, revenue: 372.0, fcf: 234.4, discountedFCF: 147.6 },
    ],
  },

  scenarios: [
    {
      label: 'Bull Case',
      target: 290,
      upside: 65.8,
      description: 'Blackwell demand sustains through FY2027; sovereign AI adds $30B incremental; gaming recovers to all-time highs; custom silicon threat remains contained.',
      keyAssumptions: [
        'FY2027 Data Center revenue of $230B (+28% YoY)',
        'Gross margin expansion to 77% on NVL72 mix',
        '35x multiple on $8.30 FY2027E EPS',
      ],
    },
    {
      label: 'Base Case',
      target: 235,
      upside: 34.4,
      description: 'Consensus Blackwell ramp, moderate sovereign AI contribution, stable hyperscaler capex through 2027, no new export restriction headwinds.',
      keyAssumptions: [
        'FY2027 Data Center revenue of $185B (+18% YoY)',
        'Gross margin stable at 73-75%',
        '32x multiple on $7.34 FY2027E EPS',
      ],
    },
    {
      label: 'Bear Case',
      target: 130,
      upside: -25.7,
      description: 'Hyperscaler capex moderation, faster custom silicon adoption, margin compression from competitive pricing, and export control expansion to new geographies.',
      keyAssumptions: [
        'FY2027 Data Center revenue of $145B (+3% YoY)',
        'Gross margin compression to 68% on competitive pressure',
        '22x multiple on $5.90 FY2027E EPS',
      ],
    },
  ],

  comparables: [
    { ticker: 'NVDA',  name: 'NVIDIA Corporation',    price: '$174.90', marketCap: '$4.28T', peForward: '34.8x', evRevenue: '27.2x', revenueGrowth: '+62%', grossMargin: '73.5%', rating: 'BUY'  },
    { ticker: 'AMD',   name: 'Advanced Micro Devices', price: '$105.40', marketCap: '$171B',  peForward: '22.4x', evRevenue: '6.8x',  revenueGrowth: '+24%', grossMargin: '53.0%'              },
    { ticker: 'INTC',  name: 'Intel Corporation',      price: '$44.25',  marketCap: '$187B',  peForward: '28.1x', evRevenue: '2.1x',  revenueGrowth: '-2%',  grossMargin: '41.5%'              },
    { ticker: 'AVGO',  name: 'Broadcom Inc',           price: '$185.20', marketCap: '$870B',  peForward: '28.9x', evRevenue: '16.4x', revenueGrowth: '+44%', grossMargin: '68.9%'              },
    { ticker: 'QCOM',  name: 'Qualcomm Inc',           price: '$164.00', marketCap: '$181B',  peForward: '14.2x', evRevenue: '4.1x',  revenueGrowth: '+11%', grossMargin: '56.0%'              },
    { ticker: 'MRVL',  name: 'Marvell Technology',     price: '$62.80',  marketCap: '$54B',   peForward: '31.5x', evRevenue: '8.2x',  revenueGrowth: '+36%', grossMargin: '60.2%'              },
  ],
}
