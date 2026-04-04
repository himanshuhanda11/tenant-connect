import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Linkedin, Youtube, Instagram } from 'lucide-react';
import aireatroLogo from '@/assets/aireatro-logo.png';
import metaPartnerLogo from '@/assets/meta-business-partner.png';

export default function Footer() {
  const footerLinks = {
    product: [
      { name: 'Features', href: '/features' },
      { name: 'Unified Inbox', href: '/features/inbox' },
      { name: 'Contacts', href: '/features/contacts' },
      { name: 'Templates', href: '/features/templates' },
      { name: 'Campaigns', href: '/features/campaigns' },
      { name: 'Automation', href: '/features/automation' },
      { name: 'Analytics', href: '/features/analytics' },
      { name: 'Pricing', href: '/pricing' },
    ],
    integrations: [
      { name: 'All Integrations', href: '/integrations' },
      { name: 'Shopify', href: '/integrations#shopify' },
      { name: 'WooCommerce', href: '/integrations#woocommerce' },
      { name: 'Razorpay', href: '/integrations#razorpay' },
      { name: 'Zapier', href: '/integrations#zapier' },
      { name: 'HubSpot', href: '/integrations#hubspot' },
      { name: 'Webhooks API', href: '/integrations#webhooks' },
    ],
    resources: [
      { name: 'Help Center', href: '/help' },
      { name: 'Documentation', href: '/documentation' },
      { name: 'Blog', href: '/blog' },
      { name: 'Case Studies', href: '/case-studies' },
      { name: 'Template Library', href: '/template-library' },
      { name: 'Free WhatsApp API', href: '/free-whatsapp-api-lifetime' },
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Careers', href: '/careers' },
      { name: 'Partners', href: '/partners' },
      { name: 'Contact', href: '/contact' },
      { name: 'Security', href: '/security' },
      { name: 'Compliance', href: '/compliance' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy-policy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Data Deletion', href: '/data-deletion' },
      { name: 'Acceptable Use', href: '/acceptable-use' },
      { name: 'Cookie Policy', href: '/cookie-policy' },
      { name: 'Refund Policy', href: '/refund-policy' },
    ],
  };

  return (
    <footer className="bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src={aireatroLogo} alt="AiReatro" className="h-10 w-auto" />
            </Link>
            <p className="text-slate-400 mb-4 max-w-xs text-sm">
              The all-in-one WhatsApp Business API platform for modern businesses. Scale your customer conversations.
            </p>
            <p className="text-slate-400 mb-6 max-w-xs text-xs leading-relaxed">
              📍 R/O RZ-D-1/12 A, 2nd Floor, Jeewan Park, Pankha Road, Uttam Nagar, New Delhi 110059
            </p>
            <div className="flex items-center gap-3">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-primary transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-primary transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-primary transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-primary transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
            <div className="mt-6 px-4 py-3 rounded-xl bg-white inline-flex items-center gap-2 shadow-md">
              <img src={metaPartnerLogo} alt="Meta Business Partner" className="h-14 sm:h-16 w-auto" />
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-4 text-sm">Product</h4>
            <ul className="space-y-2.5">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-slate-400 hover:text-white transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Integrations */}
          <div>
            <h4 className="font-semibold mb-4 text-sm">Integrations</h4>
            <ul className="space-y-2.5">
              {footerLinks.integrations.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-slate-400 hover:text-white transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4 text-sm">Resources</h4>
            <ul className="space-y-2.5">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-slate-400 hover:text-white transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4 text-sm">Company</h4>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-slate-400 hover:text-white transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4 text-sm">Legal</h4>
            <ul className="space-y-2.5">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-slate-400 hover:text-white transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-400">
            © 2025 AiReatro.com. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-slate-400">
            <span>🇮🇳 Made in India</span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
