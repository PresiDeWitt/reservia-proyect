# ReserVia — Design System

> Warm editorial hospitality. Cream paper, deep navy ink, ember-orange highlights.
> Serif headlines set the tone; restrained sans-serif carries the work.

---

## 1. Design Philosophy

ReserVia isn't a generic booking tool — it's a guide to the table. The UI should feel
like a well-edited food magazine: confident typography, generous whitespace, grainy
warmth, and a single hot accent that directs every action.

**Three principles**

1. **Editorial, not corporate.** Serif display type with italic accents carries
   personality. Avoid stacked generic sans-serif headlines.
2. **One hot accent.** Orange (`#f97415`) is the only saturated color on screen.
   Everything else is cream, navy, or a tonal variant.
3. **Warm, not sterile.** Cream backgrounds, grain textures, and radial orange
   glows give depth. No pure white, no pure black.

---

## 2. Color Tokens

Defined in `frontend/src/index.css` via `@theme`. **Do not introduce new hex
values in components** — compose from these tokens.

| Token                  | Value      | Role                                        |
|------------------------|------------|---------------------------------------------|
| `--color-primary`      | `#f97415`  | Single accent. CTAs, active states, glow.   |
| `--color-navy`         | `#0F172A`  | Primary ink. Headlines, body, dark panels.  |
| `--color-background-light` | `#f8f7f5` | Cream paper. Default surface.            |
| `--color-background-dark`  | `#23170f` | Espresso. Dark-mode surface.             |
| `--color-emerald`      | `#10B981`  | Success / confirmed reservations only.      |

### Usage rules

- **Primary** is reserved for the *one* primary action per screen and for
  accent italics in editorial headlines. Never use it as a background block
  larger than a button.
- **Navy** on cream: primary CTA pairs (`bg-navy text-background-light`) —
  orange is the *hover* reveal.
- **Tonal grays**: always derived from navy (`text-navy/55`, `border-navy/10`).
  Never `text-slate-*` or `text-gray-*`.
- **Contrast minimums**: body text ≥ 4.5:1, secondary ≥ 3:1 (WCAG AA).

---

## 3. Typography

Two families, each with one job.

| Family                           | Role           | Where                                       |
|----------------------------------|----------------|----------------------------------------------|
| **Fraunces** (variable serif)    | Editorial      | Headlines, italic accents, decorative stats |
| **Inter** (variable sans)        | Work text      | Body, labels, buttons, forms, nav           |

Loaded in `index.html`. Fraunces uses optical sizing + SOFT axis for its
magazine-like warmth. Apply via `.auth-editorial` utility or
`font-family: var(--font-editorial)`.

### Type scale

| Role            | Size       | Weight | Tracking          | Family   |
|-----------------|------------|--------|-------------------|----------|
| Display XL      | 56 / 64    | 300–400 | -0.02em          | Fraunces |
| Display         | 44 / 52    | 300–400 | -0.02em          | Fraunces |
| Editorial H3    | 28 / 32    | 400    | -0.01em           | Fraunces |
| Label eyebrow   | 10–11 / 14 | 700    | 0.3em uppercase   | Inter    |
| Body            | 15 / 24    | 500    | 0                 | Inter    |
| Caption         | 12 / 18    | 600    | 0                 | Inter    |

### Rules

- **Italic = accent.** Use Fraunces italic only on one word per headline, always
  in `text-primary`. Never italicize entire headlines.
- **Eyebrow labels** (`text-[10px] tracking-[0.3em] uppercase`) replace cheap
  "Step 1 of 2" UI — they anchor the page with editorial numbering (`01 — Acceso`).
- **Never** set body text below 14px or line-height below 1.5.

---

## 4. Spacing & Layout

- 4/8px rhythm. Component gaps: `gap-3 / gap-4 / gap-5 / gap-6`.
- Auth modal uses a **55/45 asymmetric split** on desktop (`lg:grid-cols-[1.05fr_1fr]`)
  — the editorial panel leads, the form follows. On mobile the editorial panel
  collapses into a condensed header.
- Border radius scale: `rounded-full` (pills), `rounded-2xl` (inputs / cards),
  `rounded-[28px]` (hero cards / modals).
- Max widths: form cards `max-w-md`, split modals `max-w-5xl`, content `max-w-6xl`.

---

## 5. Effects & Texture

The warmth comes from layered effects, not flat fills.

```
auth-grain  →  cream noise + 2 radial orange glows (low alpha)
shadow-2xl  →  0 40px 120px -20px rgba(15,23,42,0.45)  (cards)
ring-1 ring-navy/5  →  hairline separator on floating pills
```

- **Grain**: use `.auth-grain` on dark panels to pick up the editorial
  newsprint feel. Keep opacity ≥ 0.9 so the noise reads.
- **Glow**: hot primary radial at 20% alpha, behind the content, bottom-left
  corner. Never a full gradient fill.
- **Shadows**: tall, soft, navy-tinted. Never pure black shadow.
- **Blur**: only as backdrop scrim (`backdrop-blur-md` on the modal overlay)
  or hidden behind a glow — never as decoration.

---

## 6. Motion

Defined in `src/index.css`. Tokens:

| Token             | Duration | Easing                          | Use                        |
|-------------------|----------|---------------------------------|----------------------------|
| `auth-rise`       | 550ms    | `cubic-bezier(0.2,0.8,0.2,1)`   | Staggered form reveal      |
| Tab indicator     | spring   | `stiffness 400, damping 34`     | Login/Register switch      |
| Input underline   | 400ms    | `cubic-bezier(0.2,0.8,0.2,1)`   | Focus emphasis             |
| CTA wipe          | 500ms    | same                            | Navy → orange hover reveal |

### Rules

- **Stagger page load**: 70ms increments via `nth-child` on `.auth-rise`.
- **Exit < enter**: dismiss animations run ~60% of the enter duration.
- **Respect `prefers-reduced-motion`** — already wired globally in `index.css`.
- **One motion moment per view.** On the auth modal it's the staggered entry
  and the tab spring. Don't stack more.

---

## 7. Components

### Auth modal (`components/AuthModal.tsx`)

Two-column editorial split:

- **Left panel (`lg:+`)** — dark navy surface with grain + radial glow, editorial
  headline with italic accent, brand mark top, stats row bottom.
- **Right panel** — cream background, segmented pill tabs, floating-label inputs,
  navy CTA with orange hover wipe, social fallbacks, mode toggle footer.
- **Mobile** — left panel collapses; a condensed editorial header replaces it.
- **Accessibility** — `role="dialog"`, `aria-modal`, labelled by headline,
  `aria-live` on errors, password toggle with `aria-label`, inputs with
  `autoComplete` and `minLength`, keyboard-reachable close button.

### FloatField (internal)

- 56px height (meets 44px touch target with margin).
- Label animates from placeholder position → eyebrow label on focus or value.
- Focus state: primary border, 4px soft orange glow ring, icon tint to primary,
  bottom gradient underline scales from 15% → 100%.
- Trailing slot for password visibility toggle.

### Primary CTA

```
bg-navy → hover: orange wipe (translate-y-full → 0), shadow glow
height 56px · rounded-2xl · font-bold · tracking-wide
loading: spinner + localized label  ("Entrando…" / "Creando cuenta…")
```

---

## 8. Content Voice

- **Spanish-first**, warm and personal. "Donde la *sobremesa* nunca termina."
- Avoid corporate filler ("Welcome to our platform"). Write like a maître d'.
- Italic words are emotional anchors — pick verbs and nouns, never adjectives.

---

## 9. Accessibility Non-Negotiables

1. Every interactive element ≥ 44×44px tap target.
2. Focus rings visible (inputs get the 4px orange glow; buttons use default).
3. Contrast: navy on cream ≥ 12:1, cream on navy ≥ 15:1, primary on navy ≥ 4.8:1.
4. Color never carries meaning alone — errors ship with an icon + text.
5. `prefers-reduced-motion` disables all `auth-rise` and spring motion.
6. Password fields provide a show/hide toggle with `aria-label`.
7. Modals trap via backdrop click + escape; close button is always reachable.

---

## 10. Anti-Patterns

Do not:

- Mix in new grays — use `navy/xx` alpha variants.
- Introduce a secondary accent color (no blue, no purple, no teal CTAs).
- Italicize entire headlines or paragraphs.
- Use emoji as icons (Material Symbols only, consistent weight).
- Use `shadow-black/50` — always tint shadows navy.
- Animate `width`/`height`/`top`/`left` — only `transform` and `opacity`.
- Show toasts with `alert()` or unstyled browser errors — route through the
  in-card `aria-live` error slot.
- Crop the editorial panel at `md:` — it only unlocks at `lg:` so the serif
  headline has room to breathe.

---

_Last updated: 2026-04-15 · Maintained alongside `frontend/src/index.css` tokens._
