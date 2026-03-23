# Crop Capital Frontend Design System

## Purpose

This frontend already has a design system in practice, but it has mostly lived in CSS tokens and component conventions rather than in a formal document.

This file is the working guide for anyone redesigning the product, especially the tenant landing pages.

The most important constraint is this:

- The product is tenant-aware.
- Brand color is not hardcoded per page.
- The visual system is driven primarily by a tenant-controlled hue value.

If you are redesigning the landing page, treat this document and [src/styles.css](src/styles.css) as the source of truth.

## Source Of Truth

Core implementation files:

- [src/styles.css](src/styles.css)
- [src/contexts/tenant.tsx](src/contexts/tenant.tsx)
- [src/types/api.ts](src/types/api.ts)

These files define:

# Crop Capital Frontend Design System

## Overview

Crop Capital already has a design system, even though it was originally expressed more through CSS tokens and component patterns than through formal documentation.

This document is the presentation-ready version of that system. It is intended for designers, collaborators, and contributors who may not be working directly inside the codebase.

The core idea is simple:

- the product is multi-tenant
- the brand color is tenant-controlled
- the interface should adapt to that tenant color rather than hardcoding a fixed palette

In other words, this is not a single-brand visual system. It is a shared product system with tenant-specific branding layered on top.

## Executive Summary

The visual language is defined by three things:

1. Stable neutral surfaces
2. Semantic UI tokens for things like primary actions, accents, borders, and muted text
3. A tenant-controlled hue value that drives brand color throughout the experience

That means redesign work should preserve the structure of the system while allowing the tenant's chosen hue to shape the final appearance.

## Brand Model

Each tenant can control key branding and content fields, including:

- display name
- short name
- legal name
- logo
- favicon
- tagline
- hero title
- hero description
- primary and secondary CTA labels
- support and legal information
- primary brand hue

The most important visual input is the brand hue.

Only one color primitive currently drives the theme:

- `primaryHue`

Default value:

- `142`

This hue is then used to derive the tenant's primary, secondary, accent, success, and focus-ring colors.

## Design Principles

### 1. Tenant First, Not Hardcoded Brand First

The product should never feel locked to one brand color family. A design that only looks good in green is not complete.

### 2. Stable Neutrals, Flexible Brand Layer

Backgrounds, cards, borders, and readable text should remain structurally dependable. Brand expression should come from hue-derived accents, not from rebuilding the full color system for each tenant.

### 3. Semantic Over Literal

Colors should be used semantically:

- primary for emphasis and key action
- accent for highlights
- muted for secondary information
- destructive for errors

The system should be described and designed in terms of meaning, not arbitrary color names.

### 4. Bright, Trustworthy Marketing Surfaces

The current product language is light, airy, and credibility-oriented. Even when glassmorphism-like treatments are used, readability and composure should take precedence over spectacle.

### 5. Hierarchy Through Treatment, Not Random New Colors

If one element needs more prominence than another, solve that with:

- tint strength
- contrast
- shadow weight
- border emphasis
- scale
- spacing
- layout

Do not solve hierarchy by introducing an unrelated hue family.

## Visual Foundations

### Color System

The visual system is token-based.

There are two layers:

- neutral foundation tokens
- hue-derived brand tokens

#### Neutral Foundation

These define the structural canvas of the interface:

- background
- foreground
- card
- card foreground
- popover
- border
- input
- muted
- muted foreground

These should remain visually stable across tenants.

#### Brand Tokens

These are derived from the tenant hue:

- primary
- primary foreground
- secondary
- secondary foreground
- accent
- accent foreground
- success
- success foreground
- ring

These are the parts of the system that should carry tenant personality.

### Radius

The system leans soft rather than sharp.

Current direction:

- rounded controls
- soft cards
- approachable modern geometry

### Shadows

Shadows are subtle and diffuse.

The product should feel:

- clean
- calm
- credible
- lightly elevated

It should not feel:

- glossy
- hyper-neomorphic
- overly dramatic

### Gradients

Gradients are part of the system, but they should remain restrained.

They are best used for:

- primary CTAs
- lightly tinted marketing surfaces
- subtle card or hero treatments

They should not overwhelm content or become the main visual identity independent of the tenant hue.

## Typography

Primary typeface:

- DM Sans

Typography direction:

- modern
- clean
- legible
- confident
- friendly without being playful

Usage guidance:

- strong, bold numerals for stats and KPIs
- restrained paragraph styling
- medium to bold button text
- clear headline hierarchy

Avoid introducing decorative or highly expressive display fonts unless the design system is intentionally being expanded.

## Component Language

The current system suggests the following component behavior:

- soft borders
- modest radius
- subtle shadows
- restrained gradients
- token-driven color
- selective use of glassmorphism-like surfaces

Common component families already implied by the UI include:

- primary buttons
- secondary buttons
- elevated cards
- stat cards
- badges
- navigation links
- progress bars

## Landing Page Guidance

If someone is redesigning the landing page, these are the rules that matter most.

### Do Not Hardcode Color Families

Avoid designing around fixed palettes like emerald, teal, cyan, lime, purple, or orange as if they are universally correct. The landing page must still work when the tenant hue changes.

### Start With Semantic Tokens

Design from roles, not color names:

- background
- card
- foreground
- muted foreground
- primary
- accent
- border

If extra richness is needed, use hue-derived tints rather than unrelated colors.

### Keep Marketing Surfaces Readable

The marketing layer should feel polished, but not fragile.

Preferred direction:

- bright surfaces
- soft tinting
- subtle blur
- light gradients
- strong text contrast

Avoid:

- dark translucent text panels over photography
- washed-out glass blocks with weak typography
- highlight cards that look like they belong to a different brand

### Respect Tenant-Controlled Content

The following are not fixed copy:

- hero title
- hero description
- CTA text
- tagline
- support and footer information

Design should allow for variation in length and tone.

## Do And Don't

### Do

- build from semantic tokens first
- derive branded surfaces from the tenant hue
- keep neutral surfaces stable
- use primary color selectively for emphasis
- test concepts against multiple possible tenant hues
- create hierarchy through treatment before creating it through new color families

### Don't

- hardcode one tenant's palette into shared tenant pages
- rely on fixed color names as the design system
- treat the tenant hue as decorative rather than structural
- use dark overlays for small marketing text without proving contrast
- make one featured element feel like it came from a different component library

## Practical Workflow For A Landing Page Redesign

1. Start with the neutral surface system.
2. Map the page into semantic roles: primary action, secondary action, supporting text, accent, border, surface.
3. Apply the tenant hue through the primary, secondary, and accent layers.
4. Add richness with hue-derived tints and gradients, not unrelated colors.
5. Validate the concept against at least two very different tenant hue values.
6. Fine-tune contrast, readability, and consistency before adding decorative effects.

## What A Good Result Should Feel Like

A successful redesign should feel:

- adaptable across tenants
- visually cohesive
- trustworthy
- clean
- modern
- premium without being flashy

It should not feel:

- locked to one specific brand color
- over-designed
- dependent on glassmorphism for identity
- inconsistent between highlighted and non-highlighted elements
