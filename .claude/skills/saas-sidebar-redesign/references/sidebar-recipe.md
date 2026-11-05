# Sidebar Recipe

Code skeletons for the shell. Written in Options API with `setup()`. For `<script setup>` files, move the same logic into top-level bindings and drop the `return` block.

## composables/useSidebar.js

```js
import { ref, watch } from 'vue'

const STORAGE_KEY = 'sidebar.collapsed'

// Read once at module load so every consumer shares the same state.
// Wrapped in try/catch because localStorage can throw in private mode or when disabled.
function readInitialCollapsed() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

const collapsed = ref(readInitialCollapsed())
const mobileOpen = ref(false)

watch(collapsed, (value) => {
  try {
    localStorage.setItem(STORAGE_KEY, String(value))
  } catch {
    // Persistence is best effort. The in-memory state still works.
  }
})

export function useSidebar() {
  const toggleCollapsed = () => { collapsed.value = !collapsed.value }
  const openMobile = () => { mobileOpen.value = true }
  const closeMobile = () => { mobileOpen.value = false }

  return { collapsed, mobileOpen, toggleCollapsed, openMobile, closeMobile }
}
```

## components/AppSidebar.vue (skeleton)

```vue
<template>
  <aside class="sidebar" :class="{ collapsed, 'mobile-open': mobileOpen }">
    <div class="brand">
      <span class="brand-mark" aria-hidden="true">IM</span>
      <span class="brand-text">{{ t('nav.companyName') }}</span>
    </div>

    <nav aria-label="Main">
      <ul class="nav-list">
        <li v-for="item in items" :key="item.to">
          <router-link
            :to="item.to"
            class="nav-link"
            :title="collapsed ? t(item.labelKey) : undefined"
          >
            <svg viewBox="0 0 24 24" class="nav-icon" aria-hidden="true" v-html="item.icon" />
            <span class="nav-label">{{ t(item.labelKey) }}</span>
          </router-link>
        </li>
      </ul>
    </nav>

    <div class="sidebar-footer">
      <slot name="footer" />
    </div>

    <button
      type="button"
      class="collapse-toggle"
      :aria-expanded="(!collapsed).toString()"
      aria-controls="app-sidebar"
      @click="toggleCollapsed"
    >
      <svg viewBox="0 0 24 24" class="toggle-icon" aria-hidden="true">
        <path :d="collapsed ? 'M9 6l6 6-6 6' : 'M15 6l-6 6 6 6'" />
      </svg>
    </button>
  </aside>
</template>

<script>
import { useSidebar } from '../composables/useSidebar'
import { useI18n } from '../composables/useI18n'

// Icons are static SVG path strings, so v-html is safe here. Never build this from user input.
const items = [
  { to: '/', labelKey: 'nav.overview', icon: '<path d="M3 12l9-9 9 9"/><path d="M5 10v10h14V10"/>' },
  { to: '/inventory', labelKey: 'nav.inventory', icon: '<path d="M3 7h18v12H3z"/><path d="M3 11h18"/>' },
  // Add one entry per route in main.js. Keep labelKey pointing at a key in every locale file.
]

export default {
  name: 'AppSidebar',
  setup() {
    const { collapsed, mobileOpen, toggleCollapsed } = useSidebar()
    const { t } = useI18n()
    return { collapsed, mobileOpen, toggleCollapsed, items, t }
  }
}
</script>

<style scoped>
.sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  width: var(--sidebar-w);
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  z-index: var(--z-sidebar);
  transition: width 0.2s ease;
}

.sidebar.collapsed {
  width: var(--sidebar-w-collapsed);
}

.nav-link {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  text-decoration: none;
}

.nav-link:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
}

.nav-link.router-link-exact-active {
  background: var(--color-accent-soft);
  color: var(--color-accent);
}

.nav-link:focus-visible,
.collapse-toggle:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.nav-icon {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  flex-shrink: 0;
}

/* Labels hide by CSS on desktop only. The mobile drawer always shows them. */
@media (min-width: 901px) {
  .sidebar.collapsed .nav-label,
  .sidebar.collapsed .brand-text {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .sidebar { transition: none; }
}
</style>
```

The `:aria-current` attribute is set automatically by `router-link` when the link is exact-active. Do not add it by hand.

## App.vue shell (grid)

Replace the `.top-nav` header with a two-column grid. Keep the existing `<router-view>` and modals.

```vue
<template>
  <div class="app-shell">
    <AppSidebar>
      <template #footer>
        <LanguageSwitcher />
        <ProfileMenu @show-profile-details="showProfileDetails = true" @show-tasks="showTasks = true" />
      </template>
    </AppSidebar>

    <div class="content-column">
      <FilterBar />
      <main class="main-content">
        <router-view />
      </main>
    </div>

    <!-- Existing modals stay here. They use --z-modal, so they sit above the sidebar. -->
  </div>
</template>
```

```css
.app-shell {
  display: grid;
  grid-template-columns: auto 1fr;
  min-height: 100vh;
}

.content-column {
  min-width: 0; /* lets wide tables scroll instead of pushing the grid */
  display: flex;
  flex-direction: column;
}

.main-content {
  padding: var(--space-6) var(--space-8);
  max-width: 1600px;
  width: 100%;
}
```

`FilterBar` must use `position: sticky; top: 0` inside `.content-column`. Remove any `top: 70px`.

## Mobile drawer

At `max-width: 900px`, switch the sidebar to `position: fixed`, transform it off-canvas, and show a backdrop and hamburger button:

```css
@media (max-width: 900px) {
  .sidebar {
    position: fixed;
    inset: 0 auto 0 0;
    transform: translateX(-100%);
    transition: transform 0.2s ease;
  }
  .sidebar.mobile-open { transform: translateX(0); }
}
```

Close the drawer on route change (`watch(() => route.path, closeMobile)`) and on Escape (`keydown` listener added in `mounted`, removed in `unmounted`). Set `aria-expanded` on the hamburger to the value of `mobileOpen`.
