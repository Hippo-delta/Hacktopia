# Mule Account Money-Trail Hunter — Editorial Case File Gateway

An internal authentication instrument designed with the aesthetic of an investigator's case dossier or a financial publication: warm paper tones, bold editorial serif typography, ink-black rules, tactile block shadows, and a winding money-trail vector.

---

## Visual Concept & Editorial Language

- **Warm Paper Canvas**: `#F4F1EA` paper background with faint tactile paper grain overlay, crisp white `#FFFFFF` dossier form card, dense `#141414` ink-black typography and hairline rules.
- **Single Vermilion Accent**: `#E8452C` vivid red-orange strictly applied to the primary button, 2px focus rings, the terminal trail target dot, and inline error text.
- **High-Contrast Editorial Typography**:
  - Display Headline: **Fraunces** (characterful optical serif with expressive italic).
  - User Interface: **Instrument Sans** (crisp geometric grotesk; no Inter used).
- **Physical Print Details**:
  - Hard 0–2px corners.
  - Flat offset block shadow (`4px 4px 0 #141414`) on the form card.
  - Tactile button press: `translate(2px, 2px)` on hover/press with collapsing 2px block shadow.
- **Single-Run Hand-Drawn Trail**: An organic SVG trail that winds across the left column, branches, rejoins, and terminates at a vermilion account marker, drawing itself once over 1.5 seconds on page load.

---

## How to Run

### Method 1: Direct Browser Launch
Open `index.html` directly in any modern browser:
```powershell
Start-Process index.html
```

### Method 2: Local HTTP Server
```powershell
npx serve .
# OR (if Python is installed):
python -m http.server 3000
```

---

## Customization Guide

### 1. Changing the Accent Color
Open `styles.css` and modify the vermilion token in the `:root` block:
```css
:root {
  /* Change the single accent color token */
  --vermilion: #E8452C;       /* Default: Vivid Vermilion */
  --vermilion-press: #D33A22; /* Tactile darkened hover state */
}
```

### 2. Changing the Headline and Copy
Open `index.html` and edit lines 43–50:
```html
<h1 class="editorial-headline">
  Every Transaction Leaves a <em>Trail.</em>
</h1>
<p class="editorial-subdeck">
  Trace layered transfers across accounts and surface the ones that don't belong.
</p>
```

### 3. Modifying the Winding Trail Graphic
The SVG trail is located inside the left editorial column in `index.html` (lines 53–88):
- Main Path: `<path class="trail-path-main" d="..." />` controls the winding trajectory and animated drawing.
- Diverging Branches: `<path class="trail-path-branch" d="..." />` controls the dashed ledger paths that split and rejoin.
- Target Destination: `<circle class="trail-circle-target" cx="520" cy="105" r="4.5" />` marks the terminal mule node in vermilion.

### 4. Connecting Your Production Authentication API
In `app.js`, update the submit handler inside line 90:
```javascript
// Replace mockAuthenticate with your actual backend API call:
const response = await fetch('/api/v1/auth/session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    email, 
    password, 
    keepSignedIn: document.getElementById('keep-signed-in').checked 
  })
});
```

---

## Built-In Interactive Test Behaviors

- **Configured Dummy Credentials**:
  - Work Email: `yit09@gmail.com`
  - Password: `123456`
- **Authorized Sign-In**: Entering `yit09@gmail.com` and `123456` triggers `"Checking..."` with the bottom progress line, followed by verified access.
- **Unauthorized / Invalid Sign-In**: Entering anything else triggers vermilion borders on the inputs and the exact notice: `"Those details don't match our records."`
- **Field Validation**: Blank fields show inline field errors (`"Enter your work email."`, `"Enter your password."`).
- **Tactile Button Press**: Hovering over the vermilion **Continue** button shifts it by 2px with the block shadow collapsing.
- **Show/Hide Password**: Click the `"Show"` text toggle to inspect the entered password.
- **Custom Square Checkbox**: Clicking "Keep me signed in" activates a vermilion geometric checkmark.
