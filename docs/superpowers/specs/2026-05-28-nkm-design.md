# NK-M Design Spec

**Date:** 2026-05-28
**Branch:** `v8-nkm` (from `v7-nkos`)
**Route:** `/nkm`
**Reference:** `/home/lap-68/Downloads/plasma-mobile.html` — Plasma Mobile (1376 lines)

---

## What This Is

A Plasma Mobile-inspired portfolio experience at `/nkm`. Mobile and tablet ONLY (≤1024px). Visitors boot a phone OS, swipe through a lock screen showing portfolio highlights, reach a home screen with 6 portfolio apps, and interact with the full content through native-feeling mobile UI. Gold `#f5c518` replaces KDE blue throughout.

---

## Architecture & Isolation

### Route
```
src/app/nkm/
  layout.tsx    ← Oxanium + Noto fonts, imports nkm.css
  page.tsx      ← mounts <NKMDesktop />
  nkm.css       ← all mobile OS styles (isolated)
```

### Component tree
```
src/components/nkm/
  types.ts           ← AppId, Screen, NKMState, nkmReducer, APP_DEFS
  NKMDesktop.tsx     ← root, useReducer, all screen routing
  NKMBoot.tsx        ← progress bar boot (3.6s, tap to skip)
  NKMLock.tsx        ← clock, portfolio notifs, swipe-up to unlock
  NKMStatusBar.tsx   ← fixed top: time + signal + battery
  NKMHome.tsx        ← icon grid (4-col), page dots, dock
  NKMAppDrawer.tsx   ← swipe-up drawer with search
  NKMNotifPanel.tsx  ← pull-down: quick tiles + sliders
  NKMPowerMenu.tsx   ← bottom sheet power options
  NKMApp.tsx         ← full-screen app shell (topbar + body + slide animation)
  apps/
    TerminalApp.tsx  ← portfolio commands + Deax AI + quick-key toolbar
    AboutApp.tsx     ← bio, stats row, heatmap (mobile layout)
    ProjectsApp.tsx  ← card list + slide-in detail panel
    SkillsApp.tsx    ← accordion list (expand on tap)
    ContactApp.tsx   ← email copy, social links, availability
    DeaxApp.tsx      ← ChatPanel (shared thread_id)
```

### Isolation
- `nkm/layout.tsx` wraps content in `<div className="nkm-shell">` — not a second `<html>`
- `nkm.css` imported there — isolated from `globals.css`
- Root layout providers (VoiceTourProvider, ChatProvider) wrap `/nkm` harmlessly — widgets only render when triggered
- `DeaxButton` already hides on pathnames `/nkos` — extend to also hide on `/nkm`
- Cursor: globals.css sets `cursor: none !important` — override via `.nkm-root * { cursor: default !important }`
- Touch: `touch-action: none; user-select: none` on `.nkm-root`

---

## Theme

### CSS tokens
```css
.nkm-root {
  --acc:       #f5c518;          /* gold — was #3daee9 blue */
  --acc2:      #ffd84d;          /* light gold */
  --acc-glow:  rgba(245,197,24,0.28);
  --bg:        #0a0d18;
  --bg2:       #111524;
  --bg3:       #161b2e;
  --panel:     rgba(14,18,32,0.92);
  --panel2:    rgba(20,26,44,0.96);
  --text:      #eff0f1;
  --text2:     #8a9ab5;
  --text3:     #4a5a75;
  --danger:    #da4453;
  --warn:      #f67400;
  --ok:        #27ae60;
  --r:         16px;
  --r2:        12px;
  --r3:        8px;
  --status-h:  28px;
  --dock-h:    80px;
  --font:      var(--nkm-font, 'Noto Sans', sans-serif);
  --oxan:      var(--nkm-oxan, 'Oxanium', sans-serif);
  --mono:      var(--nkm-mono, 'Noto Sans Mono', monospace);
}
```

### Fonts
Loaded in `nkm/layout.tsx` via `next/font/google`:
- `Oxanium` (weights 300/400/500/600) → `--nkm-oxan`
- `Noto_Sans` (weights 300/400/500) → `--nkm-font`
- `Noto_Sans_Mono` (weights 400/500) → `--nkm-mono`

### Boot
- Label: "NK-M" (Oxanium, letter-spacing 10px)
- Subtitle: "Mobile · v1.0.0"
- Gold aura pulse on Plasma SVG logo
- Progress bar animation: 3.6s, gold gradient fill

### Wallpaper
Canvas animation — same as NK-OS/NKM reference: gradient bg + nebula blobs + twinkling stars + mountain silhouette. 3 gold-tinted variants. Cycle via Settings app.

---

## Screen Flow

```
boot (3.6s)
  → lock (clock + portfolio notifs)
    → home (icon grid + dock)
      ↕ (swipe up / tap ⠿)
    app-drawer
      ↕ (tap app)
    app (full-screen, slide up)
      ↓ (back / home bar)
    home
```

### Boot
- 3.6s progress bar animation
- Tap anywhere → skip to lock screen immediately

### Lock Screen
- Canvas wallpaper behind
- Top: large Oxanium clock + date
- Middle: 2 portfolio notification cards:
  - `📌  Available for work · Gurugram, India`
  - `⚡  7 products shipped · 3 cloud platforms`
- Bottom: "↑ Swipe up to unlock" pulsing text + animated arrow
- Unlock: touch swipe up (delta Y > 60px) OR click/tap anywhere

### Status Bar
- `position: fixed; top: 0; z-index: 500`
- Left: time · Right: signal + battery
- Tap or swipe down → notification panel slides in
- Background: gradient on home/lock, solid on panel-open

### Notification Panel
- Slides down from top (`translateY(-100%)` → `0`)
- 8 quick tiles (Wi-Fi, BT, DND, Rotate, Location, Torch, Airplane, Dark) — toggle on/off state
- Brightness + volume range sliders (cosmetic)
- Portfolio notification cards
- Tap outside → closes

### Home Screen
- 4-column icon grid, 2 pages
  - Page 1: 6 portfolio apps (Terminal, About, Projects, Skills, Contact, Deax)
  - Page 2: empty (future)
- Page indicator dots
- Swipe left/right between pages (touch events, dx > 60px)
- Swipe up anywhere → app drawer
- Tap icon → open app

### Dock
4 items in a blurred pill at bottom:
1. Terminal 🖥️
2. Projects 📁
3. About 👤
4. ⠿ (app drawer toggle)

### App Drawer
- Slides up from bottom (`translateY(100%)` → `0`)
- Handle bar at top
- Search input (filters app names)
- Grid of all 6 apps
- Swipe down on drawer → closes

### App Shell
- Full-screen, `position: absolute; inset: 0`
- Entry: `translateY(100%)` → `translateY(0)` (0.28s cubic-bezier)
- Exit: `translateY(100%)` (slide back down)
- Topbar: back `‹` button + app icon + title
- Back button → close app, return to home

### Home Bar
- Fixed bottom pill `▬`
- Single tap → go home (close active app if open)
- Triple tap → power menu

### Power Menu
- Bottom sheet, slides up
- Options: Shut Down · Restart · Lock
- Tap outside → closes

---

## OS State

```ts
type AppId = 'terminal' | 'about' | 'projects' | 'skills' | 'contact' | 'deax'
type Screen = 'boot' | 'lock' | 'home' | 'shutdown' | 'poweroff'

interface NKMState {
  screen: Screen
  activeApp: AppId | null    // currently open full-screen app
  drawerOpen: boolean
  notifPanelOpen: boolean
  powerMenuOpen: boolean
  wallpaperIdx: number
}
// Note: Projects list→detail navigation is local state inside ProjectsApp,
// not OS-level state. OS reducer only tracks which app is open.

```

Single `useReducer` in `NKMDesktop`. No windows concept — apps are a full-screen stack.

---

## App Content

### Terminal (`TerminalApp.tsx`)
- Quick-key toolbar above input: `↑` `↓` `/` `-` `.` `~` `|` `Clear` `^C`
- Portfolio commands: `about`, `skills`, `projects`, `contact`, `help`, `neofetch`, `clear`, `date`, `whoami`
- Unknown command → Deax AI inline streaming via `ChatContext.ensureSession` + `chatApi.streamMessage`
- Response: left gold border block + thinking cursor (same as NK-OS terminal pattern)
- `neofetch`: NK-M branding, screen dimensions, uptime

### About (`AboutApp.tsx`)
- Single-scroll layout
- Avatar emoji + name + role + location
- Bio paragraph
- Stats row: 3+ years · 7 products · 60% boost · 3 clouds (horizontal scroll on narrow screens)
- GitHub heatmap (52×7, smaller cells for mobile: 7×7px)

### Projects (`ProjectsApp.tsx`)
- Scrollable card list: icon + name + year + first tag chip
- Tap card → detail panel slides in from right (within app body)
- Detail: full description, tags, impact stats, link button
- Back button in detail → returns to list (does NOT close app)

### Skills (`SkillsApp.tsx`)
- Vertical accordion list
- Each row: icon + name + proficiency bar + pct
- Tap → expands to show tags + description (smooth height animation)
- Tap again → collapses
- No sidebar — accordion fits mobile perfectly

### Contact (`ContactApp.tsx`)
- "Have a project in mind?" heading
- Email → tap to copy (green flash on copy)
- GitHub · LinkedIn · Resume as large tap-target rows with arrow `›`
- Availability badge: green dot + "Open to Remote · On-site · Hybrid"

### Deax (`DeaxApp.tsx`)
- Mounts `<ChatPanel />` directly
- Shares same `ChatContext` thread_id as floating widget + NK-OS terminal
- All three entry points share conversation history
- No extra header (app topbar already shows "🤖 Deax")

---

## Desktop Blocker (>1024px)

```
📱
───
NK-M
This experience is designed for smartphones and tablets.

Open on your phone · or resize to mobile viewport
Screen too wide (> 1024px)

[→ Try NK-OS on desktop]   [← Back to portfolio]
```

Links: `/nkos` and `/` (portfolio root).

---

## DeaxButton Update

Extend existing pathname check to also hide on `/nkm`:
```ts
if (pathname === '/nkos' || pathname === '/nkm') return null
```

Also add "NK-M 📱" entry to DeaxButton menu (both modes), same pattern as "NK-OS 🖥️".

---

## No Tests

NK-M is pure touch/mobile UI. Verified manually by opening `localhost:3000/nkm` with browser DevTools mobile viewport (e.g. iPhone 14 Pro, 390×844). No unit tests.

---

## How to Access

```
npm run dev
# Visit: http://localhost:3000/nkm
# Use browser DevTools → mobile emulation (≤1024px)
```
