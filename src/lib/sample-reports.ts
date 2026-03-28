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

  // Snapshot card
  businessDescription: 'NVIDIA designs accelerated computing platforms — GPUs, networking, and software — that power AI training, inference, scientific computing, and visualization at hyperscale.',

  snapshotSummary: {
    title: 'Investment Summary',
    content: 'We initiate with BUY and a $235 base target (34% upside). NVIDIA is the singular beneficiary of the AI infrastructure buildout, with $1T in cumulative GPU orders through 2027 and no viable competitor at scale for training workloads. The Blackwell cycle is proving more durable than consensus expects.',
  },

  snapshotThesis: {
    title: 'Investment Thesis',
    content: `NVIDIA commands an unassailable moat through the CUDA ecosystem — 15+ years of developer lock-in across 4 million developers and every major AI training framework. Switching costs are measured in years, not quarters.

Blackwell architecture is driving gross margin expansion as GB200 NVL72 rack economics improve. We model 66% operating margins in FY2026E on $198B revenue, with further upside from GB300 in 2027.`,
  },

  whyNow: {
    title: 'Why Now',
    content: `• Stock has pulled back 18% from $212 highs, creating an attractive entry at 35x forward earnings
• H200 supply constraints have fully resolved; GB200 NVL72 racks shipping at scale
• Sovereign AI demand accelerating — $15B+ in incremental orders from Middle East and Europe
• Hyperscaler capex guidance revised upward at every major earnings call in the past two quarters`,
  },

  snapshotRisks: {
    title: 'Key Risks',
    content: `Custom silicon from hyperscalers (Google TPU v5, Amazon Trainium2) could displace 20–25% of GPU workloads by 2028. Export control tightening remains an overhang — China was ~17% of DC revenue before BIS restrictions. Any quarter with <40% DC growth YoY could compress multiples 20–25%.`,
  },

  // Full report sections
  investmentSummary: {
    title: 'Investment Summary',
    content: `We initiate coverage of NVIDIA with a BUY rating and a 12-month price target of $235, representing 34% upside from current levels. NVIDIA remains the singular beneficiary of the most significant infrastructure buildout in technology history. With $1 trillion in cumulative GPU orders through 2027, accelerating hyperscaler capex, and no viable competitor at scale in AI training, the current pullback from $212 creates an attractive entry point for long-term investors.

The Blackwell architecture cycle is proving more durable than initial estimates. H200 supply constraints have resolved, GB200 NVL72 rack systems are shipping at scale, and early GB300 orders suggest the upgrade cycle extends well into 2027. Data center revenue grew 93% year-over-year in the most recent quarter and we model 54% growth in FY2026 with margin expansion as Blackwell mix improves.`,
  },

  investmentThesis: {
    title: 'Investment Thesis',
    content: `NVIDIA's competitive moat extends far beyond silicon. The CUDA ecosystem represents 15+ years of developer lock-in that cannot be replicated in a product cycle. With 4 million CUDA developers and frameworks like cuDNN, cuBLAS, and TensorRT deeply embedded in every major AI training stack, the switching cost for alternatives is measured in years, not quarters.

At the platform level, NVIDIA's NVLink interconnect, DGX reference architecture, and NGC software catalog create compounding moats that hardware-only competitors cannot match. The company is not merely selling GPUs — it is selling the operating system of modern AI infrastructure.`,
  },

  businessOverview: {
    title: 'Business Overview',
    content: `NVIDIA designs and markets graphics processing units (GPUs), system-on-chip units, and application programming interfaces (APIs) for gaming, professional visualization, data center, and automotive markets. The company's Data Center segment — which includes compute and networking — has emerged as the dominant revenue driver, representing 88% of total revenue in the most recent quarter.

The company operates a fabless model, relying primarily on TSMC for advanced node manufacturing (currently 4N and transitioning to N3E). This creates meaningful geopolitical supply chain exposure but also eliminates capital-intensive fab ownership. NVIDIA's Compute & Networking revenue is driven by GPU sales into hyperscalers (Microsoft Azure, Amazon AWS, Google Cloud, Meta), sovereign AI initiatives, and enterprise AI adoption.

The gaming segment, once NVIDIA's core business, has stabilized at approximately $3B per quarter and benefits from the same architectural improvements as data center products. The automotive segment remains nascent but represents significant long-duration optionality with DRIVE Orin and Thor gaining design wins at major OEMs.`,
  },

  industryPositioning: {
    title: 'Industry & Competitive Positioning',
    content: `NVIDIA holds approximately 85% share of discrete AI training GPU deployments, with AMD's MI300X series capturing the remainder in select workloads. Intel's Gaudi 3 has gained minimal traction. The competitive dynamic in inference is more fragmented, with custom silicon playing a larger role at consumer-facing hyperscalers.

The custom silicon threat is real but overestimated in the near term. Google's TPU v5 handles internal search and recommendation workloads efficiently but has not displaced external GPU purchasing. Amazon's Trainium2 remains primarily internal and has not achieved software ecosystem depth. Microsoft's Maia is in early deployment. Critically, none of these chips are sold externally, limiting addressable TAM.

In networking, NVIDIA's InfiniBand and Spectrum-X ethernet solutions have taken meaningful share from Mellanox legacy products and incumbent ethernet vendors in AI cluster fabrics. This creates a second revenue stream that scales with GPU deployments.`,
  },

  financialAnalysis: {
    title: 'Financial Analysis',
    content: `NVIDIA's financial profile has transformed dramatically over the past 24 months. Revenue has compounded at 147% annually over the last two fiscal years, driven entirely by Data Center. Gross margins have expanded from 64% to 73.5% as higher-ASP Blackwell systems displace Hopper, with further expansion expected as NVL72 rack economics improve.

Free cash flow conversion remains exceptional at approximately 94% of net income, reflecting the asset-light fabless model. The company generated $60B in FCF in FY2025 and returned $33.5B to shareholders through buybacks and dividends. The balance sheet is fortress-grade with $43B in cash against minimal debt.

We model FY2026E revenue of $198B (+54% YoY), operating income of $131B (66% margin), and EPS of $4.22. Our FY2027E assumptions of $248B revenue and $5.10 EPS reflect continued Blackwell uptake, sovereign AI demand acceleration, and early GB300 contribution in the back half. These estimates sit approximately 8% above consensus, which we believe underestimates the durability of hyperscaler capex.`,
  },

  forwardOutlook: {
    title: 'Forward Outlook',
    content: `The near-term setup is constructive. Q1 FY2026 guidance of $43B (+65% YoY) implies continued sequential growth and was above consensus at the time of issuance. Management commentary on GB300 sampling and NVL72 rack bookings through 2027 suggests backlog visibility that is unusually long for a semiconductor company.

Medium-term, the Rubin architecture (expected 2026 sampling, 2027 ramp) represents the next major platform cycle. Early indications suggest a 3–4x performance improvement per rack over Blackwell, which would sustain the upgrade supercycle thesis into fiscal 2028.

The primary watch item for the next two quarters is gross margin trajectory. Any disappointment in Blackwell yield or CoWoS packaging availability could compress margins below the 73% floor investors have priced in and trigger multiple compression.`,
  },

  valuationIntro: {
    title: 'Valuation',
    content: `We value NVIDIA using a DCF with a 9.5% WACC and 3.5% terminal growth rate, yielding an intrinsic value of $228 — consistent with our $235 price target after a modest market premium for NVIDIA's platform position. On a relative basis, NVIDIA trades at 34.8x FY2026E EPS versus AMD at 22.4x and Broadcom at 28.9x. The premium is justified by NVIDIA's structural monopoly in AI training, superior margin profile, and faster growth trajectory.

Our scenario analysis yields a $235 base, $290 bull (sustained hyperscaler spend, sovereign AI upside), and $130 bear (capex deceleration, custom silicon acceleration). The asymmetric risk/reward profile at current levels tilts materially toward the bull case, in our view, given the 65% upside versus 26% downside.`,
  },

  catalysts: {
    title: 'Catalysts & Developments',
    content: `• Q1 FY2026 earnings (May 2026): first full quarter of GB200 NVL72 at scale; gross margin guidance critical
• GTC 2026 (March): expected GB300 product announcement and Rubin architecture preview
• Hyperscaler capex guidance updates: Microsoft (April), Alphabet (April), Amazon (May), Meta (April)
• Sovereign AI contract announcements: Middle East and European government deployments progressing
• Export control policy: any relaxation of H20 restrictions would unlock $8–12B in incremental TAM
• Automotive: DRIVE Thor design win announcements from major OEM partners expected mid-2026`,
  },

  keyRisks: {
    title: 'Key Risks',
    content: `Custom silicon displacement from hyperscaler-built chips (Google TPU v5, Amazon Trainium2, Microsoft Maia) represents the primary structural risk. While none have achieved meaningful training workload displacement to date, the hyperscalers' long-term desire to reduce GPU dependency and improve unit economics is well-documented. We estimate custom silicon currently handles less than 8% of hyperscaler AI compute but could reach 20–25% by 2028.

Export control tightening remains an overhang. China represented approximately 17% of data center revenue in FY2024 before BIS restrictions eliminated the H20 export pathway. Any further expansion of restrictions to additional geographies (Middle East, Southeast Asia) could remove meaningful incremental TAM. We haircut our international sovereign AI estimates by 15% to account for this risk.

Valuation compression at 35x forward earnings leaves limited room for execution miss. Any quarter where data center growth decelerates meaningfully below 40% YoY will likely reprice the stock to 25–28x, implying 20–25% downside from current levels. TSMC concentration and CoWoS advanced packaging supply constraints remain near-term watch items for Blackwell ramp execution.`,
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
        'Gross margin stable at 73–75%',
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

  news: [],
}
