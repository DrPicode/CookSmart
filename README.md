<div align="center">
  <h1>🍽️ Recipe Manager (Mobile-first)</h1>
  <p>Gérez vos ingrédients, recettes, listes de courses et historique d'achats – simple, rapide, optimisé mobile.</p>
</div>

## ✨ Fonctionnalités principales

- 📦 Gestion d'ingrédients (stock, prix, parts, renommage, changement de catégorie)
- 🧾 Calcul automatique du prix estimé des courses & prix par part utilisé dans les recettes
- 🧑‍🍳 Liste de recettes filtrées dynamiquement selon les ingrédients en stock
- ✍️ CRUD complet recettes & ingrédients (édition inline, renommage catégories)
- 🛒 Mode "Démarrer les courses" avec :
  - Regroupement par catégorie
  - Ordre optimisé (frais & surgelés à la fin)
  - Sélection des articles achetés
  - Sous-total dynamique + progression
- 🗂️ Historique des sessions de courses (persisté dans localStorage)
  - Total dépensé / items achetés
  - Suppression individuelle ou multiple
  - Vidage complet

## 🧱 Tech Stack

| Élément | Choix |
|--------|-------|
| Framework | React + TypeScript |
| Bundler/Dev Server | Vite |
| UI | Tailwind CSS |
| Icônes | lucide-react |
| Persistance locale | localStorage (ingrédients, catégories, recettes, historique) |

## 🚀 Démarrage

### Prérequis
- Node.js >= 18
- npm ou pnpm ou yarn

### Installation & lancement

```bash
npm install
npm run dev
```

Ouvrir ensuite: http://localhost:5173 (port Vite par défaut)

### Build production

```bash
npm run build
npm run preview
```

## 🗄️ Structure des données (localStorage)

| Clé | Description | Exemple simplifié |
|-----|-------------|-------------------|
| `ingredients` | Dictionnaire des ingrédients | `{ "Riz": { inStock: true, price: 2.00, parts: 5 } }` |
| `categories` | Mapping Catégorie → [Ingrédients] | `{ "🥫 Épicerie salée": ["Riz", "Thon"] }` |
| `recettes` | Tableau de recettes | `[{ nom: "Riz au thon", categorie: "🍝 Pâtes / Riz / Crème", ingredients: ["Riz","Thon"] }]` |
| `shoppingHistory` | Sessions de courses | `[{ id, date, items, total }]` |

## 🔄 Cycle de vie & logique

1. Chargement initial: lecture localStorage sinon valeurs par défaut.
2. Chaque mutation d'état (ingredients, categories, recettes, historique) ré-écrit la clé correspondante.
3. Recettes disponibles = sous-ensemble dont tous les ingrédients sont `inStock`.
4. Mode courses :
   - On capture la liste des ingrédients manquants.
   - On coche ce qui est acheté (Set éphémère `shoppingSelected`).
   - En validation : mise à jour `inStock=true` + enregistrement de la session.

## 🛒 Détails du mode "Courses"

| Aspect | Description |
|--------|-------------|
| Ordonnancement | Catégories réordonnées pour garder frais & surgelés en dernier |
| Sous-total | Somme des prix des ingrédients cochés |
| Progression | `cochés / total manquants` (barre animée) |
| Annulation | Aucune modification persistée |
| Terminer | Mise à jour du stock + log historique |

## 🗂️ Historique

Chaque session contient :
- `id` unique
- `date` ISO (affichée en local format dd/mm/yyyy hh:mm)
- `items` (liste des ingrédients achetés)
- `total` arrondi à 2 décimales

Fonctions disponibles :
- Gérer → mode sélection avec cases à cocher
- Suppression simple / multiple
- Vider l'historique complet

## 🧪 Idées d'amélioration (Roadmap)

- [ ] Export / import JSON (sauvegarde / restauration)
- [ ] Détail modal d'une session (liste complète des ingrédients)
- [ ] Ajout d'un champ "magasin" et "notes"
- [ ] Filtre par période + stats (total mensuel, dépense moyenne)
- [ ] Mode dark
- [ ] Optimisation mémoire (compression dans localStorage)
- [ ] PWA (installation sur écran d'accueil)
- [ ] Synchronisation multi-appareils (backend léger / Firestore)

## ♿ Accessibilité / Mobile

- Layout single-column mobile-first.
- Zones tactiles ≥ 40px.
- Contrastes (gris vs accent) adaptables.
- Focus management simplifié (autofocus sur champs d'édition).

## ⚠️ Limitations actuelles

- Pas de contrôle de concurrence (un seul navigateur à la fois).
- Pas de distinction "prix réel en caisse" vs estimé.
- Pas de variation de prix par quantité/format.

## 🤝 Contribution

1. Fork & branch
2. Implémenter la fonctionnalité
3. PR avec description claire

Convention rapide commit (suggestion) :
- `feat: ...`
- `fix: ...`
- `refactor: ...`
- `docs: ...`
- `perf: ...`
- `chore: ...`

## 📄 Licence

ISC (modifiable selon vos besoins)

## 🙌 Remerciements

Icônes : [lucide](https://lucide.dev) · Générateur d'UX : votre usage réel 👨‍🍳

---

> Besoin d'ajouter une PWA, un export PDF ou la nutrition ? Ouvrez une issue / notez une idée dans la roadmap.
