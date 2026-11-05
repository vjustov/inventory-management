---
name: saas-sidebar-redesign
description: Redesign a Vue 3 app's shell into a modern SaaS layout with a vertical left sidebar instead of a top nav, a spacing and color token system, and a polished look. Use when the user asks to redesign UI, replace the top nav with a sidebar, get a SaaS look, or standardize spacing and styling in a Vue 3 app.
---

# SaaS Sidebar Redesign

Restyle a Vue 3 app's shell: top nav becomes a left sidebar, global styles move to tokens, and layout stops depending on the old nav height. Work shell first, then per-view cleanup.

Reference files:
- `references/design-tokens.md`: token names, values, and the hex-to-variable mapping.
- `references/sidebar-recipe.md`: code skeletons for the sidebar, state composable, and grid shell.

## Rules

- Delegate every significant `.vue` edit to the `vue-expert` agent when the repo defines one (this repo's `CLAUDE.md` requires it).
- Match the component style of the file you edit. Options API with `setup()` and `<script setup>` both occur. Do not convert files.
- No emoji in UI. Use inline SVG icons. Do not add an icon package without asking.
- No new npm registries or private URLs. Keep `.npmrc` as is.
- Keep changes reviewable: shell in one pass, per-view token replacement in a second pass.
- Add every new visible string to every locale file. Do not hardcode labels.

## Workflow

### 1. Discover

Find these before editing, and list the findings to the user:

- App shell: the component that renders the header or nav (often `App.vue`).
- Router and nav items: `main.js` or `router/index.js`, plus the nav markup.
- Global styles: unscoped `<style>` blocks, `:root` variables (none is typical).
- i18n: where `t('nav.*')` keys come from and which locales exist.
- Nav-height coupling: `position: sticky|fixed`, `top: <n>px`, fixed header heights, `100vh` math. Grep for `sticky`, `fixed`, and `top:`.
- Modals: `position: fixed` overlays and their z-index values.
- Component style: count files with `<script setup>` vs `export default { setup() }`. Mixed styles are common. Match each file.
- Footer widgets: any dropdown that will move into the sidebar footer. Dropdowns anchored `right: 0` and wider than the sidebar overflow it. Note them for step 3.

Quote globs in grep: `grep -rn --include='*.vue' ...`. The unquoted form fails in zsh.

### 2. Tokens

Create `src/styles/tokens.css` and import it once in the entry file. Define:

- Color: surface, surface-muted, border, text, text-muted, accent, accent-soft, danger, success, warning. Seed values from the most frequent hex literals in the app (see `references/design-tokens.md`).
- Spacing: a 4px scale (`--space-1` to `--space-8`).
- Radius, shadow, type size, and line height.
- Layout: `--sidebar-w`, `--sidebar-w-collapsed`, `--topbar-h`.
- Z-index: `--z-sidebar`, `--z-topbar`, `--z-overlay`, `--z-modal`. Modals sit above the sidebar.

Replace hex literals in the shell and shared styles only. Leave per-view literals for pass two.

### 3. Sidebar component

Create `AppSidebar.vue` with:

- A brand block at the top.
- A `<nav aria-label="Main">` with one `router-link` per route. Each item has an inline SVG icon and a label from `t()`.
- Active state with the `router-link-exact-active` class, not `router-link-active`. The non-exact class lights up `/` on every route.
- A collapse toggle with `aria-expanded` and `aria-controls`. Use an SVG chevron, not a text glyph.
- Hide labels in collapsed mode with CSS under `min-width: 901px`, not `v-if`. On mobile the drawer always shows labels, so a `v-if` tied to `collapsed` would hide them there too.
- A footer slot for the language switcher and profile menu. If a footer dropdown opens downward or is wider than the sidebar, override it with `:deep()` so it opens upward and fits.

### 4. Shell layout

Convert the shell to a CSS grid:

```
grid-template-columns: var(--sidebar-w) 1fr;
min-height: 100vh;
```

Remove the top nav. Move the page filter bar into the content column and set its sticky `top` to `0` (or `var(--topbar-h)` if a mobile bar exists). Remove hardcoded `top: 70px` in every component.

### 5. Sidebar state

Create `composables/useSidebar.js` in the same shared-refs style as `useFilters.js`:

- `collapsed`: persisted to `localStorage` under one key, read once at module load.
- `mobileOpen`: not persisted.
- Export `toggleCollapsed`, `openMobile`, `closeMobile`.

### 6. Responsive

At `max-width: 900px`:

- The sidebar becomes an off-canvas drawer with a backdrop.
- A slim top bar shows a hamburger button with `aria-expanded`.
- A backdrop element sits behind the drawer. Its z-index is `var(--z-overlay)`. The drawer's z-index is `calc(var(--z-overlay) + 1)`.
- Animate with `transform` and `visibility` together, not `visibility` alone, or the close slide is skipped.
- The drawer closes on route change, on Escape, and on backdrop click.
- Remove the existing `.app` and `.main-content` rules in the same pass. Two rules for one selector conflict.

### 7. Polish checklist

- Spacing uses only the token scale.
- One page-header pattern and one card pattern (border, radius, shadow).
- `:focus-visible` rings on links, buttons, and selects.
- `prefers-reduced-motion` disables transitions.
- Landmarks: `<nav aria-label>`, `<main>`.
- Modals render above the sidebar.
- All new labels exist in every locale.

### 8. Verify

- `npm run build` passes.
- The dev server shows the sidebar on every route.
- Check at 1440px and 390px wide.
- Open each modal.
- The browser console has no new errors.
- Japanese locale shows translated labels.
