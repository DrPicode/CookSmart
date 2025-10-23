<div align="center">
  <h1>� CookSmart</h1>
  <p><strong>Your intelligent cooking companion - Manage ingredients, prioritize recipes by expiration, and shop smarter.</strong></p>
  
  ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
  ![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat&logo=react&logoColor=black)
  ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
  ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
  ![PWA](https://img.shields.io/badge/PWA-Installable-5A0FC8?style=flat&logo=pwa&logoColor=white)
  
  <br/>
  
  **📱 [Try CookSmart Now](https://cook-smart-rosy.vercel.app/)**
  
</div>

---

## 🎯 What is it?

Mobile-first app to:
- 📦 Track ingredients (price, stock, expiry)
- 🍳 Show only doable recipes
- ⏰ Prioritize by earliest expiry
- 🛒 Smart shopping checklist + subtotal
- 📊 Keep purchase history

Optimized for quick daily use on phone (fast + offline-capable).

---

## ✨ Key Features

**Ingredients (Courses)** 📦 • Prices, expiration dates, warning icon (⚠️) when soon/expired • Custom categories • Inline manage mode  
**Recipes** 🍳 • Smart filtering (only doable recipes shown) • Auto-prioritization by earliest expiring ingredient  
**Shopping** 🛒 • Interactive checklist • Real-time subtotal • History tracking  
**Backup** 💾 • JSON export/import • Versioned schema with validation  
**i18n** 🌐 • FR/EN support • Instant language toggle  
**Tutorial** 🎓 • Interactive guide on first launch

---

## 🏗️ Tech Stack

**TypeScript** • **React 18** • **Vite** • **Tailwind CSS** • **localStorage**

### Project Structure
```
src/
├── components/      # React UI components
├── hooks/          # Custom hooks (business logic)
├── lib/            # Services (export/import)
├── types/          # TypeScript definitions
├── utils/          # Utility functions (expiry calc)
└── data/           # Static data (demo data)
```

**Architecture**: Hooks for logic, components for UI, strong typing everywhere.

---

## 🚀 Installation / Run

### Prerequisites
- Node.js 16+ and npm

### Quick Start
```bash
# Clone the repository
git clone https://github.com/DrPicode/CookSmart.git
cd CookSmart

# Install dependencies
npm install

# Start development server
npm run dev
```

Dev server: **http://localhost:5173** (auto reload)

### Production Build (local)
```bash
# Compile for production
npm run build

# Preview the build
npm run preview
```

Output in `dist/`.

### Windows (PowerShell) Notes
If `curl` shows HTML, try `curl.exe` (native) or use a browser DevTools fetch.

---

## 📱 Usage

**Ingredients** 📦 → Track stock, toggle availability, see expiry date + days remaining (⚠️ when soon / expired) → Tap "Modifier / Manage" to edit / import / export  
**Recipes** 🍳 → View doable dishes → Sorted by expiration urgency → Expiry badges  
**Shopping** 🛒 → Check ingredients → Auto-calculated subtotal → Validate to save  
**History** 📊 → View past purchases → Batch delete sessions  

**First launch**: Choose demo data or start from scratch (customizable in `src/data/demoData.json`)

---

## 🧠 Prioritization Logic

Recipes are sorted by earliest ingredient expiration:
* **Expired** (negative days) → Highest priority, red badge
* **Soon** (0–3 days) → Orange badge (`J0`, `J-1`, etc.)
* **Later** (> threshold) → No badge

Ingredients list shows localized date + days remaining and a ⚠️ icon for soon / expired items.

---

## 👨‍💻 Development

**Translations**: Edit `src/hooks/useTranslations.ts`  
**New Tab**: Create component → Update `App.tsx` type → Add to `TabsBar.tsx`  
**Types**: Add to `src/types/index.ts`  
**Logic**: Extend hooks in `src/hooks/`  

**Best Practices**: Hooks for logic, components for UI, memoization, strong typing

---

## 💾 Data

**Format**: Versioned JSON (schema v1.3.0)  
**Storage**: localStorage (ingredients, recipes, categories, history, preferences)  
**Export/Import**: Full backup with validation & auto-migration  
**Types**: See `src/types/index.ts` for full TypeScript definitions

---

## � PWA (Progressive Web App)

This app is a **fully installable PWA**! You can:
- **Install it** on your smartphone or desktop (Add to Home Screen)
- **Use it offline** thanks to service workers
- **Fast loading** with smart caching
- **Native app experience** without going through an app store

The PWA is automatically configured via `vite-plugin-pwa` with:
- Automatic updates
- Offline support for all resources
- App manifest with icons
- Service worker for caching

### 🔔 Expiry Notifications (Foreground & Background)

CookSmart alerts you when ingredients are expired or about to expire.

Foreground notifications:
- Hook `useExpiryNotifications` scans ingredients shortly after load and then periodically while the app is open.
- Fires local notifications (Web Notifications API) at most once per day per category (soon / expired).

Background Web Push:
- SW handles `push` even app closed.
- `usePushNotifications` fetches VAPID key + subscribes.
- Serverless API (Vercel) stores + broadcasts via `web-push`.
- Daily Cron `/api/push/check-expiry` builds expiry notifications.

File overview:
- `src/hooks/usePushNotifications.ts`: permission + subscription logic
- `src/sw-custom.ts`: service worker push & notificationclick handlers
- `api/push/*`: API routes (`vapid-public`, `subscribe`, `send`, `check-expiry`)
- `vercel.json`: cron configuration
 - `src/components/PushNotificationsToggle.tsx`: UI to activate background push

Local push test:
1. `npm run vapid:gen` (or node script) → copy keys into `.env.local`.
2. `vercel dev` (API on :3000) + `npm run dev` (Vite :5173) if not proxied.
3. Open app, enable notifications, watch console.
4. POST JSON `{ "title":"Test" }` to `/api/push/send`.

Production:
1. Add env vars (all envs) in Vercel: `PUSH_VAPID_PUBLIC_KEY`, `PUSH_VAPID_PRIVATE_KEY`.
2. Deploy → check `/api/push/vapid-public` returns key.
3. Ensure deployment protection disabled for public access.
4. Cron (08:00 UTC) hits `/api/push/check-expiry`.

Cleanup: invalid endpoints removed on 404/410 responses.

Unsubscribing (future enhancement):
- Implement endpoint to remove subscription by `endpoint` when user disables notifications.

---

## ☁️ Vercel Deployment (Quick)

1. Repo: push to GitHub (or import in Vercel UI).
2. Install dependencies locally: `npm install` (build step: `npm run build`).
3. Set Environment Variables (Settings > Environment Variables):
  - `PUSH_VAPID_PUBLIC_KEY` (Development, Preview, Production)
  - `PUSH_VAPID_PRIVATE_KEY` (same scopes)
4. (Optional) Cron already defined in `vercel.json` → auto-active after deploy.
5. Deploy:
  - Preview (PR / `npx vercel`)
  - Production (`npx vercel --prod`)
6. Verify:
  - `curl https://<deploy>/api/push/vapid-public` returns `{ publicKey: ... }`
  - Open site → toggle push notifications → send test `/api/push/send`.
7. If you see auth HTML → disable Deployment Protection.

CLI helpers:
```
npx vercel env ls
npx vercel env pull .env.vercel
```

Rollback: Vercel Deployments page → Promote previous.

---

## 🤝 Contributing

Contributions welcome! Use conventional commits (`feat:`, `fix:`, `refactor:`, `docs:`, etc.)

1. Fork → 2. Create branch → 3. Commit → 4. Push → 5. Pull Request

---

## 📄 License & Notes

**ISC License** • Local-only app (no backend) • Personal use • All data in localStorage • Privacy-first

---

<div align="center">
  <p><strong>Happy cooking & less waste! 👨‍🍳✨</strong></p>
  <p><em>Developed with ❤️ for smart cooking</em></p>
</div>
