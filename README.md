<div align="center">
  <h1>🍽️ Recipe Manager</h1>
  <p><strong>Smart mobile-first app to manage your ingredients, prioritize recipes by expiration, and optimize your shopping.</strong></p>
  
  ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
  ![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat&logo=react&logoColor=black)
  ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
  ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
</div>

---

## 📋 Table of Contents
- [Overview](#-overview)
- [Key Features](#-key-features)
- [Technical Architecture](#-technical-architecture)
- [Installation](#-installation)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [Prioritization Logic](#-prioritization-logic)
- [Development Guide](#-development-guide)
- [Data Export/Import](#-data-exportimport)

---

## 🎯 Overview

**Recipe Manager** helps you:
- 📦 **Manage your pantry**: Track ingredients with prices, portions, and expiration dates
- 🍳 **Cook smartly**: Instantly discover which dishes you can prepare with what you have
- ⏰ **Reduce waste**: Recipes using ingredients close to expiration are automatically prioritized
- 🛒 **Optimize shopping**: Interactive shopping list with real-time subtotal calculation
- 📊 **Track purchases**: Detailed history of all your shopping sessions

Perfect for daily use on smartphone, with an interface designed to be fast and efficient, even in-store.

---

## ✨ Key Features

### 📦 Ingredient Management
- ✅ Add/edit/delete ingredients
- 💰 Unit price and available portions
- 📅 **Expiration dates** for fresh products with visual alerts
- 🗂️ Organization by customizable categories (Groceries, Fresh Products, Frozen, etc.)
- 🏷️ Configurable "fresh" categories to enable expiration alerts

### 🍳 Recipe Management
- ➕ Complete recipe creation with ingredient lists
- ✏️ Easy editing and deletion
- 🎨 Automatic recipe categorization (Salads, Pasta/Rice, Frozen, etc.)
- 🔍 **Smart filtering**: only recipes that can be made immediately (all ingredients in stock) are displayed
- ⚠️ **Expiration-based prioritization**: recipes using ingredients close to expiration appear first with urgency badge
- 🏷️ Visual badges: `EXPIRED`, `D0`, `D-1`, `D-2`, etc.

### 🛒 Smart Shopping List
- 📋 Interactive list with checkboxes
- 💵 **Automatic subtotal calculation** as you select items
- 📊 Visual progress bar
- 📅 **Expiration date input** when purchasing fresh products
- ✅ Session validation with automatic history saving

### 📚 Shopping History
- 📆 All recorded sessions with date, item list, and total
- 🗑️ Individual deletion or multiple selection
- 🧹 Complete history purge option
- 💾 Permanent storage in localStorage

### 🔄 Export/Import & Backup
- 💾 **Versioned JSON export** (current schema: `1.3.0`)
- 📥 Import with complete validation (version, types, consistency)
- 🔒 Verification of referenced ingredient existence
- ♻️ Automatic migration between schema versions
- 🗂️ Complete backup: ingredients, categories, recipes, history

### 🌐 Multilingual
- 🇫🇷 French / 🇬🇧 English
- 🔄 Instant toggle with saved preference
- 📝 Extensible architecture to add more languages

### 🎓 Integrated Tutorial
- 📖 Interactive guide on first launch
- ❓ Help button accessible at any time
- 🎯 Contextual explanations for each feature

---

## 🏗️ Technical Architecture

### Technology Stack
| Component | Technology | Version |
|-----------|-------------|---------|
| **Language** | TypeScript | 5.0+ |
| **UI Framework** | React | 18.2 |
| **Build Tool** | Vite | 4.4+ |
| **Styling** | Tailwind CSS | 3.3+ |
| **Icons** | lucide-react | 0.292+ |
| **UI Components** | @headlessui/react | 2.2+ |
| **Persistence** | localStorage | Browser native |

### Modular Architecture (Refactor 2025-10)

The code is organized following a clear architecture separating business logic and presentation:

#### 🎣 Custom Hooks (Business Logic)
```
src/hooks/
├── usePersistentState.ts    # Automatic localStorage synchronization
├── useTranslations.ts        # i18n with memoization
├── useRecipes.ts             # Recipe filtering and prioritization logic
├── useShopping.ts            # State and actions for shopping workflow
└── useManagement.ts          # Category management and import/export
```

#### 🧩 Components (User Interface)
```
src/components/
├── TabsBar.tsx               # Main navigation (4 tabs)
├── RecipesTab.tsx            # Display of possible recipes
├── RecipeGroup.tsx           # Recipe group by category
├── CoursesTab.tsx            # Shopping selection interface
├── ShoppingOverlay.tsx       # Shopping validation overlay
├── HistoryTab.tsx            # Shopping session history
├── ManageTab.tsx             # Ingredient and category management
├── CategoryIngredients.tsx   # Ingredient list by category
└── HelpTutorial.tsx          # Tutorial and contextual help
```

#### 📂 Utilities and Types
```
src/
├── types.ts                  # Centralized TypeScript types
├── exportImport.ts           # Export/import logic with validation
└── utils/
    └── expiry.ts             # Expiration calculations and recipe scoring
```

### Architecture Principles

- **Separation of Concerns**: Hooks handle logic, components handle display
- **Pure Hooks**: No DOM manipulation, only state and computations
- **Lightweight Components**: Delegate complex calculations to hooks
- **Memoization**: Use `useMemo` to optimize performance
- **Strong Typing**: TypeScript everywhere for safety and maintainability

---

## 🚀 Installation

### Prerequisites
- Node.js 16+ and npm

### Quick Installation
```bash
# Clone the repository
git clone https://github.com/DrPicode/Recipe-Manager.git
cd Recipe-Manager

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at **http://localhost:5173**

### Production Build
```bash
# Compile for production
npm run build

# Preview the build
npm run preview
```

Compiled files will be in the `dist/` folder.

---

## 📱 Usage

### 1️⃣ **Shopping** Tab 🛒
- Check the ingredients you want to buy
- The subtotal is calculated automatically
- For fresh products, enter an expiration date
- Validate to save the session in history

### 2️⃣ **Recipes** Tab 🍳
- View all recipes that are **immediately doable**
- Recipes with ingredients close to expiration appear at the top with an urgency badge
- Expired or nearly expired ingredients are highlighted
- Recipes organized by category for easy navigation

### 3️⃣ **Management** Tab ⚙️
- **Ingredients**: Add new ingredients with price and portions
- **Recipes**: Create your own recipes with ingredient list
- **Categories**: Rename ingredient and recipe categories
- **Fresh Categories**: Define which categories require expiration tracking
- **Export/Import**: Save and restore your data
- **Reset**: Clear all data to start fresh

### 4️⃣ **History** Tab 📊
- View all your past shopping sessions
- Each session displays: date, item list, total amount
- Multiple selection for batch deletion
- Purge button to clear entire history

---

## 🧠 Prioritization Logic

### How does expiration-based sorting work?

The recipe prioritization algorithm follows this logic:

1. **Filtering**: Only recipes where **all** ingredients are in stock are considered

2. **Priority Calculation**: For each recipe, identify the ingredient with the closest expiration date
   ```typescript
   earliestExpiryDays(recipe, ingredients) → number | null
   ```

3. **Smart Sorting**:
   - ❌ **Expired ingredients** (negative values) → Top priority
   - ⚠️ **Expires soon** (0-7 days) → High priority
   - ✅ **No date** or **expires later** → Normal priority

4. **Visual Display**:
   - `EXPIRED` badge (red) for expired ingredients
   - `D0` to `D-7` badge (orange) for imminent expiration
   - **Orange outline** on the most urgent ingredient of each recipe

### Scoring Example
```typescript
// Ingredient expired 2 days ago
earliestExpiryDays = -2  → "EXPIRED" badge → Maximum priority

// Ingredient expires today
earliestExpiryDays = 0   → "D0" badge → Very high priority

// Ingredient expires in 3 days
earliestExpiryDays = 3   → "D-3" badge → High priority

// No expiration date
earliestExpiryDays = null → No badge → Normal priority
```

---

## 👨‍💻 Development Guide

### Adding a New Translation

Edit `src/hooks/useTranslations.ts`:
```typescript
const translations = {
  fr: {
    myNewKey: 'Ma nouvelle traduction',
    // ...
  },
  en: {
    myNewKey: 'My new translation',
    // ...
  }
};
```

Use it in a component:
```tsx
const { t } = useTranslations(lang);
return <p>{t('myNewKey')}</p>;
```

### Creating a New Tab

1. Create the component in `src/components/MyTab.tsx`
2. Add the type in `App.tsx`:
   ```typescript
   type Tab = 'courses' | 'recettes' | 'gestion' | 'historique' | 'myTab';
   ```
3. Add the tab in `TabsBar.tsx`
4. Handle rendering in `App.tsx`

### Extending Shopping Logic

Modify `src/hooks/useShopping.ts` to add new states or actions:
```typescript
export function useShopping() {
  const [myNewState, setMyNewState] = useState(...);
  
  const myNewAction = () => {
    // Logic
  };
  
  return {
    // Existing states
    myNewState,
    myNewAction,
  };
}
```

### Best Practices

- ✅ **Create a hook** for any reusable logic (calculations, effects)
- ✅ **Lightweight components**: delegate complex calculations to hooks
- ✅ **Memoization**: use `useMemo` to avoid unnecessary recalculations
- ✅ **Strong types**: type all props and states
- ❌ **Avoid** DOM manipulation in hooks
- ❌ **Avoid** business logic in components

---

## 💾 Data Export/Import

### Data Format (schema v1.3.0)

```typescript
{
  version: '1.3.0',
  exportedAt: '2025-10-21T10:30:00.000Z',
  ingredients: {
    'Tomatoes': { inStock: true, price: 2.50, parts: 4, expiryDate: '2025-10-25' },
    // ...
  },
  categories: {
    '🥦 Vegetables': ['Tomatoes', 'Carrots'],
    // ...
  },
  recettes: [
    { nom: 'Salad', categorie: '🥗 Starters', ingredients: ['Tomatoes', 'Cucumber'] },
    // ...
  ],
  shoppingHistory: [
    { id: 'uuid', date: '2025-10-20T18:00:00.000Z', items: ['Tomatoes', 'Bread'], total: 5.20 },
    // ...
  ],
  recipeCategories: ['🥗 Starters', '🍝 Main Courses', '🍰 Desserts'],
  freshCategories: ['🥦 Vegetables', '🧀 Fresh Products']
}
```

### Import Validation

Import automatically performs:
- ✅ Schema version verification
- ✅ Data type validation
- ✅ Referenced ingredient existence check
- ✅ Automatic migration from older versions
- ⚠️ Warnings for missing or inconsistent data

### localStorage Structure

| Key | Type | Description |
|-----|------|-------------|
| `ingredients` | `IngredientsType` | All ingredients with stock, price, parts, expiration |
| `categories` | `CategoriesType` | Ingredient categories with lists |
| `recettes` | `RecipeType[]` | All recipes |
| `recipeCategories` | `string[]` | Recipe category list |
| `freshCategories` | `string[]` | Categories requiring expiration tracking |
| `shoppingHistory` | `ShoppingSession[]` | Shopping session history |
| `lang` | `'fr' \| 'en'` | Language preference |
| `tutorialSeen` | `'1'` | Tutorial seen flag |

---

## 📊 Data Model

### TypeScript Types

```typescript
// Ingredient
type IngredientsType = {
  [key: string]: {
    inStock: boolean;
    price: number;
    parts: number;
    expiryDate?: string;        // ISO 8601 format
    remainingParts?: number;
  }
};

// Ingredient Categories
type CategoriesType = {
  [category: string]: string[];  // Ingredient names
};

// Recipe
type RecipeType = {
  nom: string;
  categorie: string;
  ingredients: string[];         // Required ingredient names
};

// Shopping Session
type ShoppingSession = {
  id: string;                    // UUID
  date: string;                  // ISO 8601
  items: string[];               // Purchased ingredient names
  total: number;                 // Total amount
};
```

---

## 🎨 Design & UX

### Design Principles
- 📱 **Mobile-first**: Interface optimized for smartphone
- 👆 **Touch-friendly**: Large and spaced click zones
- 🎯 **Quick usage**: Minimal clicks for common actions
- 🔆 **High contrast**: Readable in all conditions
- ⚡ **Performance**: Instant loading, no latency

### Accessibility
- Icons accompanied by text
- Contrasted colors respecting WCAG 2.1
- Clear visual states (hover, active, disabled)
- Keyboard navigation possible

---

## 🗺️ Roadmap

### 🚧 In Progress
- ✅ Integrated tutorial system
- ✅ Modular architecture with custom hooks
- ✅ FR/EN multilingual support

### 📋 Planned (Short Term)
- [ ] **Dark Mode**: Dark/light theme with system detection
- [ ] **Virtualization**: Optimization for very long lists
- [ ] **Consumption Stats**: Monthly charts
- [ ] **History Filters**: Search by date, amount, items
- [ ] **Full PWA**: Installation, advanced offline mode

### 🔮 Vision (Long Term)
- [ ] **Multi-device Sync**: Optional backend with sync
- [ ] **Recipe Suggestions**: AI-based recommendations
- [ ] **Consumption Tracking**: Remaining portions tracking
- [ ] **Calendar Integration**: Meal planning
- [ ] **List Sharing**: Collaborative shopping

---

## 🤝 Contributing

Contributions are welcome!

### Commit Format
Use conventional prefixes:
- `feat:` New feature
- `fix:` Bug fix
- `refactor:` Refactoring without functional change
- `docs:` Documentation
- `perf:` Performance improvement
- `chore:` Maintenance (dependencies, config, etc.)

### Process
1. Fork the project
2. Create a branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

**ISC License** - See LICENSE file for details

---

## ⚠️ Important Notes

- 📱 **Local Application**: All data is stored locally (no backend)
- 👤 **Personal Use**: No multi-user management or concurrency
- 💰 **Indicative Prices**: No package size or real price management
- 🔒 **Privacy**: No data sent to external servers

---

<div align="center">
  <p><strong>Happy cooking & less waste! 👨‍🍳✨</strong></p>
  <p><em>Developed with ❤️ for smart cooking</em></p>
</div>
