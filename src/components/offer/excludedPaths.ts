// Paths where the launch offer UI (banner, widget, popup) should NOT appear.
export function isOfferExcludedPath(pathname: string): boolean {
  // Allow only on public marketing pages.
  const marketingRoots = ['/', '/features', '/products', '/blog', '/about', '/why-aireatro'];
  const isMarketing =
    marketingRoots.includes(pathname) ||
    pathname.startsWith('/features/') ||
    pathname.startsWith('/blog/') ||
    pathname.startsWith('/products/');
  return !isMarketing;
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
