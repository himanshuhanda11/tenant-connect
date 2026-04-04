
Goal: stop the preview from appearing briefly and then disappearing again.

Do I know what the issue is? Yes.

What I found:
- The preview is not mainly failing because of `vite.config.ts` now.
- The strongest signal is the runtime error:
  `Failed to fetch dynamically imported module: /src/components/home/WhyAireatroBento.tsx?...`
- The homepage currently lazy-loads many sections in `src/pages/Index.tsx`, including `WhyAireatroBento`.
- The app also lazy-loads many routes in `src/App.tsx`.
- Console logs show Vite connection drops/polling, which means the dev preview can temporarily lose module availability. When that happens, a `lazy(import(...))` request can fail and React keeps that failure cached, making the screen look blank or broken until reload.

Implementation plan:
1. Stabilize dynamic imports
- Create a shared `lazyWithRetry` helper for lazy imports.
- If a module fetch fails, retry automatically.
- If it still fails with a Vite/chunk/module fetch error, do one safe full-page reload.

2. Apply the fix where the issue is happening
- Replace plain `lazy(() => import(...))` in:
  - `src/pages/Index.tsx`
  - `src/App.tsx`
- This will harden both homepage sections and route-level page loading.

3. Reduce risk on the homepage
- Stop lazy-loading the most important/early homepage sections that are visible almost immediately on mobile.
- At minimum, make `WhyAireatroBento` eager again; optionally also keep `SocialProofBar` eager.
- This reduces the chance that the homepage collapses because of one transient module fetch failure.

4. Improve failure containment
- Upgrade `SectionErrorBoundary` in `src/pages/Index.tsx` so one failed section shows a local fallback with retry instead of making the page feel gone.
- Keep the rest of the homepage visible even if one section has trouble loading.

5. Add global recovery for Vite preload/import failures
- In `src/main.tsx`, add a handler for Vite preload/import errors so the app can recover cleanly after preview/HMR instability.

6. Clean noisy console issues
- Fix the ref warning around `AICapabilitiesSection` / dialog composition.
- This warning is probably not the main blank-screen cause, but removing it will make the real runtime problems easier to spot and avoid extra instability.

Technical details:
- Likely root cause:
  `React.lazy` + transient Vite preview/HMR disconnect + failed module URL fetch.
- Key files to update:
  - `src/pages/Index.tsx`
  - `src/App.tsx`
  - `src/main.tsx`
  - new helper file such as `src/lib/lazyWithRetry.ts`
  - possibly `src/components/home/AICapabilitiesSection.tsx`
- Why this should work:
  - retries handle brief preview/network instability
  - one-time reload handles stale module URLs after dev-server refresh
  - eager-loading a few homepage sections removes the most user-visible failure point
  - local error boundaries prevent one section failure from looking like total preview loss

Expected result after implementation:
- `/index` and `/` should stay visible instead of disappearing after a few seconds.
- Homepage sections should fail gracefully if a module temporarily cannot load.
- Route navigation should be more resilient during preview reconnects.
