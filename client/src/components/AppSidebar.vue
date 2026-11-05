<template>
  <div class="sidebar-wrap">
    <div
      v-if="mobileOpen"
      class="sidebar-backdrop"
      aria-hidden="true"
      @click="closeMobile"
    ></div>

    <aside
      id="app-sidebar"
      class="sidebar"
      :class="{ collapsed, 'mobile-open': mobileOpen }"
    >
      <div class="brand">
        <span class="brand-mark" aria-hidden="true">CC</span>
        <div class="brand-text">
          <span class="brand-name">{{ t('nav.companyName') }}</span>
          <span class="brand-subtitle">{{ t('nav.subtitle') }}</span>
        </div>
      </div>

      <nav aria-label="Main" class="sidebar-nav">
        <ul class="nav-list">
          <li v-for="item in items" :key="item.to">
            <router-link
              :to="item.to"
              class="nav-link"
              :title="collapsed ? t(item.labelKey) : undefined"
            >
              <svg
                viewBox="0 0 24 24"
                class="nav-icon"
                aria-hidden="true"
                v-html="item.icon"
              />
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
        :aria-expanded="toggleExpanded.toString()"
        aria-controls="app-sidebar"
        :aria-label="toggleLabel"
        @click="onToggle"
      >
        <svg viewBox="0 0 24 24" class="nav-icon" aria-hidden="true">
          <path v-if="!toggleExpanded" d="M9 6l6 6-6 6" />
          <path v-else d="M15 6l-6 6 6 6" />
        </svg>
        <span class="nav-label">{{ toggleLabel }}</span>
      </button>
    </aside>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useSidebar } from '../composables/useSidebar'
import { useI18n } from '../composables/useI18n'

// Static SVG path strings, so v-html is safe. Never build these from user input.
const items = [
  { to: '/', labelKey: 'nav.overview', icon: '<rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>' },
  { to: '/inventory', labelKey: 'nav.inventory', icon: '<path d="M21 8l-9-5-9 5v8l9 5 9-5z"/><path d="M3 8l9 5 9-5"/><path d="M12 13v8"/>' },
  { to: '/orders', labelKey: 'nav.orders', icon: '<path d="M9 5h10v16H5V5h4"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h6"/>' },
  { to: '/spending', labelKey: 'nav.finance', icon: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>' },
  { to: '/demand', labelKey: 'nav.demandForecast', icon: '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>' },
  { to: '/reports', labelKey: 'nav.reports', icon: '<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h6"/>' }
]

export default {
  name: 'AppSidebar',
  setup() {
    const route = useRoute()
    const { collapsed, mobileOpen, toggleCollapsed, openMobile, closeMobile } = useSidebar()
    const { t } = useI18n()

    const onKeydown = (event) => {
      if (event.key === 'Escape' && mobileOpen.value) closeMobile()
    }

    // One toggle serves two states. At <=900px the sidebar is a permanent icon rail
    // and the toggle expands it into an overlay (mobileOpen, not persisted). On desktop
    // it resizes the in-flow sidebar (collapsed, persisted). CSS handles layout, but the
    // button's behavior and aria state depend on the breakpoint, so JS tracks it too.
    const isSmall = ref(false)
    let mql = null
    const onMqlChange = (event) => { isSmall.value = event.matches }

    const toggleExpanded = computed(() => (isSmall.value ? mobileOpen.value : !collapsed.value))
    const toggleLabel = computed(() => {
      if (isSmall.value) return mobileOpen.value ? t('nav.closeMenu') : t('nav.openMenu')
      return collapsed.value ? t('nav.expandSidebar') : t('nav.collapseSidebar')
    })
    const onToggle = () => {
      if (isSmall.value) {
        mobileOpen.value ? closeMobile() : openMobile()
      } else {
        toggleCollapsed()
      }
    }

    watch(() => route.path, closeMobile)
    onMounted(() => {
      document.addEventListener('keydown', onKeydown)
      mql = window.matchMedia('(max-width: 900px)')
      isSmall.value = mql.matches
      mql.addEventListener('change', onMqlChange)
    })
    onUnmounted(() => {
      document.removeEventListener('keydown', onKeydown)
      if (mql) mql.removeEventListener('change', onMqlChange)
    })

    return { collapsed, mobileOpen, closeMobile, items, t, toggleExpanded, toggleLabel, onToggle }
  }
}
</script>

<style scoped>
.sidebar-wrap {
  position: relative;
}

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

.brand {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  min-height: var(--topbar-h);
  border-bottom: 1px solid var(--color-border);
}

.brand-mark {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  background: var(--color-accent);
  color: var(--color-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
}

.brand-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.brand-name {
  font-size: var(--text-base);
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: -0.025em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.brand-subtitle {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-3);
}

.nav-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.nav-link,
.collapse-toggle {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  text-decoration: none;
  font-family: inherit;
  font-size: var(--text-base);
  font-weight: 500;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.nav-link:hover,
.collapse-toggle:hover {
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
  stroke-linecap: round;
  stroke-linejoin: round;
  flex-shrink: 0;
}

.nav-label {
  white-space: nowrap;
}

.sidebar-footer {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-3);
  border-top: 1px solid var(--color-border);
}

/* Footer controls are anchored to the bottom, so dropdowns open upward and stay inside the sidebar width. */
.sidebar-footer :deep(.language-button),
.sidebar-footer :deep(.profile-button) {
  width: 100%;
}

.sidebar-footer :deep(.dropdown-menu) {
  top: auto;
  bottom: calc(100% + var(--space-2));
  left: 0;
  right: auto;
  min-width: 0;
  width: max(100%, 200px);
}

.collapse-toggle {
  background: none;
  border: none;
  border-top: 1px solid var(--color-border);
  border-radius: 0;
  padding: var(--space-3) var(--space-4);
  cursor: pointer;
}

.sidebar-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  z-index: var(--z-overlay);
}

@media (min-width: 901px) {
  .sidebar.collapsed .brand-text,
  .sidebar.collapsed .nav-label,
  .sidebar.collapsed .sidebar-footer :deep(.profile-name),
  .sidebar.collapsed .sidebar-footer :deep(.language-label),
  .sidebar.collapsed .sidebar-footer :deep(.chevron) {
    display: none;
  }

  .sidebar.collapsed .nav-link,
  .sidebar.collapsed .collapse-toggle {
    justify-content: center;
  }

  .sidebar.collapsed .sidebar-footer :deep(.dropdown-menu) {
    width: 200px;
  }
}

/* The state can persist across a resize, so never show the backdrop on desktop. */
@media (min-width: 901px) {
  .sidebar-backdrop {
    display: none;
  }
}

@media (max-width: 900px) {
  /* Only the aside sticks. The wrap just fills the grid column. */
  .sidebar-wrap {
    position: static;
  }

  /* Rail: always in layout, icons only. */
  .sidebar,
  .sidebar.collapsed {
    position: sticky;
    top: 0;
    height: 100vh;
    width: var(--sidebar-w-collapsed);
    transition: transform 0.2s ease, visibility 0.2s ease;
  }

  /* :not(.mobile-open) lets the drawer show labels again without overriding display values. */
  .sidebar:not(.mobile-open) .brand-text,
  .sidebar:not(.mobile-open) .nav-label,
  .sidebar:not(.mobile-open) .sidebar-footer :deep(.profile-name),
  .sidebar:not(.mobile-open) .sidebar-footer :deep(.language-label),
  .sidebar:not(.mobile-open) .sidebar-footer :deep(.chevron) {
    display: none;
  }

  .sidebar:not(.mobile-open) .brand,
  .sidebar:not(.mobile-open) .nav-link,
  .sidebar:not(.mobile-open) .collapse-toggle {
    justify-content: center;
  }

  /* Rail is only 'collapsed-width', so a dropdown that opens upward would be clipped
     to the rail. Open it beside the rail, bottom-aligned with its trigger. */
  .sidebar:not(.mobile-open) .sidebar-footer :deep(.dropdown-menu) {
    left: calc(100% + var(--space-2));
    bottom: 0;
    top: auto;
    right: auto;
    width: 200px;
  }

  /* Expanded: labeled overlay drawer above the backdrop. */
  .sidebar.mobile-open,
  .sidebar.collapsed.mobile-open {
    position: fixed;
    inset: 0 auto 0 0;
    width: var(--sidebar-w);
    z-index: calc(var(--z-overlay) + 1);
    transform: translateX(0);
    visibility: visible;
  }

  /* In the drawer there is room, so restore the upward dropdown from the base rule. */
  .sidebar.mobile-open .sidebar-footer :deep(.dropdown-menu) {
    top: auto;
    bottom: calc(100% + var(--space-2));
    left: 0;
    right: auto;
    width: max(100%, 200px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .sidebar,
  .nav-link,
  .collapse-toggle {
    transition: none;
  }
}
</style>
