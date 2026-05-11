# Domain Redirect & Cache E2E Test Checklist

**Primary domain:** `https://aireatro.com` (non-www)
**Redirects from:** `http://aireatro.com`, `http://www.aireatro.com`, `https://www.aireatro.com`
**Expected behavior:** every non-primary URL returns **HTTP 301** to the canonical `https://aireatro.com/<path>` and the served HTML matches the latest deployed build.

---

## 1. Pre-flight (one-time per deploy)

- [ ] Latest build is live on Netlify (Deploys tab → "Published")
- [ ] Netlify → Domain settings: `aireatro.com` is marked **Primary**, `www.aireatro.com` is listed as alias
- [ ] SSL certificate is **Active** for both `aireatro.com` and `www.aireatro.com`
- [ ] `public/_redirects`, `netlify.toml`, and `vercel.json` all redirect **www → non-www** (verified in repo)

---

## 2. HTTP-level 301 verification (terminal)

Run each command and confirm the listed result. Use `-I` (HEAD) and `-L` is intentionally **omitted** so we see the raw 301.

```bash
# A. http://aireatro.com  →  https://aireatro.com
curl -sSI http://aireatro.com/ | head -n 5
# Expect: HTTP/1.1 301  +  Location: https://aireatro.com/

# B. http://www.aireatro.com  →  https://aireatro.com
curl -sSI http://www.aireatro.com/ | head -n 5
# Expect: HTTP/1.1 301  +  Location: https://aireatro.com/

# C. https://www.aireatro.com  →  https://aireatro.com
curl -sSI https://www.aireatro.com/ | head -n 5
# Expect: HTTP/2 301  +  location: https://aireatro.com/

# D. https://aireatro.com  →  200 (canonical, no redirect)
curl -sSI https://aireatro.com/ | head -n 5
# Expect: HTTP/2 200

# E. Deep path preserved on www → non-www
curl -sSI https://www.aireatro.com/pricing | head -n 5
# Expect: 301 + location: https://aireatro.com/pricing

# F. Query string preserved
curl -sSI "https://www.aireatro.com/blog?utm_source=test" | head -n 5
# Expect: 301 + location: https://aireatro.com/blog?utm_source=test
```

Checklist:
- [ ] A returns `301` with `Location: https://aireatro.com/`
- [ ] B returns `301` with `Location: https://aireatro.com/`
- [ ] C returns `301` with `Location: https://aireatro.com/`
- [ ] D returns `200` (no redirect chain)
- [ ] E preserves the path
- [ ] F preserves the query string
- [ ] Redirect chain is **single-hop** (run `curl -sSIL ... | grep -E 'HTTP|location'` — should show exactly one 301 then one 200)

---

## 3. Cache & header verification

```bash
curl -sSI https://aireatro.com/ | grep -iE 'cache-control|etag|x-nf-request-id'
curl -sSI https://aireatro.com/index.html | grep -iE 'cache-control'
curl -sSI https://aireatro.com/version.json | grep -iE 'cache-control|content-type'
curl -sS  https://aireatro.com/version.json
```

- [ ] `/` and `/index.html` return `cache-control: public, max-age=0, must-revalidate` (no stale HTML)
- [ ] `/version.json` returns `cache-control: no-cache, no-store, must-revalidate`
- [ ] `/version.json` body is valid JSON and matches the current deploy's build hash
- [ ] `/assets/*.js` and `/assets/*.css` return `cache-control: public, max-age=31536000, immutable`
- [ ] `x-nf-request-id` header is present (confirms Netlify edge served the response)

---

## 4. Build-parity check (no mismatched content)

Compare the HTML shell served from each hostname — they must be byte-identical after redirect resolution.

```bash
curl -sSL https://aireatro.com/        | shasum -a 256
curl -sSL https://www.aireatro.com/    | shasum -a 256
curl -sSL http://aireatro.com/         | shasum -a 256
curl -sSL http://www.aireatro.com/     | shasum -a 256
```

- [ ] All four SHA-256 hashes are **identical**
- [ ] `<link rel="canonical" href="https://aireatro.com/">` appears in the HTML
- [ ] `<meta property="og:url" content="https://aireatro.com/">` appears in the HTML
- [ ] `sitemap.xml` and `robots.txt` reference `https://aireatro.com` only (no `www.`)

```bash
curl -sS https://aireatro.com/sitemap.xml | grep -c 'www.aireatro.com'   # expect 0
curl -sS https://aireatro.com/robots.txt  | grep -c 'www.aireatro.com'   # expect 0
```

---

## 5. Browser verification (manual, incognito)

Repeat in **Chrome incognito**, **Safari private**, and **Firefox private**:

- [ ] Visit `http://aireatro.com` → address bar settles on `https://aireatro.com/`
- [ ] Visit `http://www.aireatro.com` → settles on `https://aireatro.com/`
- [ ] Visit `https://www.aireatro.com` → settles on `https://aireatro.com/`
- [ ] DevTools → Network → first document request shows **status 301** then **200**
- [ ] DevTools → Application → Service Workers: **none registered** (self-destructing SW removed it)
- [ ] DevTools → Application → Cache Storage: **empty**
- [ ] No console errors related to mixed hostnames or CORS

---

## 6. Cross-network / cross-device

Test from at least two distinct networks (home Wi-Fi + mobile 4G/5G) and two devices (desktop + phone):

- [ ] Desktop, network A → all four URLs land on `https://aireatro.com`
- [ ] Desktop, network B → same
- [ ] Mobile Safari (iOS) → same
- [ ] Mobile Chrome (Android) → same
- [ ] Page content (hero headline, pricing, footer) is identical across all devices

---

## 7. SEO / crawler view

- [ ] Google Search Console → URL Inspection on `https://www.aireatro.com/` reports **"Page with redirect"** → `https://aireatro.com/`
- [ ] `https://aireatro.com/` is reported as **Indexed, canonical**
- [ ] `site:www.aireatro.com` in Google returns 0 results after recrawl (within ~2 weeks)
- [ ] Facebook Sharing Debugger on `https://www.aireatro.com/` resolves to canonical `https://aireatro.com/` with correct OG image

---

## 8. Regression triggers (re-run this checklist when…)

- Any change to `netlify.toml`, `public/_redirects`, `vercel.json`, `index.html`, `src/main.tsx`, or `public/sw.js`
- After adding a new domain alias in Netlify
- After rotating SSL certificates
- After any DNS change at the registrar

---

## Quick one-liner (CI-friendly)

```bash
for u in http://aireatro.com http://www.aireatro.com https://www.aireatro.com; do
  code=$(curl -s -o /dev/null -w "%{http_code}" -I "$u/")
  loc=$(curl -sI "$u/" | awk -F': ' 'tolower($1)=="location"{print $2}' | tr -d '\r')
  echo "$u → $code → $loc"
done
curl -s -o /dev/null -w "https://aireatro.com → %{http_code}\n" -I https://aireatro.com/
```

Expected output:
```
http://aireatro.com       → 301 → https://aireatro.com/
http://www.aireatro.com   → 301 → https://aireatro.com/
https://www.aireatro.com  → 301 → https://aireatro.com/
https://aireatro.com      → 200
```
