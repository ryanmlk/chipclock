# Kitchen Operations Dashboard - UI Design Style Guide

This document outlines the design decisions and styling tokens extracted from the "Kitchen Operations Dashboard" Stitch project to maintain a consistent UI across the Chipotle Schedule Extractor application.

## 1.0 Color Palette

The application uses a light gray background with white cards to create depth, distinct from the default shadcn/ui black-and-white theme.

### Primary Colors
- **Primary:** `#1978e5` (Blue) - Used for primary buttons, active states, and key highlights.
- **Primary Foreground:** White (`#ffffff`) - Used for text on primary backgrounds.

### Backgrounds
- **App Background (Light):** `#f6f7f8` - The main canvas of the application.
- **App Background (Dark):** `#111821`
- **Card Background (Light):** `#ffffff` - Used for layout containers, sidebar, and floating elements.
- **Card Background (Dark):** `#1e293b`
- **Surface:** `#f9fafb` - Used for secondary backgrounds within cards, like table headers or slightly offset containers.

### Borders
- **Border:** `#e5e7eb` (Light grey) - Used for dividers, card borders, and separating sections.

### Alerts & Status Colors
- **Success/Active:** Green (`bg-green-100`, `text-green-600`, `bg-green-500` for dots)
- **Warning/Late:** Orange (`bg-orange-50`, `text-orange-600`)
- **Danger/Waste:** Red (`bg-red-50`, `text-red-500`)
- **Info/Stock:** Blue (`bg-blue-50`, `text-blue-600`)
- **Station Colors:** Various tailored colors (e.g., Amber for Grill, Purple for POS, Teal for Expo).

## 2.0 Typography

- **Font Family:** `Inter`, sans-serif.
- **Headings:** Bold (`font-bold`), dark text (`text-slate-900` or equivalent).
- **Subheadings/Labels:** Often uppercase, extra small (`text-xs`), bold (`font-bold`), and widely spaced (`tracking-wider`) in a muted color (`text-slate-500`).
- **Body Text:** Standard sizing, legible (`text-slate-600` or similar).

## 3.0 Component Styling (Shadcn Customization)

When using Shadcn UI, adapt the following to match the Stitch design:

### Cards (`<Card>`)
- Base styling: `bg-card border-border shadow-sm rounded-2xl`
- Headers usually have extra padding removed or adjusted depending on content, often displaying an uppercase muted label or a bold title with an adjacent action or stat.

### Buttons (`<Button>`)
- **Primary Variant:** `bg-primary text-white font-bold rounded-lg`. Use `transition-colors` or `transition-opacity` on hover.
- **Outline Variant:** `border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-semibold shadow-sm rounded-xl`.
- **Ghost/Icon Variant:** `text-slate-500 hover:text-primary transition-colors`.

### Tables
- **Header:** `bg-surface` or `bg-slate-50` with uppercase, bold, `text-xs`, `tracking-wider`, `text-slate-500` column names.
- **Rows:** `hover:bg-slate-50/50 transition-colors border-b border-border`.

### Badges/Tags
- Highly rounded (`rounded-full`), small text (`text-[10px]`), bold, uppercase, tracking wider.
- Colors derive from the specific status or job type (e.g., `bg-primary/10 text-primary`).

## 4.0 Layout & Spacing

- **Sidebar:** Full height (`h-screen`), fixed width (`w-64`), white background, right border.
- **Header:** Fixed height (e.g., `h-16`), white background, bottom border, flex layout (between).
- **Main Content Area:** Grey background, padding around content (e.g., `p-6` or `p-8`), scrollable.
- **Cards/Grids:** Use CSS grid (`grid-cols-12` or similar) with consistent gap sizing (`gap-6`).

## 5.0 Custom Elements
- **Scrollbar:** The app uses a thin, subtle custom scrollbar:
  ```css
  .custom-scrollbar::-webkit-scrollbar { width: 4px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
  ```
