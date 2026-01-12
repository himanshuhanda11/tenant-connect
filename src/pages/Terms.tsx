import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <h1 className="text-4xl font-bold text-foreground mb-8">Terms of Service</h1>
        
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground">
            <strong>Last Updated:</strong> January 12, 2026
          </p>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing and using our WhatsApp Business Platform ("Platform"), you agree to be bound by these 
              Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Platform.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">2. Description of Service</h2>
            <p className="text-muted-foreground">
              Our Platform provides tools for businesses to manage WhatsApp Business communications, including:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>WhatsApp Business API integration and management</li>
              <li>Multi-user inbox for team collaboration</li>
              <li>Message templates and campaign management</li>
              <li>Contact management and organization</li>
              <li>Automation and workflow tools</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">3. User Accounts</h2>
            <p className="text-muted-foreground">
              You are responsible for maintaining the confidentiality of your account credentials and for all 
              activities that occur under your account. You must notify us immediately of any unauthorized use 
              of your account.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">4. Acceptable Use</h2>
            <p className="text-muted-foreground">You agree not to use our Platform to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Send spam, unsolicited messages, or violate anti-spam laws</li>
              <li>Harass, abuse, or harm any person or entity</li>
              <li>Violate WhatsApp's Terms of Service or Business Policy</li>
              <li>Transmit any malicious code or interfere with the Platform's operation</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">5. Third-Party Services</h2>
            <p className="text-muted-foreground">
              Our Platform utilizes Meta's WhatsApp Business API. Your use of the Platform is also subject to 
              Meta's terms and policies. We are not responsible for the practices or policies of Meta or any 
              third-party services.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">6. Intellectual Property</h2>
            <p className="text-muted-foreground">
              The Platform and its original content, features, and functionality are owned by us and are protected 
              by international copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">7. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, 
              consequential, or punitive damages resulting from your use of the Platform or any related services.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">8. Termination</h2>
            <p className="text-muted-foreground">
              We may terminate or suspend your account and access to the Platform at any time, without prior notice, 
              for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">9. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We reserve the right to modify these Terms at any time. We will notify you of any material changes 
              by posting the new Terms on this page and updating the "Last Updated" date.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">10. Contact</h2>
            <p className="text-muted-foreground">
              For any questions regarding these Terms, please visit our website at:
            </p>
            <p className="text-muted-foreground">
              <strong>Website:</strong> <a href="https://smeksh.com" className="text-primary hover:underline">https://smeksh.com</a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            <Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>
            {' · '}
            <Link to="/" className="text-primary hover:underline">Home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
