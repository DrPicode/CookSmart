<div align="center">
  <h1>CookSmart</h1>
  <p><strong>Track ingredients, avoid waste, cook what you can today.</strong></p>
  <br/>
  📱 <a href="https://cook-smart-rosy.vercel.app/">Try it live</a>
</div>

---

## 1. Overview
CookSmart is a lightweight, mobile‑first cooking assistant:
- Track ingredients (stock, price, expiry)
- See only recipes you can actually make
- Prioritize by what will expire first
- Build a shopping checklist with running total
- Keep simple purchase history

Fast, offline‑capable, installable as a PWA.

---

## 2. Features (Quick Glance)
- Ingredients: expiry badges + warning icon ⚠️, categories, inline manage mode
- Recipes: auto hide if missing ingredients, sorted by urgency
- Shopping: interactive checklist + subtotal + history log
- Backup: one‑click JSON export / import (versioned & validated)
- Language: EN / FR instant switch
- Onboarding: short interactive tutorial
- Notifications: optional expiry reminders (foreground + push)

---

## 3. Install & Run
Requires Node.js 16+.

```bash
git clone https://github.com/DrPicode/CookSmart.git
cd CookSmart
npm install
npm run dev   # http://localhost:5173
```

Build / preview:
```bash
npm run build
npm run preview
```

---

## 4. How To Use
First launch: pick demo data or start empty.

Tabs:
- Ingredients: edit stock & expiry; manage/import/export in Manage mode.
- Recipes: only doable ones show; urgency = earliest linked expiry.
- Shopping: check items; subtotal updates; validate to save to history.
- History: list past shopping sessions; bulk delete.
- Settings: language, notifications, install prompt.

Expiry badges: red = expired, orange = soon, none = fine.

---

## 5. Data & Backup
Stored in localStorage (ingredients, recipes, categories, history, preferences). Schema is versioned and migrates automatically on import. Export gives a single JSON file; re‑import restores everything. Types live in `src/types/index.ts`.

---

## 6. Contribute
PRs welcome. Conventional commits appreciated (`feat:`, `fix:`, `docs:`...).
Fork → branch → commit → PR.

---

## 7. License
ISC License. All data local (privacy‑friendly).

---
<div align="center">
  <em>Cook what you have. Waste less. 👨‍🍳</em>
</div>
