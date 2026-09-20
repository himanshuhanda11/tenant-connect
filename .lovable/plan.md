# Meta Ads Automations — Live Campaign Clarity

## Goal
Make `/meta-ads/automations` show current Meta campaign status clearly, refresh without manual reloads, and make campaign selection understandable by showing the ad name first.

## What will change
- Add a compact live summary at the top: active ads, paused/off ads, active automations, and last Meta sync time.
- Add a clear “Live campaigns” strip above the automation list, with each ad’s name, parent campaign, current status, and key lead/click figures.
- Improve the create/edit selector so active ads appear first and each row shows **ad name → campaign name**, status, and useful context instead of campaign name alone.
- Add search and status filtering when many ads are available.
- Add automatic updates for campaign and automation records, plus periodic refresh and refresh-on-window-focus fallbacks.
- Keep the existing automation creation, assignment, template, tag, workflow, pause, edit, and delete behavior unchanged.

## Technical details
- Extend the existing Meta account hook with timed refresh, focus refresh, and scoped live subscriptions that are cleaned up when the page closes.
- Subscribe the automation page to workspace automation changes and refetch the list when records change.
- Derive all totals and statuses from stored Meta records; do not add sample values.
- Use the existing light/dark theme tokens and shared controls, with a dense mobile-first layout.
- Verify the page at desktop and mobile widths, including long ad names and mixed active/paused states.
