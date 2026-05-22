#!/usr/bin/env node
/**
 * DNS readiness check for mail.aireatro.com on Lovable hosting.
 *
 * Usage:
 *   node scripts/check-mail-domain.mjs
 *   node scripts/check-mail-domain.mjs sub.example.com
 *
 * Validates:
 *   1. A record for the host points to Lovable edge (185.158.133.1)
 *      OR a CNAME exists (proxied / Cloudflare mode)
 *   2. TXT _lovable.<host> verification record exists
 *   3. HTTPS endpoint responds 200 and is NOT redirecting to the apex
 *
 * Exits 0 = ready, 1 = not ready.
 */
import { promises as dns } from "node:dns";

const HOST = process.argv[2] || "mail.aireatro.com";
const LOVABLE_IP = "185.158.133.1";
const APEX = HOST.split(".").slice(-2).join("."); // e.g. aireatro.com

const ok = (m) => console.log(`  \x1b[32m✓\x1b[0m ${m}`);
const bad = (m) => console.log(`  \x1b[31m✗\x1b[0m ${m}`);
const info = (m) => console.log(`  \x1b[36mi\x1b[0m ${m}`);

let failures = 0;

console.log(`\nDNS readiness check for \x1b[1m${HOST}\x1b[0m\n`);

// 1. A or CNAME
console.log("1. Edge routing record (A or CNAME)");
let hasA = false, hasCname = false;
try {
  const a = await dns.resolve4(HOST);
  hasA = true;
  if (a.includes(LOVABLE_IP)) ok(`A record → ${a.join(", ")} (Lovable edge)`);
  else { bad(`A record → ${a.join(", ")} (expected ${LOVABLE_IP})`); failures++; }
} catch {
  try {
    const c = await dns.resolveCname(HOST);
    hasCname = true;
    ok(`CNAME → ${c.join(", ")} (proxy mode acceptable)`);
  } catch {
    bad(`No A or CNAME record found for ${HOST}`);
    info(`Add an A record: ${HOST.split(".")[0]} → ${LOVABLE_IP}`);
    failures++;
  }
}

// 2. TXT verification
console.log("\n2. Lovable verification TXT record");
try {
  const txt = await dns.resolveTxt(`_lovable.${HOST}`);
  const flat = txt.flat().join(" ");
  if (flat.includes("lovable_verify=")) ok(`_lovable.${HOST} → ${flat.slice(0, 60)}...`);
  else { bad(`_lovable.${HOST} exists but missing lovable_verify= token`); failures++; }
} catch {
  bad(`No TXT record at _lovable.${HOST}`);
  info(`Lovable shows the exact token in Project Settings → Domains after you click Connect Domain.`);
  failures++;
}

// 3. HTTPS response
console.log("\n3. HTTPS endpoint behavior");
try {
  const res = await fetch(`https://${HOST}/`, { redirect: "manual" });
  const loc = res.headers.get("location") || "";
  if (res.status >= 300 && res.status < 400 && loc.includes(`://${APEX}`)) {
    bad(`HTTPS returns ${res.status} → ${loc} (falling back to apex — not connected in Lovable yet)`);
    failures++;
  } else if (res.status === 200) {
    ok(`HTTPS 200 OK — serving app on ${HOST}`);
  } else {
    info(`HTTPS ${res.status}${loc ? ` → ${loc}` : ""}`);
  }
} catch (e) {
  bad(`HTTPS request failed: ${e.message}`);
  failures++;
}

console.log("");
if (failures === 0) {
  console.log("\x1b[32mReady.\x1b[0m mail.aireatro.com is fully connected.\n");
  process.exit(0);
} else {
  console.log(`\x1b[33mNot ready — ${failures} check(s) failed.\x1b[0m`);
  console.log(`Next step: Project Settings → Domains → Connect Domain → ${HOST}\n`);
  process.exit(1);
}
