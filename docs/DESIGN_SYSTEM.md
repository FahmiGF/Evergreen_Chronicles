# EVERGREEN CHRONICLES — GLOBAL DESIGN SYSTEM & UI TOKENS
**Document Version:** 2.0.0  
**Status:** Approved Standard  
**Scope:** Client UI, HUD, Modals, Menus, Typography, Microinteractions

---

## 1. Visual Identity & Design Principles

Evergreen Chronicles combines **cozy medieval-to-arcane fantasy aesthetics** with **clean, modern interface ergonomics**:
1. **Warm Natural Palette**: Grounded earthy hues (forest moss, aged parchment, warm amber, obsidian basalt) that evoke fantasy comfort without visual fatigue.
2. **High Information Clarity**: Interfaces must never sacrifice readability for decoration. Clean contrast ratios (minimum 4.5:1 against surfaces).
3. **Tactile Microinteractions**: Buttons, cards, and sliders provide instantaneous audio-visual feedback (<16ms response).
4. **Component Reusability**: All modals, buttons, badges, and progress bars inherit identical styling tokens. No one-off ad-hoc CSS styles.

---

## 2. Design Tokens & Color Palette

### 2.1 Core Palette Swatches

```css
:root {
  /* Surface & Backgrounds */
  --eg-bg-canvas: #09090b;        /* Deep Obsidian */
  --eg-bg-surface-dark: #18181b;  /* Stone 900 */
  --eg-bg-surface-card: #27272a;  /* Stone 800 */
  --eg-bg-surface-elevated: #3f3f46;

  /* Accent & Brand Colors */
  --eg-primary-forest: #15803d;   /* Emerald Druid */
  --eg-primary-gold: #d97706;     /* Amber Harvest */
  --eg-primary-glow: #f59e0b;     /* Golden Candlelight */
  --eg-primary-cyan: #06b6d4;     /* Aether Crystal */
  --eg-primary-arcane: #8b5cf6;   /* Arcane Future Violet */

  /* Semantic State Colors */
  --eg-state-success: #10b981;    /* Vibrant Emerald */
  --eg-state-warning: #f59e0b;    /* Warm Amber */
  --eg-state-danger: #ef4444;     /* Crimson */
  --eg-state-info: #0ea5e9;       /* Sky Blue */

  /* Text & Typography */
  --eg-text-primary: #f4f4f5;     /* Stone 100 */
  --eg-text-secondary: #a1a1aa;   /* Stone 400 */
  --eg-text-amber: #fde68a;       /* Amber 200 */
  --eg-text-muted: #71717a;       /* Stone 500 */

  /* Borders & Dividers */
  --eg-border-gold: rgba(217, 119, 6, 0.65);
  --eg-border-subtle: rgba(255, 255, 255, 0.1);
  --eg-border-glow: 0 0 12px rgba(245, 158, 11, 0.35);
}
```

---

## 3. Typography Hierarchy

| Style | Font Family | Size | Weight | Line Height | Usage |
|---|---|---|---|---|---|
| **Display Title** | `MedievalSharp`, cursive | 24px - 32px | Bold | 1.2 | Modal headers, Era progression banners |
| **Section Heading**| `MedievalSharp`, cursive | 16px - 20px | Semi-bold | 1.3 | Panel titles, Card headers |
| **Body Text** | `Inter`, `sans-serif` | 13px - 14px | Normal | 1.5 | NPC dialogue, quest descriptions, lore |
| **Data / Numbers** | `JetBrains Mono`, monospace | 11px - 13px | Bold | 1.2 | Currency (Gold/Aether), coordinates, stats |
| **Caption / Badge**| `Inter`, `sans-serif` | 10px - 11px | Bold | 1.2 | Race tags, skill perks, status pills |

---

## 4. Reusable UI Components

### 4.1 Button Hierarchy
- **Primary Action (CTA)**: Amber/Gold gradient (`bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400`), dark text, gold shadow. Used for Save, Advance Era, Complete Quest.
- **Secondary Action**: Stone dark surface (`bg-stone-800 hover:bg-stone-700 border border-stone-600`), light text. Used for navigation tabs, cancel, filters.
- **Danger Action**: Crimson tone (`bg-rose-950/80 hover:bg-rose-900 border border-rose-600 text-rose-200`). Used for reset, abandon, close.
- **Special Arcane**: Violet/Cyan gradient (`bg-gradient-to-r from-violet-600 to-cyan-500`), white text with soft neon glow. Used for Arcane Research and Tech milestones.

### 4.2 Modal Standards
- Backdrop: `bg-black/80 backdrop-blur-sm`.
- Container: Rounded-2xl, border 2px (`border-amber-600/70`), subtle radial gradient header.
- Max height: `max-h-[92vh]` with clean internal scrollbar (`overflow-y-auto`).
- Fixed header with icon, title, subtitle, and prominent close button `✕`.
- Footer bar with contextual status and action buttons.

---

## 5. Microinteraction & Animation Rules

- **Hover Transition**: `transition-all duration-150 ease-out` with subtle scale (`hover:scale-[1.02]`).
- **Active / Pressed**: Instant scale (`active:scale-[0.98]`).
- **Audio Pairing**: Every interactive button must trigger procedural Web Audio API clicks (`sounds.playClick()`, `sounds.playLevelUp()`, `sounds.playCoin()`).
- **Reduced Motion Support**: Check `prefers-reduced-motion` media query to disable heavy scale and pulsing animations for accessibility.
