# NK-OS Design Spec

**Date:** 2026-05-28
**Branch:** `v7-nkos` (from `v6-data`)
**Route:** `/nkos`
**Reference:** `/home/lap-68/Downloads/webde.html` — KDE Plasma web desktop (1387 lines)

---

## What This Is

A full desktop OS experience at `/nkos`. Visitors land on a boot screen, transition to a KDE Plasma-inspired desktop with a taskbar, draggable windows, and 6 portfolio apps. Gold `#f5c518` replaces KDE blue as the accent. Completely isolated from the existing portfolio — no CSS bleed, no shared providers in the UI.

---

## Architecture & Isolation

### Route
```
src/app/nkos/
  layout.tsx     ← isolated layout: imports nkos.css, Noto fonts, overflow:hidden on body
  page.tsx       ← mounts <NKOSDesktop />
```

### Component tree
```
src/components/nkos/
  NKOSDesktop.tsx        ← root, useReducer OS state, renders boot or desktop
  NKOSBoot.tsx           ← animated boot screen
  NKOSWallpaper.tsx      ← canvas animated wallpaper (requestAnimationFrame)
  NKOSTaskbar.tsx        ← bottom bar (launcher + app buttons + tray + clock)
  NKOSLauncher.tsx       ← 9-dot launcher popup (category sidebar + app grid)
  NKOSWindowManager.tsx  ← renders all open windows
  NKOSWindow.tsx         ← draggable, resizable, focusable window shell
  NKOSContextMenu.tsx    ← right-click desktop context menu
  apps/
    TerminalApp.tsx      ← nksh terminal with Deax AI inline
    AboutApp.tsx         ← profile, bio, stats, heatmap
    ProjectsApp.tsx      ← file-manager-style project explorer
    SkillsApp.tsx        ← mounts existing SkillsFinder component
    ContactApp.tsx       ← email copy, socials, availability
    DeaxApp.tsx          ← ChatPanel mounted in a window, uses ChatContext
```

### Isolation details
- `nkos.css` contains ALL OS styles — nothing imported from `globals.css`
- `globals.css` sets `cursor: none !important` globally. Fix: `.nkos-root *, .nkos-root *::before, .nkos-root *::after { cursor: default !important }` in `nkos.css`
- Root `layout.tsx` providers (VoiceTourProvider, ChatProvider) technically wrap `/nkos` — harmless since widgets only render when triggered. DeaxButton gets a pathname check and hides on `/nkos`.
- SkillsFinder and ChatPanel reused directly (no reimplementation). All other apps built fresh.

---

## Theme

### CSS tokens (`:root` in `nkos.css`)
```css
--accent: #f5c518;
--accent-h: #ffd84d;
--text: #eff0f1;
--text-dim: #8a9ab0;
--panel: rgba(14,11,0,0.94);
--panel-solid: #0e0b00;
--win-bg: #1a1500;
--win-title: #0e0b00;
--win-border: rgba(245,197,24,0.18);
--hover: rgba(245,197,24,0.10);
--active: rgba(245,197,24,0.18);
--close: #da4453;
--minimize: #f67400;
--maximize: #27ae60;
--taskbar-h: 46px;
--r: 8px;
--font: 'Noto Sans', sans-serif;
--mono: 'Noto Mono', monospace;
```

### Visual details
- **Wallpaper:** Canvas animation — gradient bg, gold nebula blobs, 200 twinkling stars, mountain silhouette. 4 colour variants (gold default, purple, teal, amber).
- **Window chrome:** macOS traffic lights (red/orange/green). Focused window: `box-shadow: 0 0 0 1px rgba(245,197,24,0.3)`.
- **Terminal colours:** Gold prompt `#f5c518`, blue paths `#79c0ff`, cyan commands `#a8d8ea`. Contrasts well against gold accent.
- **Fonts:** Noto Sans (UI) + Noto Mono (terminal/code). Loaded via `next/font/google` in `nkos/layout.tsx`.

### Boot screen
- Label: "NK-OS" · Subtitle: "Plasma · v1.0.0"
- Logo: Plasma SVG (orbital rings + core) with gold tint
- 5 pulsing gold dots animation
- 3.4s boot → desktop. Skippable on click.

---

## OS State

Single `useReducer` in `NKOSDesktop.tsx`:

```ts
type Screen = 'boot' | 'desktop'

type WindowState = {
  id: string
  appId: string
  title: string
  icon: string
  x: number; y: number
  w: number; h: number
  minimized: boolean
  maximized: boolean
  focused: boolean
  zIndex: number
}

type OSState = {
  screen: Screen
  windows: WindowState[]
  launcherOpen: boolean
  wallpaperIdx: number
  contextMenu: { x: number; y: number } | null
}
```

---

## Window Manager

### Default window sizes
| App | W | H |
|---|---|---|
| Terminal | 600 | 400 |
| About | 440 | 460 |
| Projects | 740 | 490 |
| Skills | 680 | 480 |
| Contact | 420 | 340 |
| Deax | 360 | 480 |

### Behaviours
- **Open:** Spawns centred with cascade offset `(n%8)*28px`. Single-instance: focus/restore if already open.
- **Drag:** `mousedown` on titlebar → `mousemove` on document. Clamped to viewport. Disabled when maximized.
- **Resize:** Bottom-right handle. Min 280×180.
- **Minimize:** CSS scale(0.85)+opacity(0) → `display:none`. Taskbar item dimmed.
- **Maximize:** CSS class swap. Stores pre-max dimensions for restore. Double-click titlebar toggles.
- **Close:** Scale(0.93)+opacity(0) → remove from state.
- **Focus:** z-index increment. Gold border glow on active window. Taskbar item highlighted.

---

## Taskbar

- 46px bottom, blurred panel `--panel` + 1px top border
- **Left:** 9-dot launcher button
- **Centre:** App buttons for open windows (icon + label, max 168px, active indicator dot)
- **Right:** System tray icons (volume/network) + clock (time + date)
- Clock ticks every 15s

---

## App Launcher

Opens above launcher button, bottom-left. Animated scale-up pop.

- Search input (filters by app name)
- Category sidebar: All · Portfolio · System
- 3-col app grid: icon + name
- Footer: Settings icon + Power button (triggers shutdown)

Apps by category:
```
Portfolio: About, Projects, Skills, Contact, Deax
System: Terminal
```

---

## Context Menu (right-click desktop)

```
🖥️ Open Terminal
📁 Open Projects
────
🖼️ Change Wallpaper
ℹ️  About NK-OS
────
⏻  Shut Down
```

---

## App Content

### Terminal (`TerminalApp.tsx`)
- `nksh 1.0.0` prompt
- Commands: `help`, `ls`, `cd`, `cat`, `clear`, `pwd`, `whoami`, `date`, `neofetch`, `history`
- Portfolio commands: `about`, `skills`, `projects`, `contact` — same coloured output as existing terminal
- `neofetch`: NK-OS branding, engineer role, uptime, resolution, colour blocks
- Unknown command → Deax AI inline streaming via `ChatContext.ensureSession` + `chatApi.streamMessage` (same pattern as existing Terminal.tsx). Response in left-border gold block.

### About (`AboutApp.tsx`)
- Glyph avatar, name "Nitish Kushwaha", role, location
- Bio: hardcoded (same as ResumeHero)
- Stats table: 3+ Years Experience · 7 Products Shipped · 60% Automation Boost · 3 Cloud Platforms
- GitHub heatmap: uses `src/lib/heatmap.ts` (52×7 grid)

### Projects (`ProjectsApp.tsx`)
- File-manager layout: category sidebar + main area
- Sidebar: All Projects · Voice & Realtime · AI Agents · Document AI
- Main: 5 project tiles (icon + name + year)
- Click → detail panel slides in: full description, tech tags, impact stats (visual.stats), link button

### Skills (`SkillsApp.tsx`)
- Mounts existing `src/components/skills/SkillsFinder.tsx` directly
- Pass `skills` data from `portfolio.json` as prop (same data shape as FullExperienceShell)
- SkillsFinder uses gold CSS vars from portfolio — consistent with NK-OS gold theme
- Force dark mode: wrap in a mock ThemeContext value with `isDark: true`

### Contact (`ContactApp.tsx`)
- "Have a project in mind?" heading
- Email with click-to-copy (green check flash on copy)
- GitHub, LinkedIn, Resume.pdf links
- Availability: green dot + "Open to Remote · On-site · Hybrid"

### Deax (`DeaxApp.tsx`)
- Mounts `src/components/chat/ChatPanel.tsx` directly (same as ChatWidgetInner)
- Header: `$ deax --chat` + session status indicator
- Uses existing `ChatContext` — same session as floating widget
- Full conversation history shared between window and floating widget

---

## Mobile Handling

On viewport `≤768px`: NK-OS does not render. Full-screen message:
```
🖥️
NK-OS is a desktop experience.
Visit on a screen wider than 768px.

← Back to portfolio
```
Link `/` returns to resume mode.

---

## DeaxButton on `/nkos`

`DeaxButton.tsx` reads `usePathname()`. Returns `null` when `pathname === '/nkos'`. The OS has its own Deax app — the portfolio button would clutter the taskbar.

---

## Shutdown Sequence

- Shutdown option (launcher or context menu): windows scale+fade out → "Shutting Down" spinner → "Power Off" screen with circular power button
- Power button → boot again (loops)
- Not connected to navigation — purely cosmetic within the OS experience

---

## No Tests

NK-OS is pure UI with no business logic. Correctness verified by running the dev server and interacting with the OS. No unit tests added.

---

## How to Access

```
npm run dev
# Visit: http://localhost:3000/nkos
```

Add to existing portfolio navigation when ready (e.g., DeaxButton menu item "NK-OS →").
