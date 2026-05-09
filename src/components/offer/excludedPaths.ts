// Paths where the launch offer UI (banner, widget, popup) should NOT appear.
export function isOfferExcludedPath(pathname: string): boolean {
  return (
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/onboarding') ||
    pathname.startsWith('/invite') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/control') ||
    pathname.startsWith('/select-workspace') ||
    pathname.startsWith('/create-workspace') ||
    pathname.startsWith('/workspaces')
  );
}

// Pricing-style pages where the sticky banner is hidden (plans are already focal),
// but the popup/widget may still trigger elsewhere.
export function isPricingPath(pathname: string): boolean {
  return (
    pathname.startsWith('/pricing') ||
    pathname.startsWith('/select-plan') ||
    pathname.startsWith('/choose-plan') ||
    pathname.startsWith('/plans') ||
    pathname.startsWith('/billing')
  );
}
