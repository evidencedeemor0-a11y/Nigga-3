PLUM UPDATED — CLIENT DEMO BUILD
=================================

WHAT THIS IS
------------
A front-end-only, fully clickable prototype of a "Plum Updated" banking
app, built to match a supplied UI reference (Home, Send Money, Review,
Pending, Success screens). It uses ONLY fictional/local demo data — no
real bank, no real accounts, no network calls, no real money movement.
All figures, names and account numbers are placeholders for a client
presentation.

FILES
-----
index.html      All screens/markup for the single-page app (mobile phone frame).
style.css       Full visual design: blue/white theme, cards, animations, layout.
script.js       App logic: navigation, form validation, transfer flow,
                localStorage persistence, transaction history.
manifest.json   Basic web app manifest (installable "PWA" feel).
README.txt      This file.

HOW TO RUN
----------
Option A — Just open it:
  Double-click index.html to open in any modern browser (Chrome, Safari,
  Edge, Firefox). Everything works locally, no server or build step needed.

Option B — Local server (recommended for the most accurate mobile feel):
  1. Open a terminal in this folder.
  2. Run:  python3 -m http.server 8000
  3. Visit http://localhost:8000 in your browser.

DEPLOY TO GITHUB PAGES
-----------------------
1. Create a new GitHub repository (e.g. "plum-updated-demo").
2. Add these five files to the repo root (or a /docs folder).
3. Push to GitHub.
4. In the repo: Settings → Pages → Source → select the branch/folder
   containing index.html → Save.
5. GitHub will publish the site at:
   https://<your-username>.github.io/<repo-name>/
6. No build tools, servers, or environment variables are required —
   this is a static HTML/CSS/JS site.

THE USER FLOW
--------------
Home → tap "Transfer" / "Pay anyone" / "Move Money" tab
  → Send Money (enter recipient name, bank, account number, amount)
  → Review Transfer (confirm details)
  → Pending (smooth animated loading state, ~10 seconds, no visible
    countdown — bar and status hints animate to feel like a live transfer)
  → Success (animated checkmark + full receipt)
  → Done → returns to Home with updated Spending balance and a new
    entry in Activity/transaction history.

FEATURES INCLUDED
------------------
- Pixel-close recreation of the reference screens: blue header with
  horizontal split behind white account cards, rounded cards, chevrons,
  APY pills, quick actions, bottom navigation.
- Fully functional multi-step transfer flow with real client-side
  validation (empty fields, invalid account number, zero/negative
  amount, insufficient funds against the current Spending balance).
- Pending screen animates for exactly 10 seconds (progress bar + status
  line) with no numeric countdown shown to the user, then automatically
  advances to the Success screen.
- Success screen has an animated checkmark draw-in and a receipt-style
  summary (name, bank, account, amount, fee, total, date/time,
  transaction ID).
- Every completed transfer:
    • Deducts the amount from the Spending balance immediately
      (shown as "pending" in Activity), then flips to "completed"
      once the pending animation finishes.
    • Is saved to localStorage so balances and history persist across
      page reloads.
- Activity tab with All / Completed / Pending filters.
- Tapping either account card opens an account detail page with its
  own balance and transaction list.
- Savings page and Profile page (with demo user info).
- "Reset demo data" option (on Home and Profile) that restores the
  original starting balances and clears all transactions — useful for
  repeating the demo for multiple stakeholders.
- Toasts for quick feedback (e.g. notifications, insufficient funds).
- Mobile-first layout inside a phone frame, responsive down to a real
  mobile viewport, subtle motion throughout (card rise-ins, button
  presses, sheet slide-up, spinner, checkmark draw, progress bar).

CUSTOMIZING DEMO DATA
-----------------------
Open script.js and edit the `defaultState()` function near the top:
  - user.name / user.fullName / user.email — the signed-in demo user.
  - balances.spending / balances.savings — starting balances.
  - transactions — the starting transaction history shown in Activity.

Because everything is stored in localStorage under the key
"plumUpdated.state.v1", you can also just use "Reset demo data" in the
app itself, or clear that key from your browser's dev tools, to start
fresh without editing code.

NOTES FOR THE CLIENT PRESENTATION
------------------------------------
- This is a design/UX prototype, not a production banking system: there
  is no backend, no authentication, and no real money movement of any
  kind. All transfers only affect the local demo data in the browser.
- "Plum Updated" and all account/bank names shown are fictional and used
  solely to illustrate the experience.
