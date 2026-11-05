# Design Tokens

Tokens live in `src/styles/tokens.css`, imported once in the entry file.

## Starter values

Seeded from the most frequent hex literals in this app (`#64748b`, `#e2e8f0`, `#0f172a`, `#3b82f6`, `#2563eb`, `#f1f5f9`, `#f8fafc`). Replace the values with the target brand if it differs.

```css
:root {
  /* Color */
  --color-surface: #ffffff;
  --color-surface-muted: #f8fafc;
  --color-surface-hover: #f1f5f9;
  --color-border: #e2e8f0;
  --color-border-strong: #cbd5e1;
  --color-text: #0f172a;
  --color-text-muted: #64748b;
  --color-accent: #2563eb;
  --color-accent-soft: #eff6ff;
  --color-danger: #dc2626;
  --color-success: #10b981;
  --color-warning: #ca8a04;

  /* Spacing (4px base) */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;

  /* Shape and depth */
  --radius-sm: 6px;
  --radius-md: 10px;
  --shadow-card: 0 1px 2px rgba(15, 23, 42, 0.04);
  --shadow-card-hover: 0 4px 12px rgba(15, 23, 42, 0.06);

  /* Type */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --text-sm: 0.875rem;
  --text-base: 0.938rem;
  --text-lg: 1.125rem;
  --text-2xl: 1.875rem;

  /* Layout */
  --sidebar-w: 248px;
  --sidebar-w-collapsed: 72px;
  --topbar-h: 56px;

  /* Z-index scale */
  --z-sidebar: 100;
  --z-topbar: 110;
  --z-overlay: 900;
  --z-modal: 1000;
}
```

## Hex-to-variable mapping

Replace literals with a mechanical map. Do this only in shell and shared styles in pass one.

| Literal | Token |
| --- | --- |
| `#ffffff`, `white` | `--color-surface` |
| `#f8fafc` | `--color-surface-muted` |
| `#f1f5f9` | `--color-surface-hover` |
| `#e2e8f0` | `--color-border` |
| `#cbd5e1` | `--color-border-strong` |
| `#0f172a` | `--color-text` |
| `#64748b` | `--color-text-muted` |
| `#2563eb` | `--color-accent` |
| `#eff6ff` | `--color-accent-soft` |
| `#dc2626` | `--color-danger` |
| `#10b981` | `--color-success` |

Find remaining literals with `grep -rhoE "#[0-9a-fA-F]{6}\b" src | sort | uniq -c | sort -rn`. Literals that match no token stay as they are and are reported.

## Derive from an existing palette

If the app already has a brand color, set `--color-accent` and `--color-accent-soft` from it first. Keep the other tokens as neutrals so the rest of the app stays legible.
