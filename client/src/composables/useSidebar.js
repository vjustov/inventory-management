import { ref, watch } from 'vue'

const STORAGE_KEY = 'sidebar.collapsed'

// Read once at module load so every consumer shares the same state.
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
    // Persistence is best effort.
  }
})

export function useSidebar() {
  const toggleCollapsed = () => { collapsed.value = !collapsed.value }
  const openMobile = () => { mobileOpen.value = true }
  const closeMobile = () => { mobileOpen.value = false }

  return { collapsed, mobileOpen, toggleCollapsed, openMobile, closeMobile }
}
