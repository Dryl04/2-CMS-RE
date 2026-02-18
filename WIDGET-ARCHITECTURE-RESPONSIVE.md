# Widget Architecture & Responsive Design Guide

## Table of Contents
1. [System Architecture Overview](#1-system-architecture-overview)
2. [Core Data Structures](#2-core-data-structures)
3. [Widget Registry](#3-widget-registry)
4. [Complete Widget Inventory](#4-complete-widget-inventory)
5. [Theme System](#5-theme-system)
6. [PageBuilder Workflow](#6-pagebuilder-workflow)
7. [Properties Panel](#7-properties-panel)
8. [Content Editors](#8-content-editors)
9. [Section Renderer](#9-section-renderer)
10. [Responsive Design System](#10-responsive-design-system)
11. [Critical Files Reference](#11-critical-files-reference)

---

## 1. System Architecture Overview

The PageBuilder widget system is a visual page builder built with React/TypeScript, DaisyUI, and Tailwind CSS.

### Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                    PAGE BUILDER STATE                            │
│  sections[], selectedSectionId, device, daisyThemeSlug, history │
└────────────────────────────┬────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
   ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐
   │   Canvas    │  │  Properties │  │  Widget Library  │
   │ (Sections)  │  │   Panel     │  │   (Selector)     │
   └─────────────┘  └─────────────┘  └──────────────────┘
        │                    │                    │
        │                    │    createSection() │
        │                    │◄───────────────────┘
        │ updateSection()    │
        │◄───────────────────┤
        │                    │
        ▼                    ▼
   SectionRenderer  updateContent/Design
        │
        ├─── normalizeSectionForTheme()
        ├─── getWidgetThemeProps()
        ├─── getWidgetButtonRadius()
        └─── getWidgetButtonSizeVars()
             │
             ▼
        Widget Component
        (HeroWidget, FeaturesWidget, etc.)
```

### Key Files

| File | Role |
|------|------|
| `src/lib/pageBuilderTypes.ts` | Core TypeScript interfaces |
| `src/lib/widgetLibrary.ts` | Widget registry with defaults |
| `src/lib/widgetThemeHelper.ts` | Theme application & CSS variable mapping |
| `src/lib/pageThemes.ts` | Page-level DaisyUI theme definitions |
| `src/components/PageBuilder/PageBuilder.tsx` | Main orchestrator, 3-column layout |
| `src/components/PageBuilder/Canvas.tsx` | Drag-and-drop container (@dnd-kit) |
| `src/components/PageBuilder/SectionRenderer.tsx` | Per-section renderer + theme wrapper |
| `src/components/PageBuilder/PropertiesPanel.tsx` | Content/Design/Advanced tabs |
| `src/components/PageBuilder/WidgetLibrary.tsx` | Left sidebar widget selector |
| `src/components/PageBuilder/WidgetThemeSelector.tsx` | Inherit/Named/Custom theme selector |
| `src/components/PageBuilder/ContentEditors.tsx` | Widget-specific content editors |
| `src/components/PageBuilder/HeroAdvancedEditor.tsx` | Advanced hero overlays/effects |
| `src/components/PageBuilder/Widgets/*.tsx` | Individual widget components |

---

## 2. Core Data Structures

### PageBuilderSection

```typescript
interface PageBuilderSection {
  id: string;
  type: WidgetType;
  variant: string;
  order: number;
  content: Record<string, any>;
  design: {
    background: {
      type: "color" | "gradient" | "image" | "video";
      value: string;
    };
    spacing: {
      paddingTop: string;
      paddingBottom: string;
      marginTop: string;
      marginBottom: string;
    };
    typography?: {
      fontFamily?: string;
      fontSize?: string;
      lineHeight?: string;
      headingColor?: string;
      textColor?: string;
    };
    colors?: {
      primary?: string;
      secondary?: string;
      accent?: string;
      buttonBackground?: string;
      buttonText?: string;
      buttonBackgroundHover?: string;
      buttonRadius?: string;
      buttonSize?: "sm" | "md" | "lg" | "xl";
      iconBackground?: string;
      iconColor?: string;
    };
  };
  themeConfig?: {
    themeMode: "inherit" | "named" | "custom";
    themeRef?: string;
    customTokens?: Record<string, string>;
  };
  advanced: {
    cssClasses?: string[];
    customCSS?: string;
    animations?: { entrance?: string; hover?: string; };
    visibility?: { desktop: boolean; tablet: boolean; mobile: boolean; };
  };
}
```

### WidgetDefinition

```typescript
interface WidgetDefinition {
  type: WidgetType;
  label: string;
  description: string;
  icon: string;
  category?: "navigation" | "content" | "marketing";
  unique?: boolean;
  variants: WidgetVariant[];
  defaultContent: Record<string, any>;
  defaultDesign: PageBuilderSection["design"];
}
```

---

## 3. Widget Registry

File: `src/lib/widgetLibrary.ts`

All widgets are registered here with:
- `type` — Unique widget type identifier
- `variants[]` — Available visual variants (e.g., "default", "centered", "split")
- `defaultContent` — Default data when widget is added
- `defaultDesign` — Default spacing, background, colors

**createSection() flow** (in WidgetLibrary.tsx):
1. Generate ID: `section-${Date.now()}`
2. Copy `defaultContent` from registry
3. Copy `defaultDesign` from registry
4. Initialize `typography`, `colors`, `visibility`
5. Call `onAddSection(section)`

---

## 4. Complete Widget Inventory

### Navigation (6 widgets)

| Widget File | Type | Variants |
|-------------|------|----------|
| `HeaderWidget.tsx` | `header` | default, centered, transparent, minimal, creative-premium |
| `HeaderTopInfo.tsx` | `header-top-info` | default |
| `HeaderWithIcons.tsx` | `header-with-icons` | default |
| `HeaderAccountBar.tsx` | `header-account-bar` | default |
| `HeaderFullContact.tsx` | `header-full-contact` | default |
| `HeaderClickFunnel.tsx` | `header-clickfunnel` | default |

### Hero Sections (8 widgets)

| Widget File | Type | Variants |
|-------------|------|----------|
| `HeroWidget.tsx` | `hero` | default, centered, split, minimal, full-background |
| `SimpleCenteredHero.tsx` | `simple-centered-hero` | default |
| `ClickFunnelsHero.tsx` | `clickfunnels-hero` | default |
| `BrandIdentityHero.tsx` | `brand-identity-hero` | default |
| `HeroWithServicesWidget.tsx` | `hero-with-services` | default |
| `HeroWithTestimonials.tsx` | `hero-with-testimonials` | default |
| `CreativeNetworkHeroWidget.tsx` | `creative-network-hero` | default |
| `VideoHeroWidget.tsx` | `videohero` | default, minimal, overlay |

### Content Sections (15 widgets)

| Widget File | Type | Variants |
|-------------|------|----------|
| `FeaturesWidget.tsx` | `features` | default, grid-2, grid-3, grid-4, alternating |
| `BentoFeaturesWidget.tsx` | `bento-features` | default |
| `CTAWidget.tsx` | `cta` | banner, centered, split |
| `TestimonialsWidget.tsx` | `testimonials` | grid, carousel, minimal, featured |
| `CenteredTestimonial.tsx` | `centered-testimonial` | default |
| `ClickFunnelTestimonials.tsx` | `clickfunnel-testimonials` | default |
| `PricingWidget.tsx` | `pricing` | cards, comparison, toggle, minimal |
| `MembershipPricingWidget.tsx` | `membership-pricing` | default |
| `StatsWidget.tsx` | `stats` | default, cards, minimal, large |
| `TeamWidget.tsx` | `team` | default, grid, bento, minimal |
| `ServicesGridWidget.tsx` | `services-grid` | default |
| `ServicesCardsWidget.tsx` | `services-cards` | default |
| `ServicesCarouselWidget.tsx` | `services-carousel` | default |
| `ContentShowcaseWidget.tsx` | `content-showcase` | default |
| `ContentWithServicesWidget.tsx` | `content-with-services` | default |

### Contact & Forms (5 widgets)

| Widget File | Type | Variants |
|-------------|------|----------|
| `ContactWidget.tsx` | `contact` | split, centered, minimal |
| `ContactSplitWidget.tsx` | `contact-split` | default |
| `NewsletterWidget.tsx` | `newsletter` | default, split, inline |
| `NewsletterSignupWidget.tsx` | `newsletter-signup` | default |
| `FeedbackContactWidget.tsx` | `feedback-contact` | default |

### Media & Gallery (3 widgets)

| Widget File | Type | Variants |
|-------------|------|----------|
| `GalleryWidget.tsx` | `gallery` | masonry, grid, featured, magazine |
| `ImageTextSplitWidget.tsx` | `image-text-split` | default, reverse |
| `ImageStatsFAQWidget.tsx` | `image-stats-faq` | default |

### Process & Workflow (5 widgets)

| Widget File | Type | Variants |
|-------------|------|----------|
| `ProcessWidget.tsx` | `process` | horizontal, vertical, numbered |
| `ProcessAlternating.tsx` | `process-alternating` | default |
| `ProcessStepsCardsWidget.tsx` | `process-steps-cards` | default |
| `TimelineWidget.tsx` | `timeline` | default, horizontal |
| `TimelineGridWidget.tsx` | `timeline-grid` | default |

### Special Layouts (8 widgets)

| Widget File | Type | Variants |
|-------------|------|----------|
| `ProviderMasonryWidget.tsx` | `provider-masonry` | default |
| `EditorialCardsRowWidget.tsx` | `editorial-cards-row` | default |
| `ImmersiveSplitShowcaseWidget.tsx` | `immersive-split-showcase` | default |
| `ClickFunnelCenterCard.tsx` | `clickfunnel-center-card` | default |
| `ClickFunnelFeatures.tsx` | `clickfunnel-features` | default |
| `ClickFunnelFooter.tsx` | `clickfunnel-footer` | default |
| `CinematicFooterWidget.tsx` | `cinematic-footer` | default |
| `FooterWidget.tsx` | `footer` | default, minimal, centered |

### Other Sections (14 widgets)

| Widget File | Type | Variants |
|-------------|------|----------|
| `FAQWidget.tsx` | `faq` | default, two-column, cards |
| `FAQTwoColumnsWidget.tsx` | `faq-two-columns` | default |
| `LogoCloudWidget.tsx` | `logocloud` | default, marquee, featured |
| `IntegrationsGridWidget.tsx` | `integrations-grid` | default |
| `TextColumnsWidget.tsx` | `text-columns` | default, two-col, three-col |
| `CenteredContentWidget.tsx` | `centered-content` | default |
| `ContentVideoServices.tsx` | `content-video-services` | default |
| `SocialFollowWidget.tsx` | `social-follow` | default |
| `DropCapWithServices.tsx` | `drop-cap-services` | default |
| `SplitContentWithChecklist.tsx` | `split-content-checklist` | default |
| `SimpleHeaderDivider.tsx` | `simple-header-divider` | default |
| `MinimalFinalCTAWidget.tsx` | `minimal-final-cta` | default |
| `FeaturesCarouselWidget.tsx` | `features-carousel` | default |

---

## 5. Theme System

### Three-Level Theme Architecture

**Level 1: Inherit (default)**
```typescript
themeConfig: { themeMode: 'inherit' }
// Uses global DaisyUI theme set at page level
```

**Level 2: Named Theme**
```typescript
themeConfig: { themeMode: 'named', themeRef: 'light' }
// Widget uses a specific DaisyUI theme (data-theme attribute)
```

**Level 3: Custom Tokens**
```typescript
themeConfig: {
  themeMode: 'custom',
  customTokens: {
    'primary': '#FF0000',
    'base-100': '#FFFFFF',
    'base-content': '#000000',
    // ...
  }
}
```

### CSS Variable Mapping (widgetThemeHelper.ts)

DaisyUI token → CSS variable:
- `primary` → `--p`
- `primary-content` → `--pc`
- `secondary` → `--s`
- `base-100` → `--b1`
- `base-content` → `--bc`
- etc.

### SectionRenderer CSS Scope

Every widget is wrapped with:
```jsx
<div
  className="widget-design-scope"
  data-theme={widgetTheme.dataTheme}
  style={{
    '--widget-heading-color': section.design.typography?.headingColor,
    '--widget-text-color': section.design.typography?.textColor,
    '--widget-btn-bg': section.design.colors?.buttonBackground,
    '--widget-btn-text': section.design.colors?.buttonText,
    '--widget-btn-bg-hover': section.design.colors?.buttonBackgroundHover,
    '--widget-accent-color': section.design.colors?.accent,
    '--widget-icon-bg': section.design.colors?.iconBackground,
    '--widget-icon-color': section.design.colors?.iconColor,
    '--widget-btn-radius': buttonRadius,
    // button size vars, custom theme tokens...
  }}
>
```

### Widget Color Override Pattern

```typescript
// In any widget:
const headingColor = section.design?.typography?.headingColor;
const textColor = section.design?.typography?.textColor;

// Applied conditionally (no style if no override):
<h1 style={headingColor ? { color: headingColor } : undefined}>
  {title}
</h1>
```

---

## 6. PageBuilder Workflow

### UI Layout

```
┌─────────────────────────────────────────────────────────┐
│ Toolbar: device selector, undo/redo, preview, save      │
├──────────────┬──────────────────────────┬───────────────┤
│              │                          │               │
│  Widget      │     Canvas               │  Properties   │
│  Library     │   (Drag & Drop)          │  Panel        │
│  (Left)      │   SectionRenderers       │  (Right)      │
│              │                          │               │
└──────────────┴──────────────────────────┴───────────────┘
```

### Adding a Widget

1. User clicks widget/variant in WidgetLibrary
2. `createSection()` called with widget definition
3. Section object built with defaults
4. `onAddSection(section)` → PageBuilder state update
5. Canvas adds SectionRenderer
6. Section selected in PropertiesPanel

### Editing Properties

1. User selects section in Canvas
2. PropertiesPanel shows Content/Design/Advanced tabs
3. **Content**: Widget-specific editor (ContentEditors.tsx)
4. **Design**: Background, spacing, typography, colors, theme
5. **Advanced**: Visibility, CSS classes, custom CSS
6. Changes flow: `updateContent/Design()` → `onUpdateSection()` → state → re-render

### Variant Switching

- PropertiesPanel shows variant dropdown
- Changing variant updates `section.variant`
- SectionRenderer switch-case maps variant to JSX

### Device Preview

```typescript
// PageBuilder device selector
const deviceWidth = {
  mobile: '375px',
  tablet: '768px',
  desktop: '100%'
};
// Applied to canvas container width
```

### History (Undo/Redo)

```typescript
history: PageBuilderSection[][]  // array of states
historyIndex: number             // current position
// addToHistory(), undo(), redo()
```

---

## 7. Properties Panel

### Content Tab
- Renders widget-specific ContentEditor based on `section.type`
- Falls back to `GenericObjectEditor` for unlisted types
- Editors: Hero, Features, CTA, Header, Contact, Testimonials, Footer, ImageTextSplit, ContentShowcase, CenteredContent, TextColumns, ClickFunnelCenterCard, ClickFunnelTestimonials, ClickFunnelFeatures, ClickFunnelFooter

### Design Tab
- **WidgetThemeSelector** — Inherit / Named / Custom mode
- **Typography** — headingColor, textColor pickers
- **Button Styling** — size (sm/md/lg/xl), radius slider
- **Colors** — button bg/text/hover, icon bg/color, accent
- **Background** — color picker
- **Spacing** — padding and margin top/bottom
- **Advanced** (hero only) — HeroAdvancedEditor

### Advanced Tab
- Visibility toggles (desktop/tablet/mobile)
- CSS classes input
- Raw custom CSS input

---

## 8. Content Editors

File: `src/components/PageBuilder/ContentEditors.tsx`

All editors share this interface:
```typescript
interface ContentEditorProps {
  section: PageBuilderSection;
  updateContent: (key: string, value: any) => void;
}
```

### Available Editors

| Editor | Widget Type | Key Fields |
|--------|-------------|------------|
| `HeroContentEditor` | `hero` | headline, subheadline, ctaText, ctaLink, image |
| `FeaturesContentEditor` | `features` | title, subtitle, features[] (icon, title, description) |
| `CTAContentEditor` | `cta` | headline, description, primaryCTA, secondaryCTA |
| `HeaderContentEditor` | `header` | logo, logoText, navItems[], ctaText, ctaLink |
| `ContactContentEditor` | `contact` | title, subtitle, email, phone, address, showForm |
| `TestimonialsContentEditor` | `testimonials` | title, subtitle, testimonials[] |
| `FooterContentEditor` | `footer` | logo, logoText, description, columns[], socialLinks[], copyright |
| `ImageTextSplitContentEditor` | `image-text-split` | title, content, image, ctaText, ctaLink |
| `ContentShowcaseContentEditor` | `content-showcase` | title, items[] |
| `CenteredContentEditor` | `centered-content` | title, subtitle, content |
| `TextColumnsEditor` | `text-columns` | columns[] |
| `ClickFunnelCenterCardEditor` | `clickfunnel-center-card` | headline, description, tabs[], features[] |
| `ClickFunnelTestimonialsEditor` | `clickfunnel-testimonials` | testimonials[] |
| `ClickFunnelFeaturesEditor` | `clickfunnel-features` | title, features[] |
| `ClickFunnelFooterEditor` | `clickfunnel-footer` | columns[], copyright |

---

## 9. Section Renderer

File: `src/components/PageBuilder/SectionRenderer.tsx`

### Render Pipeline

1. Receive `section` from Canvas
2. `normalizeSectionForTheme(section)` — sanitize data
3. `getWidgetThemeProps(normalizedSection)` — get `dataTheme` and `customStyles`
4. `getWidgetButtonRadius(normalizedSection)` — button radius value
5. `getWidgetButtonSizeVars(normalizedSection)` — size CSS variables
6. Wrap in `widget-design-scope` div with all CSS vars
7. Call `renderWidget()` switch statement
8. Return correct widget component with `section` and `onUpdate` props

### Widget Switch Statement

~90 cases mapping `section.type` to component:
```typescript
case 'hero': return <HeroWidget section={normalizedSection} onUpdate={...} />;
case 'features': return <FeaturesWidget section={normalizedSection} onUpdate={...} />;
// ... etc for all widget types
```

### Edit Controls (non-preview mode)
- Drag handle (grip icon)
- Duplicate button
- Edit button (selects section in panel)
- Delete button
- Selection ring on hover/selected

---

## 10. Responsive Design System

### Breakpoint Strategy

| Breakpoint | Width | Use Case |
|------------|-------|----------|
| Default | 0px+ | Mobile first |
| `sm:` | 640px+ | Large mobile / small tablet |
| `md:` | 768px+ | Tablet |
| `lg:` | 1024px+ | Desktop |
| `xl:` | 1280px+ | Large desktop |

### Standard Responsive Patterns

**Grid Layouts:**
```html
<!-- Standard 3-column grid -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">

<!-- 4-column grid -->
<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
```

**Typography Scaling:**
```html
<!-- Heading (smooth scale) -->
<h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold">

<!-- Body text -->
<p class="text-sm sm:text-base">
```

**Flex Layouts:**
```html
<!-- Stack on mobile, row on tablet+ -->
<div class="flex flex-col sm:flex-row gap-3 sm:gap-4">
```

**Padding:**
```html
<!-- Section padding -->
<section class="px-4 sm:px-6 lg:px-8">

<!-- Card padding -->
<div class="p-4 sm:p-6 lg:p-8">
```

**Images:**
```html
<!-- Aspect ratio instead of fixed height -->
<div class="aspect-video w-full overflow-hidden rounded-xl">
  <img class="w-full h-full object-cover" />
</div>

<!-- If fixed height needed -->
<div class="h-48 sm:h-64 lg:h-80 overflow-hidden">
```

### Device Preview in Builder

The Canvas applies width constraints in preview mode:
```typescript
const deviceWidths = {
  mobile: '375px',   // iPhone SE viewport
  tablet: '768px',   // iPad portrait
  desktop: '100%'    // Full width
};
```

### Visibility Control

```typescript
section.advanced.visibility = {
  desktop: true,
  tablet: true,
  mobile: true
}
// Hidden sections get display:none in SectionRenderer
```

### Critical Responsive Rules

1. **Never use fixed widths** — Use `max-w-*` with `w-full`
2. **Never use fixed heights on images** — Use `aspect-ratio` or responsive `h-*` classes
3. **Grid defaults to 1 column** — All grids start as `grid-cols-1`
4. **Text scales smoothly** — No more than 25-33% jump per breakpoint
5. **Gaps reduce on mobile** — `gap-4 sm:gap-6 lg:gap-8`
6. **Padding reduces on mobile** — `px-4 sm:px-6 lg:px-8`
7. **Always add `flex-wrap`** to flex containers with multiple items
8. **Navigation** — Hide links on mobile, show hamburger menu
9. **Cards** — Full width on mobile, then 2-3-4 columns up

---

## 11. Critical Files Reference

### widgetLibrary.ts Structure

```typescript
export const widgetDefinitions: WidgetDefinition[] = [
  {
    type: 'hero',
    label: 'Hero',
    description: '...',
    icon: 'layout',
    category: 'content',
    unique: false,
    variants: [
      { id: 'default', label: 'Classic' },
      { id: 'centered', label: 'Centered' },
      // ...
    ],
    defaultContent: { headline: '...', ... },
    defaultDesign: {
      background: { type: 'color', value: '#ffffff' },
      spacing: { paddingTop: '96px', paddingBottom: '96px', ... }
    }
  },
  // ... all other widgets
];
```

### widgetThemeHelper.ts Key Functions

```typescript
normalizeSectionForTheme(section: PageBuilderSection): PageBuilderSection
getWidgetThemeProps(section): { dataTheme: string | undefined, customStyles: Record<string, string> }
getWidgetButtonRadius(section): string
getWidgetButtonSizeVars(section): Record<string, string>
getOverrideStyle(section): { headingColor?: string, textColor?: string }
```

### Adding a New Widget

1. Create widget file in `src/components/PageBuilder/Widgets/NewWidget.tsx`
2. Add type to `WidgetType` union in `pageBuilderTypes.ts`
3. Add definition to `widgetDefinitions` array in `widgetLibrary.ts`
4. Add case to switch in `SectionRenderer.tsx` renderWidget()
5. (Optional) Add content editor to `ContentEditors.tsx`
6. (Optional) Export from widget library panel

### Widget Component Template

```typescript
import React from 'react';
import { PageBuilderSection } from '../../../lib/pageBuilderTypes';

interface NewWidgetProps {
  section: PageBuilderSection;
  onUpdate?: (updates: Partial<PageBuilderSection>) => void;
}

export default function NewWidget({ section }: NewWidgetProps) {
  const { title, subtitle } = section.content;

  const headingColor = section.design?.typography?.headingColor;
  const textColor = section.design?.typography?.textColor;

  return (
    <section className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile-first responsive layout */}
        <h2
          className="text-2xl sm:text-3xl md:text-4xl font-bold"
          style={headingColor ? { color: headingColor } : undefined}
        >
          {title}
        </h2>
        <p
          className="text-sm sm:text-base"
          style={textColor ? { color: textColor } : undefined}
        >
          {subtitle}
        </p>
      </div>
    </section>
  );
}
```

---

*Generated: 2026-02-18 | For internal use in PageBuilder development*
