import ReportNav from '@/components/report/ReportNav'
import styles from './page.module.css'

export default function AboutPage() {
  return (
    <div className={styles.bg}>
      <ReportNav />
      <main className={styles.page}>

        <header className={styles.hero}>
          <p className={styles.eyebrow}>About</p>
          <h1 className={styles.h1}>Institutional research,<br />democratized.</h1>
          <p className={styles.sub}>
            Thesis puts the analytical power of a Wall Street research desk in your hands —
            in seconds, not days.
          </p>
        </header>

        <div className={styles.divider} />

        <section className={styles.section}>
          <h2 className={styles.h2}>What is Thesis?</h2>
          <p className={styles.body}>
            Thesis is an AI-powered equity research platform designed for investors who want
            more than a stock price. Every report covers the full picture: investment thesis,
            business overview, financial analysis, DCF valuation, scenario modeling, and risk
            factors — the same structure used by sell-side analysts at major investment banks.
          </p>
          <p className={styles.body}>
            Traditional equity research is slow, expensive, and locked behind institutional
            paywalls. Thesis changes that. Enter any publicly traded ticker, and within
            30 seconds you have a professional-grade research report grounded in real-time
            market data and AI-driven analysis.
          </p>
        </section>

        <div className={styles.divider} />

        <section className={styles.section}>
          <h2 className={styles.h2}>What is TIE?</h2>
          <p className={styles.body}>
            TIE — the <strong>Thesis Intelligence Engine</strong> — is the AI analysis core
            that powers every report. TIE combines live financial data with Claude
            claude-sonnet-4-20250514, Anthropic's frontier language model, to synthesize
            market data, industry context, and competitive dynamics into coherent, actionable
            analysis.
          </p>
          <p className={styles.body}>
            TIE doesn't just summarize numbers. It reasons about what those numbers mean:
            whether a P/E premium is justified, what a margin contraction signals, how a
            company's growth trajectory compares to its sector peers, and where the key risks
            lie. The result reads like it was written by an analyst who has spent years
            following the company — because the model it runs on has.
          </p>
        </section>

        <div className={styles.divider} />

        <section className={styles.section}>
          <h2 className={styles.h2}>How it works</h2>
          <div className={styles.steps}>
            {[
              {
                n: '01',
                title: 'You enter a ticker',
                body: 'Any publicly traded company on major exchanges — NYSE, NASDAQ, and beyond. Type a symbol or search by company name.',
              },
              {
                n: '02',
                title: 'Live data is fetched',
                body: 'Thesis pulls real-time market data from Financial Modeling Prep: current price, market cap, P/E ratio, EV/Revenue, revenue growth, and gross margin.',
              },
              {
                n: '03',
                title: 'TIE analyzes',
                body: 'The live data is passed to TIE, which uses Claude claude-sonnet-4-20250514 to generate the full research report — writing the thesis, modeling the DCF, building scenarios, and identifying risks.',
              },
              {
                n: '04',
                title: 'Report delivered',
                body: 'In 15–30 seconds you have a complete, structured research report: rating, price target, full narrative, DCF projections, bull/base/bear scenarios, and a comparable company table.',
              },
            ].map(step => (
              <div key={step.n} className={styles.step}>
                <div className={styles.stepNum}>{step.n}</div>
                <div className={styles.stepContent}>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepBody}>{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className={styles.divider} />

        <section className={styles.section}>
          <h2 className={styles.h2}>What&apos;s in a report?</h2>
          <div className={styles.grid}>
            {[
              { label: 'Investment Thesis',  body: 'The core buy/hold/sell argument in 3–5 substantive paragraphs, covering competitive moat, growth catalysts, and valuation setup.' },
              { label: 'Business Overview',  body: 'Revenue model, segment breakdown, go-to-market strategy, and key operational drivers explained in plain language.' },
              { label: 'Financial Analysis', body: 'Margin trajectory, cash flow quality, balance sheet strength, and earnings quality — with reference to real reported numbers.' },
              { label: 'DCF Valuation',      body: '5-year free cash flow projections, WACC, terminal growth rate, and an intrinsic value per share with implied upside.' },
              { label: 'Scenario Analysis',  body: 'Bull, base, and bear case price targets, each with specific quantified assumptions driving the outcome.' },
              { label: 'Comparable Companies', body: 'A peer group table with forward multiples, revenue growth, and gross margins — so you can see where the stock stands relative to the sector.' },
            ].map(item => (
              <div key={item.label} className={styles.gridItem}>
                <h3 className={styles.gridLabel}>{item.label}</h3>
                <p className={styles.gridBody}>{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <div className={styles.divider} />

        <section className={styles.section}>
          <h2 className={styles.h2}>Data &amp; Sources</h2>
          <p className={styles.body}>
            Market data is sourced live from{' '}
            <strong>Financial Modeling Prep</strong>. AI analysis is generated by{' '}
            <strong>Claude claude-sonnet-4-20250514</strong> (Anthropic). Reports are
            generated fresh on every request — there is no caching of AI analysis.
          </p>
          <p className={styles.body}>
            Thesis is for <strong>informational purposes only</strong> and does not
            constitute investment advice. All data should be independently verified before
            making any investment decisions. Past performance is not indicative of future
            results.
          </p>
        </section>

      </main>
    </div>
  )
}
