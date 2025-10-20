<div align="center">
  <h1>🍽️ Recipe Manager</h1>
  <p>Mobile‑first app to manage pantry items, prioritize recipes, and streamline shopping.</p>
</div>

## 1. Goal
Know instantly what you can cook, reduce waste by consuming items that expire soon, and keep lightweight shopping history.

## 2. Features
| Area | Details |
|------|---------|
| Inventory | Add / edit / delete ingredients (price, portions, optional expiry date for fresh) |
| Categories | Rename dynamically, automatic regrouping of ingredients & recipes |
| Recipes | Full CRUD, auto-filter by stocked ingredients |
| Prioritization | Sort recipes by most urgent fresh ingredient (expired or J-n) + urgency badge |
| Shopping | Interactive list mode (selection, subtotal, progress bar, live expiry input when buying fresh) |
| History | Sessions logged (items, total); multi-select delete & full purge |
| Export / Import | Versioned JSON backup / restore (schema 1.1.0) |

## 3. Expiry-Based Recipe Ordering
Process:
1. Keep only recipes where all ingredients are in stock.
2. For each recipe compute the smallest days remaining among dated ingredients (`earliestExpiryDays`).
3. Negative values (expired) bubble to the top.
4. Recipes with no dated ingredient are placed last.

UI: badge `EXPIRED`, `D0`, or `D-#`. The driving ingredient has an orange outline.

## 4. Stack
| Layer | Tech |
|-------|------|
| Language | TypeScript |
| Framework | React |
| Dev / Build | Vite |
| Styling | Tailwind CSS |
| Icons | lucide-react |
| Persistence | localStorage |

## 5. Installation
```bash
git clone <repo>
cd Recipe-Manager
npm install
npm run dev
```
Open http://localhost:5173

Production build:
```bash
npm run build
npm run preview
```

## 6. Data Model (localStorage)
| Key | Shape |
|-----|-------|
| ingredients | `{ [name]: { inStock, price, parts, expiryDate? } }` |
| categories | `{ [category]: string[] }` |
| recettes | `[{ nom, categorie, ingredients[] }]` (French naming kept internally) |
| shoppingHistory | `[{ id, date, items[], total }]` |

## 7. Export / Import
Versioned JSON (current: `1.1.0`). Validation covers version, types and existence of referenced ingredients. Import fully replaces current data.

## 8. Shopping History
Each confirmed shopping session stores: `id`, ISO `date`, `items`, numeric `total`. You can multi-select for deletion or purge all.

## 9. Accessibility & Mobile
Single-column layout, large touch targets, high contrast, minimal friction for in‑store usage.

## 10. Roadmap (Short)
| Idea | Status |
|------|--------|
| List virtualization | Planned |
| Dark mode | Planned |
| Monthly stats / filters | Planned |
| PWA & advanced offline | Planned |
| Multi-device sync | Planned |
| Portion consumption tracking | Planned |

## 11. Contributing
PRs welcome. Suggested commit prefixes: `feat:`, `fix:`, `refactor:`, `docs:`, `perf:`, `chore:`.

## 12. License
ISC (adjust as needed).

## 13. Notes
No backend / multi-user concurrency. Prices are indicative, no package size management. Personal, fast usage focus.

---
Happy cooking & less waste 👨‍🍳
