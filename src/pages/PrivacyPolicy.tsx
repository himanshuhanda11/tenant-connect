import { Link } from 'react-router-dom';
import { SEO } from '@/components/seo';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/layout/Breadcrumb';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <SEO title="Privacy Policy - AiReatro" description="Read AiReatro's privacy policy. Learn how we collect, use, and protect your personal data on our WhatsApp API & CRM platform." keywords={["privacy policy", "data protection", "GDPR", "WhatsApp API privacy"]} canonical="/privacy-policy" />
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Breadcrumb className="mb-6" />

        <h1 className="text-4xl font-bold text-foreground mb-8">Privacy Policy</h1>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-10">
          <p className="text-muted-foreground">
            <strong>Last Updated:</strong> May 13, 2026
          </p>

          <section className="space-y-4">
            <p className="text-muted-foreground">
              Welcome to Aireatro ("Aireatro", "we", "our", or "us").
              This Privacy Policy explains how we collect, use, store, process, and protect your information when you use our website, software, products, and services available through{" "}
              <a href="https://aireatro.com" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">https://aireatro.com</a>{" "}
              ("Platform").
            </p>
            <p className="text-muted-foreground">
              Aireatro is a WhatsApp Business API and CRM platform that helps businesses automate communication, manage customer conversations, generate leads, and improve customer engagement using WhatsApp and other integrated services.
            </p>
            <p className="text-muted-foreground">
              By accessing or using our Platform, you agree to the practices described in this Privacy Policy.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">1. Information We Collect</h2>
            <p className="text-muted-foreground">We may collect the following categories of information:</p>

            <h3 className="text-lg font-semibold text-foreground mt-4">A. Account Information</h3>
            <p className="text-muted-foreground">When you create an account, we may collect:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Full name</li>
              <li>Email address</li>
              <li>Password (encrypted)</li>
              <li>Phone number</li>
              <li>Business or company name</li>
              <li>Billing details</li>
            </ul>

            <h3 className="text-lg font-semibold text-foreground mt-4">B. Workspace &amp; Team Information</h3>
            <p className="text-muted-foreground">To provide collaboration features, we may collect:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Workspace names</li>
              <li>Team member details</li>
              <li>Roles and permissions</li>
              <li>Connected business accounts</li>
            </ul>

            <h3 className="text-lg font-semibold text-foreground mt-4">C. WhatsApp &amp; Messaging Data</h3>
            <p className="text-muted-foreground">When you connect your WhatsApp Business account to Aireatro, we may process:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>WhatsApp phone numbers</li>
              <li>Customer contact numbers</li>
              <li>Message templates</li>
              <li>Message metadata</li>
              <li>Conversation timestamps</li>
              <li>Automation workflows</li>
              <li>Media files shared through WhatsApp</li>
            </ul>
            <p className="text-muted-foreground">
              <strong>Aireatro does not claim ownership of your customer data or conversations.</strong>
            </p>

            <h3 className="text-lg font-semibold text-foreground mt-4">D. Usage &amp; Device Information</h3>
            <p className="text-muted-foreground">We may automatically collect:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>IP address</li>
              <li>Browser type</li>
              <li>Device information</li>
              <li>Operating system</li>
              <li>Login activity</li>
              <li>Pages visited</li>
              <li>Usage analytics and diagnostics</li>
            </ul>

            <h3 className="text-lg font-semibold text-foreground mt-4">E. Cookies &amp; Tracking Technologies</h3>
            <p className="text-muted-foreground">We use cookies and similar technologies to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Maintain secure sessions</li>
              <li>Improve performance</li>
              <li>Analyze traffic and usage trends</li>
              <li>Personalize user experience</li>
            </ul>
            <p className="text-muted-foreground">
              You may disable cookies through your browser settings; however, some features may not function properly.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">2. How We Use Your Information</h2>
            <p className="text-muted-foreground">We use your information to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Provide and operate the Aireatro Platform</li>
              <li>Enable WhatsApp Business API messaging</li>
              <li>Process customer conversations and automation workflows</li>
              <li>Improve platform performance and security</li>
              <li>Send account notifications and transactional emails</li>
              <li>Provide customer support and technical assistance</li>
              <li>Monitor usage patterns and detect fraud or abuse</li>
              <li>Comply with legal obligations</li>
              <li>Develop new products, features, and integrations</li>
            </ul>
            <p className="text-muted-foreground">
              <strong>We do not sell your personal information to third parties.</strong>
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">3. WhatsApp &amp; Meta Integration</h2>
            <p className="text-muted-foreground">
              Aireatro integrates with services provided by Meta, including the WhatsApp Business Platform.
            </p>
            <p className="text-muted-foreground">By using Aireatro, you acknowledge and agree that:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Your data may be processed through Meta's infrastructure</li>
              <li>WhatsApp conversations are subject to Meta's policies and terms</li>
              <li>Meta may independently process certain technical and messaging data</li>
            </ul>
            <p className="text-muted-foreground">We recommend reviewing:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><a href="https://www.facebook.com/privacy/policy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Meta Privacy Policy</a></li>
              <li><a href="https://business.whatsapp.com/products/business-platform" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">WhatsApp Business Terms</a></li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">4. Data Sharing &amp; Disclosure</h2>
            <p className="text-muted-foreground">We may share information only in the following circumstances:</p>

            <h3 className="text-lg font-semibold text-foreground mt-4">Service Providers</h3>
            <p className="text-muted-foreground">With trusted third-party providers who help us operate the Platform, including:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Cloud hosting providers</li>
              <li>Payment processors</li>
              <li>Email delivery services</li>
              <li>Analytics providers</li>
              <li>Customer support tools</li>
            </ul>

            <h3 className="text-lg font-semibold text-foreground mt-4">Legal Requirements</h3>
            <p className="text-muted-foreground">We may disclose information if required to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Comply with applicable laws or regulations</li>
              <li>Respond to legal requests</li>
              <li>Protect the rights, safety, or security of Aireatro, users, or others</li>
              <li>Prevent fraud, abuse, or illegal activities</li>
            </ul>
            <p className="text-muted-foreground">
              <strong>We do not rent or sell user databases to advertisers or third parties.</strong>
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">5. Data Security</h2>
            <p className="text-muted-foreground">We implement industry-standard technical and organizational safeguards to protect your information, including:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>SSL encryption</li>
              <li>Secure database infrastructure</li>
              <li>Access controls and authentication</li>
              <li>Firewall and monitoring systems</li>
              <li>Encrypted password storage</li>
              <li>Role-based permissions</li>
            </ul>
            <p className="text-muted-foreground">
              While we strive to protect your data, no method of transmission or storage is completely secure. Users are responsible for maintaining the confidentiality of their account credentials.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">6. Data Retention</h2>
            <p className="text-muted-foreground">We retain information only for as long as necessary to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Provide our services</li>
              <li>Maintain operational records</li>
              <li>Comply with legal obligations</li>
              <li>Resolve disputes</li>
              <li>Enforce agreements</li>
            </ul>
            <p className="text-muted-foreground">
              You may request account deletion at any time by contacting us. Upon deletion request, we will remove or anonymize applicable data unless retention is legally required.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">7. Your Rights &amp; Choices</h2>
            <p className="text-muted-foreground">Depending on your location and applicable laws, you may have rights to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Delete your data</li>
              <li>Restrict or object to processing</li>
              <li>Export your data</li>
              <li>Withdraw consent where applicable</li>
            </ul>
            <p className="text-muted-foreground">To exercise your rights, contact us using the details below.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">8. Third-Party Links &amp; Services</h2>
            <p className="text-muted-foreground">
              Our Platform may contain links or integrations with third-party websites or services. Aireatro is not responsible for the privacy practices, content, or policies of third-party platforms.
            </p>
            <p className="text-muted-foreground">
              Users should review the privacy policies of any external services they interact with.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">9. International Data Transfers</h2>
            <p className="text-muted-foreground">
              Your information may be processed and stored in countries other than your own, including locations where our service providers maintain infrastructure.
            </p>
            <p className="text-muted-foreground">
              By using Aireatro, you consent to such international transfers where permitted by law.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">10. Children's Privacy</h2>
            <p className="text-muted-foreground">
              Aireatro is intended for business and professional use only and is not directed toward children under the age of 13 (or the minimum age required in your jurisdiction).
            </p>
            <p className="text-muted-foreground">
              We do not knowingly collect personal information from children.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">11. Changes to This Privacy Policy</h2>
            <p className="text-muted-foreground">
              We may update this Privacy Policy periodically to reflect changes in our services, legal requirements, or operational practices.
            </p>
            <p className="text-muted-foreground">When updates are made:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>The revised version will be posted on this page</li>
              <li>The "Last Updated" date will be changed accordingly</li>
            </ul>
            <p className="text-muted-foreground">
              Continued use of the Platform after updates constitutes acceptance of the revised policy.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">12. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have any questions, concerns, or requests regarding this Privacy Policy or your data, please contact us:
            </p>
            <p className="text-muted-foreground">
              <strong>Aireatro</strong><br />
              Website: <a href="https://aireatro.com" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">https://aireatro.com</a><br />
              Email: <a href="mailto:support@aireatro.com" className="text-primary hover:underline">support@aireatro.com</a>
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">13. Consent</h2>
            <p className="text-muted-foreground">
              By accessing or using Aireatro, you confirm that you have read, understood, and agreed to this Privacy Policy.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
            {' · '}
            <Link to="/cookie-policy" className="text-primary hover:underline">Cookie Policy</Link>
            {' · '}
            <Link to="/" className="text-primary hover:underline">Home</Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
