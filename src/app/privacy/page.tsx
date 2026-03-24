import ReportNav from '@/components/report/ReportNav'
import styles from './page.module.css'

export default function PrivacyPage() {
  return (
    <div className={styles.bg}>
      <ReportNav />
      <main className={styles.page}>

        <header className={styles.hero}>
          <p className={styles.eyebrow}>Legal</p>
          <h1 className={styles.h1}>Privacy Policy</h1>
          <p className={styles.meta}>Effective January 1, 2026 · Last updated March 2026</p>
        </header>

        <div className={styles.body}>

          <section className={styles.section}>
            <h2 className={styles.h2}>1. Overview</h2>
            <p>Thesis (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is committed to protecting your privacy. This Privacy Policy explains how we handle information when you use the Thesis equity research platform.</p>
            <p>Thesis does not require account creation or login. We collect minimal information necessary to operate the Service.</p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>2. Information We Collect</h2>
            <p><strong>Ticker queries.</strong> When you search for a ticker or generate a report, we process the ticker symbol you enter in order to fetch market data and generate your report. We do not associate this with any personal identity.</p>
            <p><strong>Usage data.</strong> We may collect standard server logs including IP address, browser type, pages visited, and timestamps. This information is used for service operation, security, and improving the product.</p>
            <p><strong>Cookies.</strong> The Service may use essential cookies required for functionality. We do not use tracking or advertising cookies.</p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>3. How We Use Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Operate and improve the Service</li>
              <li>Fetch market data and generate research reports on your behalf</li>
              <li>Monitor and ensure the security of the Service</li>
              <li>Analyze aggregate usage patterns to improve product quality</li>
            </ul>
            <p>We do not sell, rent, or share your personal information with third parties for marketing purposes.</p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>4. Third-Party Services</h2>
            <p><strong>Financial Modeling Prep.</strong> Market data is fetched from Financial Modeling Prep&apos;s API. Your ticker queries are sent to their servers to retrieve financial data. FMP&apos;s privacy policy governs their data practices.</p>
            <p><strong>Anthropic.</strong> Report generation uses Anthropic&apos;s Claude API. The financial data for your requested ticker is sent to Anthropic&apos;s servers for processing. Anthropic&apos;s privacy policy governs their data practices. Anthropic does not use API inputs to train their models by default.</p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>5. Data Retention</h2>
            <p>We do not store the generated reports or associate them with user identities. Server logs may be retained for up to 90 days for security and debugging purposes, after which they are deleted.</p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>6. Security</h2>
            <p>We implement reasonable technical measures to protect the Service and any data we process. However, no internet transmission is completely secure, and we cannot guarantee the absolute security of information transmitted through the Service.</p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>7. Children&apos;s Privacy</h2>
            <p>The Service is not directed to children under 13. We do not knowingly collect information from children under 13.</p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>8. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. Changes will be reflected by updating the &ldquo;Last updated&rdquo; date at the top of this page. Continued use of the Service after changes constitutes acceptance of the revised policy.</p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>9. Contact</h2>
            <p>If you have questions or concerns about this Privacy Policy, please reach out through the Thesis platform.</p>
          </section>

        </div>
      </main>
    </div>
  )
}
