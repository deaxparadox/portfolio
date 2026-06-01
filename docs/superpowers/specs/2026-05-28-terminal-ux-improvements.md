# Terminal UX Improvements — Spec

**Date:** 2026-05-28
**Branch:** v5-chatbot
**File:** `src/components/hero/Terminal.tsx`

## Changes Made

### 1. Bold Command Echo

User-typed commands now render with `font-weight: 600`:
```tsx
addLine(gold('$ ') + `<span style="color:#a8d8ea;font-weight:600">${esc(cmd)}</span>`)
```
**Why:** Distinguishes user commands from response output visually.

### 2. Deax Response — Left Border Block

Unknown commands stream Deax's response with a gold left-border block and blank lines for breathing room:
```tsx
const deaxPrefix = `<span style="padding-left:12px;border-left:2px solid rgba(245,197,24,0.22)">deax › `
```
- Blank line before response
- Left gold border on the response block
- Blank line after response completes

**Why:** Without visual separation, command echo and Deax response blended together making output hard to read.

### 3. Thinking Indicator (t-caret)

While waiting for the first token from Deax, the streaming line shows a blinking cursor (`t-caret` CSS class — reuses the terminal's existing cursor):
```tsx
{ id: streamId, html: deaxPrefix + '<span class="t-caret"></span>' }
```
On first token arrival, the cursor is replaced by actual content:
```tsx
if (firstToken) {
  firstToken = false
  return { ...l, html: deaxPrefix + esc(content) }
}
```
**Why:** Without the indicator, the terminal appears frozen between Enter press and first token. Users had no feedback that anything was happening.

### 4. No Double Echo

The unknown command handler previously added an echo line (`addLine`) before the streaming response, but `handleKeyDown` already echoes every command. Removed the duplicate.

## CSS Added to globals.css

```css
@keyframes chat-blink { 0%,100%{opacity:1} 50%{opacity:0} }
```
