import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const routeNames: Record<string, string> = {
  '': 'Home',
  'login': 'Sign In',
  'signup': 'Sign Up',
  'products': 'Products',
  'pricing': 'Pricing',
  'help': 'Help Center',
  'about': 'About Us',
  'contact': 'Contact',
  'blog': 'Blog',
  'careers': 'Careers',
  'integrations': 'Integrations',
  'security': 'Security',
  'privacy-policy': 'Privacy Policy',
  'terms': 'Terms of Service',
  'app-access-instructions': 'App Access',
  'guides': 'Guides',
  'webinars': 'Webinars',
  'api-docs': 'API Docs',
  'add-ons': 'Add-Ons',
  'cookie-policy': 'Cookie Policy',
  'refund-policy': 'Refund Policy',
  'acceptable-use': 'Acceptable Use',
  'compliance': 'Compliance',
  'features': 'Features',
  'case-studies': 'Case Studies',
  'partners': 'Partners',
  'documentation': 'Documentation',
  'whatsapp-business-api': 'WhatsApp Business API',
  'whatsapp-forms': 'WhatsApp Forms',
  'free-whatsapp-api-lifetime': 'Free WhatsApp API',
  'data-deletion': 'Data Deletion',
  'click-to-whatsapp': 'Click to WhatsApp',
  'why-whatsapp-marketing': 'Why WhatsApp Marketing',
  'inbox': 'Inbox',
  'contacts': 'Contacts',
  'templates': 'Templates',
  'campaigns': 'Campaigns',
  'automation': 'Automation',
  'analytics': 'Analytics',
  'team-roles': 'Team & Roles',
  'audit-logs': 'Audit Logs',
  'phone-numbers': 'Phone Numbers',
  'install': 'Install',
};

interface BreadcrumbProps {
  className?: string;
}

export default function Breadcrumb({ className = '' }: BreadcrumbProps) {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Don't show breadcrumb on home page
  if (pathnames.length === 0) {
    return null;
  }

  return (
    <nav className={`flex items-center gap-2 text-sm ${className}`} aria-label="Breadcrumb">
      <Link
        to="/"
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
      >
        <Home className="w-4 h-4" />
        <span className="hidden sm:inline">Home</span>
      </Link>

      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const displayName = routeNames[name] || name.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

        return (
          <React.Fragment key={name}>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            {isLast ? (
              <span className="text-foreground font-medium">{displayName}</span>
            ) : (
              <Link
                to={routeTo}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {displayName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
