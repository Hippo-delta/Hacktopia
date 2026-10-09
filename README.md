# Mule Account Money-Trail Hunter — Full Prototype & Authentication Gateway

A graph-based fraud and mule account investigation platform built for financial intelligence units, combining an editorial case-dossier authentication gateway with deep transaction tracing, network graph analysis, and account freeze simulation tools.

---

## Architecture & Integration Overview

The repository unites two core layers:
1. **Editorial Case-File Gateway (`LoginPage.jsx` / `login.html`)**:
   - Headline: *"Every Transaction Leaves a Trail."*
   - Editorial warm paper theme (`#F4F1EA`), ink-black typography (`#141414`), and single vermilion accent (`#E8452C`).
   - Hand-drawn SVG trail with single-draw animation.
   - Enforced dummy credentials: `yit09@gmail.com` / `123456`.
2. **Investigation Software Suite (`src/App.jsx`)**:
   - **Interactive Network Graph**: Visual multi-hop fund flow analysis.
   - **Transaction Trace & Waterfall**: Ingress-to-cashout layering decomposition.
   - **Account Investigation Drawer**: Risk telemetry, velocity indicators, and counterparties.
   - **Interim Freeze Simulator**: Immediate freeze assessment and scenario impact.
   - **Case Management & Evidence Attachment**: Dossier construction with tamper-evident audit logging.
   - **Profile & Session Controls**: Direct Sign Out and session termination.

---

## Dummy Credentials

| Field | Required Value |
|---|---|
| **Work email** | `yit09@gmail.com` |
| **Password** | `123456` |

*Entering any other combination displays the inline notice: `"Those details don't match our records."`*

---

## How to Run

### Method 1: React / Vite Application (Full Software Suite)
When running with Node.js and Vite:
```powershell
npm install
npm run dev
```
1. Open the local Vite URL (e.g., `http://localhost:5173/`).
2. The initial view presents the **Editorial Case-File Login Gateway**.
3. Sign in using `yit09@gmail.com` and `123456`.
4. The complete investigation platform (Dashboard, Network Analysis, Transaction Tracing, Alerts, Cases) immediately unlocks.
5. Click the **LogOut icon** in the top navigation or within the **Analyst Profile Modal** to lock the session and return to the login gateway.

### Method 2: Standalone Browser Gateway
To preview the login instrument directly without running a dev server:
```powershell
Start-Process login.html
```
Upon entering `yit09@gmail.com` and `123456`, credentials are saved to `localStorage` and forward to `index.html`.

---

## Project Structure (`C:\hackathon\Hacktopia`)

```text
├── index.html                   # Vite entry point for React application
├── login.html                   # Standalone HTML editorial login gateway
├── styles.css                   # Editorial design system tokens & styles
├── app.js                       # Standalone authentication controller & mock handler
├── package.json                 # React 18, Vite 5, Tailwind CSS, Lucide icons
├── vite.config.js               # Vite bundler configuration
├── tailwind.config.js           # Tailwind theme configuration
└── src/
    ├── main.jsx                 # React root renderer
    ├── App.jsx                  # Main application orchestrator with auth guard
    ├── index.css                # Dark-mode analyst workstation stylesheet
    ├── pages/
    │   ├── LoginPage.jsx        # Editorial case-file login gateway component
    │   ├── DashboardPage.jsx    # Investigation overview & KPI cockpit
    │   ├── TraceTransactionPage.jsx # Multi-hop money-trail trace
    │   ├── AccountInvestigationPage.jsx # Deep-dive forensic account view
    │   ├── NetworkAnalysisPage.jsx  # Interactive force-directed graph
    │   ├── RiskAlertsPage.jsx   # Rule-based fraud alerts
    │   ├── CaseManagementPage.jsx # Case dossier and evidence locker
    │   ├── TransactionExplorerPage.jsx # Ledger search and filtering
    │   ├── ReportsPage.jsx      # Exportable regulatory reporting
    │   ├── DataManagementPage.jsx # Data ingress & scenario injection
    │   └── SettingsPage.jsx     # Thresholds and risk scoring rules
    ├── components/              # Drawers, Modals, TopBar, Sidebar, Graphs
    ├── services/                # Mock investigation API & reactive data store
    ├── data/                    # High-density synthetic banking datasets
    └── utils/                   # Money trail algorithms, risk scoring, formatters
```
