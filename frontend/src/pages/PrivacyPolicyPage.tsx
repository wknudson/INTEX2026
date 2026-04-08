import { SiteNav } from '../components/SiteNav';

export function PrivacyPolicyPage() {
  return (
    <>
      <SiteNav />
      <main className="container py-4" style={{ maxWidth: 800 }}>
        <h1>Privacy Policy</h1>
        <p><em>Last updated: April 2026</em></p>

        <h4>1. Data Controller</h4>
        <p>Havyn Safehouse Foundation, Inc. ("Havyn", "we", "us") is a 501(c)(3) nonprofit organization headquartered in Cebu City, Philippines. We operate safehouses that protect and rehabilitate girls who are survivors of abuse and trafficking. For questions about this policy, contact us at privacy@havyn.org.</p>

        <h4>2. What Data We Collect</h4>
        <p>We collect the minimum data necessary to provide our services:</p>
        <ul>
          <li><strong>Donor accounts:</strong> name, email, country, and donation history.</li>
          <li><strong>Staff accounts:</strong> name, email, role, and safehouse assignment.</li>
          <li><strong>Resident records:</strong> anonymized case identifiers, health and education progress scores, incident reports, and care plans. Identifying demographic information is restricted to authorized staff only.</li>
          <li><strong>Technical data:</strong> session cookies for authentication, cookie consent preference.</li>
        </ul>

        <h4>3. Legal Basis for Processing</h4>
        <p>We process personal data based on: (a) your consent when you create an account and accept this policy; (b) legitimate interest in operating child protection services; (c) legal obligations related to child welfare reporting.</p>

        <h4>4. How We Use Your Data</h4>
        <ul>
          <li>To provide secure access to the Havyn platform based on your role.</li>
          <li>To track care outcomes and ensure no child falls through the cracks.</li>
          <li>To report aggregated, anonymized impact metrics to donors and the public.</li>
          <li>To process and acknowledge donations.</li>
        </ul>

        <h4>5. Data Sharing</h4>
        <p>We do not sell or share personal data with third parties for marketing. We may share data with: (a) government agencies as required by Philippine child welfare law; (b) partner organizations for service delivery, under data processing agreements; (c) law enforcement when legally required.</p>

        <h4>6. Data Retention</h4>
        <p>Donor records are retained for 7 years after the last donation for tax and audit purposes. Resident case records are retained for 10 years after case closure per Philippine social welfare regulations. Staff account data is retained for the duration of employment plus 3 years.</p>

        <h4>7. Your Rights</h4>
        <p>Under the Philippine Data Privacy Act (RA 10173) and GDPR where applicable, you have the right to:</p>
        <ul>
          <li>Access the personal data we hold about you.</li>
          <li>Request correction of inaccurate data.</li>
          <li>Request deletion of your data (subject to legal retention requirements).</li>
          <li>Object to processing of your data.</li>
          <li>Data portability — receive your data in a structured format.</li>
          <li>Withdraw consent at any time.</li>
        </ul>
        <p>To exercise any of these rights, email privacy@havyn.org. We will respond within 30 days.</p>

        <h4>8. Cookies</h4>
        <p>We use one essential cookie (<code>havyn.auth</code>) for login sessions. If you accept optional cookies, we store your consent preference in a <code>havyn_cookie_choice</code> cookie. No analytics or tracking cookies are used unless you consent.</p>

        <h4>9. Security</h4>
        <p>All data is transmitted over HTTPS/TLS. Passwords are hashed with PBKDF2 (HMAC-SHA256, 128-bit salt, 10,000 iterations). Role-based access control ensures staff only see data relevant to their responsibilities. Content Security Policy headers protect against XSS and injection attacks.</p>

        <h4>10. Changes to This Policy</h4>
        <p>We will notify users of material changes via the platform and update the "Last updated" date. Continued use after changes constitutes acceptance.</p>

        <h4>11. Contact</h4>
        <p>Havyn Safehouse Foundation, Inc.<br/>Cebu City, Philippines<br/>Email: privacy@havyn.org</p>
      </main>
    </>
  );
}
