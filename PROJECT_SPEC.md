# Project Specification

## Project Name
Mule Account Money-Trail Hunter — Internal Access Gateway

## Problem
Financial intelligence analysts need to track sophisticated illicit fund layering schemes across mule bank accounts. Internal tools require an interface that is distraction-free, austere, dense with forensic meaning, and respects the high-stakes security posture of the institution.

## Proposed Solution
A specialized, austere internal authentication portal that mimics a forensic ledger instrument. Uses an asymmetric 12-column grid featuring an analyst sign-in pane on the left and a live vector reconstruction of a traced money route on the right.

## Target Users
- Anti-Money Laundering (AML) investigators
- Financial Crimes & Fraud Analysts
- Bank Risk & Forensic Intelligence Specialists

## Core Features
- Forensic dark graphite palette (#101113 / #17191C) with a single signal-amber (#E0A526) accent.
- Orthogonal SVG money-trail visualization with 8 account nodes, timestamps, and 1.2s single-draw animation.
- Restrained, accessible interactions (plain-language inline errors, 2px focus ring, text-based password visibility toggle, non-glowing flat amber action button with progress indicator).
- WCAG AA contrast compliance and `prefers-reduced-motion` support.

## Technology Stack
- **Frontend:** Semantic HTML5, CSS3 Custom Properties (Design Tokens), Vanilla JS
- **Typography:** IBM Plex Sans & IBM Plex Mono via Google Fonts
- **Visuals:** Pure inline SVG with orthogonal bezier/line paths
- **Backend Auth:** Clearly marked integration points in `app.js` for IdP / SAML 2.0 / OAuth2 endpoints.
