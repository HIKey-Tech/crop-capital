---
name: landing-page
description: Design language and implementation guidelines for the platform landing page at `/`.
---

# Platform Landing Page Skills

This file documents the design language of the platform landing page so future edits preserve the current visual quality, tone, and interaction model.

## Scope

Primary reference surface:

- `apps/frontend/src/routes/index.tsx`

Supporting design primitives:

- `apps/frontend/src/styles.css`
- `apps/frontend/src/components/fade-in.tsx`
- `apps/frontend/src/hooks/use-in-view.ts`
- `docs/DESIGN_SYSTEM.md`

This file is about the platform landing page at `/`, not the tenant-specific investor marketing page at `apps/frontend/src/routes/$tenant/index.tsx`.

## Core Design Character

The platform landing page is designed as a premium operating-system-style marketing surface for platform operators, not a generic SaaS homepage.

The design should feel:

- calm
- executive
- precise
- trustworthy
- spacious
- premium without looking ornamental

The page is built around a restrained agricultural-finance aesthetic:

- warm off-white backgrounds instead of stark white
- deep green primary surfaces driven by semantic hue tokens
- gold used sparingly as a value accent, not a dominant brand layer
- high-contrast typography with large editorial hero lines
- long vertical rhythm with deliberate pauses between sections
- subtle cartographic and grid textures instead of loud illustrations

## Visual System

### Color Model

The page is token-driven, not hardcoded around one specific green.

Primary roles from `styles.css`:

- `--background: 40 20% 98%`
- `--foreground: 160 30% 12%`
- `--primary: var(--hue-primary) 50% 18%`
- `--secondary: 35 40% 15%`
- `--accent: 38 75% 55%`
- `--border: 40 15% 88%`

Implications:

- neutral surfaces stay warm and light
- the primary hue carries brand identity and should remain structurally important
- secondary sections use dark, grounded panels for contrast blocks
- accent usage should stay selective and mostly support financial emphasis or key moments

Do not introduce unrelated palette families such as blue, purple, or cyan just to create variation.

### Typography

Typography is intentionally narrow in family choice and wide in expressive range.

Font stack:

- Quicksand is used for everything, including display and accent text

Utility roles from `styles.css`:

- `.text-display`: light weight, tight tracking, compressed line-height for major headlines
- `.italic-serif`: heavier display accent used where another design might reach for a serif contrast
- uppercase micro-labels with very wide tracking are used as section markers and navigation labels

Typography rules:

- hero and section headlines should feel editorial, not dashboard-like
- labels should be tiny, uppercase, and widely tracked
- body copy should stay medium weight with generous line height
- avoid mixing in default sans stacks or new decorative fonts

## Composition Rules

### Layout Rhythm

The page relies on broad spacing and clean sectional separation.

Primary layout utilities:

- `.premium-container`: centered max-width shell with generous horizontal padding
- `.section-spacing`: large vertical spacing for major sections

The composition pattern is consistent:

- a restrained navigation bar
- a dramatic hero with asymmetric structure
- a high-contrast stats band
- alternating light and dark sections
- grid-based feature and process sections
- a polished testimonial/social-proof finish
- a direct CTA footer close

Avoid compressing the page into a dense SaaS layout. It should breathe.

### Section Grammar

Most sections follow the same visual sentence:

1. a thin horizontal rule
2. a tiny uppercase overline in primary
3. a large headline with one emphasized phrase
4. a supportive paragraph with strong readability
5. a structured content block beneath

That grammar is one of the page’s strongest consistency signals. Preserve it.

## Surface Language

### Cards and Panels

Cards are sharp, editorial, and lightly elevated.

Relevant utilities:

- `.feature-card`
- `.card-elevated`
- `.shadow-premium`

Card behavior:

- thin borders first
- elevation second
- hover movement is subtle and upward
- glow is derived from primary hue and low opacity

Cards should not become soft, bubbly, or heavily rounded. The current page language favors crisp edges and controlled lift.

### Textures and Backgrounds

Background richness is subtle and layered:

- radial hue blooms in the page chrome
- film-grain noise in `body::after`
- `dot-grid` utility on large marketing surfaces
- animated topo lines in the hero via `TopoBackground`

These textures are atmospheric. They should never overpower content.

## Motion System

The page uses motion to stage content, not to entertain.

Primary motion primitives:

- `FadeIn` wrapper for in-view reveal
- `useInView` for once-only intersection triggers
- `slideRevealY` for hero headline entrance
- `topoTrace` for background line drawing
- `lineGrowX` for section lead-in rules
- button shimmer and hover translation in `.btn-primary-gradient`

Motion rules:

- enter content in staggered, confident sequences
- prefer opacity + small directional translation
- reserve larger theatrical motion for hero-only moments
- keep hover feedback tactile but brief
- do not add spring-heavy or playful motion that breaks the premium tone

## Signature Patterns To Reuse

### Navigation

The navbar is minimal and polished:

- transparent at top of page
- becomes blurred, bordered, and lightly shadowed when scrolled
- desktop links use hover underline growth
- mobile menu is a full-screen slide-over, not a small dropdown

This should continue to feel like a luxury site navigation system, not an app header.

### Hero

The hero is the most important expression of the design system.

It combines:

- oversized multi-line headline
- one emphasized line in accent display style
- restrained support copy
- one dominant primary CTA
- one quieter secondary action
- a structured right-side proof/benefit column
- animated topographic background and soft radial glows

The hero should stay asymmetric, high-impact, and spacious.

### Stats Band

The stats band provides contrast and credibility.

Characteristics:

- dark secondary background
- light text
- bold numeric hierarchy
- thin dividers
- subtle dot-grid texture at low opacity

This section should feel institutional, almost like a factsheet.

### Feature Grid

Features are presented as a bordered, column-based editorial grid.

Important traits:

- equal-height columns
- one featured tile allowed, but only through mild tonal emphasis
- icon, label, title, body, bullet pattern
- hover lift stays restrained

Do not convert this into generic marketing cards with oversized gradients and badges everywhere.

### Process Grid

Process sections use numbered sequence cards with strong numeral presence.

Rules:

- large translucent step numbers
- concise, uppercase step titles
- clear left-to-right flow on desktop
- connecting arrows only where they help sequence readability

### Security and Trust Sections

Dark sections are used to communicate seriousness.

Use them for:

- security
- compliance
- infrastructure
- methodology
- governance

Dark sections should rely on contrast, structure, and measured white opacity. Avoid glossy neon treatments.

## Responsive Behavior

The mobile experience is not a reduced desktop clone. It preserves tone by simplifying layout while keeping the core hierarchy intact.

Observed responsive patterns:

- desktop nav collapses into a full-screen mobile menu
- hero grid collapses into a single column
- stats and features reflow into stacked grids
- spacing remains generous even when columns collapse
- typography scales with `clamp(...)` rather than abrupt breakpoint jumps

When editing the landing page:

- preserve headline drama on small screens
- keep CTA groups vertically comfortable on mobile
- do not remove whitespace just to fit more above the fold

## Copy and Tone Guidance

The platform page speaks to operators and business owners, not retail investors.

The copy tone should stay:

- direct
- controlled
- authoritative
- benefit-led
- operationally confident

Avoid:

- hype language
- startup clichés
- chatty product copy
- overly technical engineering jargon in hero-level messaging

## Implementation Constraints

If you extend or redesign this page, preserve these constraints:

- use semantic color tokens before raw color utilities
- keep Quicksand as the typographic basis unless the design system changes globally
- derive decorative color from `--hue-primary`
- reuse `FadeIn`, `useInView`, and existing keyframes where possible
- keep section introductions consistent with the current rule + overline + headline grammar
- prefer borders, spacing, and typography for hierarchy before adding more color
- keep hover effects under control: translate a little, brighten a little, never bounce

## Anti-Patterns

Do not introduce any of the following without a deliberate full redesign:

- glassmorphism-heavy hero panels
- purple or blue gradients unrelated to tenant hue
- overly round cards and pill-heavy component styling
- dense dashboard spacing on the marketing page
- emoji, illustration kits, or cartoon visuals
- noisy parallax or continuous motion loops across many sections
- low-contrast text over photography
- multiple competing accent colors in one section

## Practical Reuse Checklist

When adding a new section to the platform landing page, match this checklist:

- starts with an overline and lead rule
- uses editorial headline proportions
- keeps copy width constrained
- uses token-based surfaces and borders
- includes subtle motion only where it adds hierarchy
- respects the warm-neutral + dark-green + gold system
- feels credible enough for finance and calm enough for agriculture

## Summary

The current platform landing page works because it blends three things carefully:

- editorial typography
- institutional structure
- restrained atmospheric motion

Any future work should protect that balance.
