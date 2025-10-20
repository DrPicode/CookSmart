<div align="center">
  <h1>🍽️ Recipe Manager</h1>
  <p>Application mobile-first pour gérer vos ingrédients, prioriser vos recettes et optimiser vos courses.</p>
</div>

## 1. Objectif
Suivre ce que vous avez à la maison, savoir instantanément quels plats sont réalisables et consommer en priorité ce qui va périmer.

## 2. Fonctionnalités
| Domaine | Détails |
|---------|--------|
| Stock | Ajout / édition / suppression d'ingrédients (prix, parts, date péremption frais) |
| Catégories | Renommage dynamique, regroupement automatique des ingrédients & recettes |
| Recettes | CRUD complet, filtrage automatique par disponibilité des ingrédients |
| Priorisation | Tri des recettes par ingrédient frais le plus urgent (périmé ou J-n) + badge urgence |
| Courses | Mode liste interactive (sélection, sous-total, progression, saisie péremption à l'achat) |
| Historique | Journal des sessions (items, total, suppression simple ou multiple) |
| Export/Import | Sauvegarde/restauration JSON versionnée (schéma 1.1.0) |
| Réinitialisation | Bouton pour effacer toutes les données (ingrédients, catégories, recettes, historique) et repartir de zéro |
| Langue | Bascule instantanée FR/EN (persistée) |

## 3. Tri des recettes par péremption
Processus :
1. On conserve uniquement les recettes dont tous les ingrédients sont en stock.
2. Pour chaque recette, on calcule le plus petit nombre de jours restants parmi ses ingrédients datés (`earliestExpiryDays`).
3. Les valeurs négatives (ingrédient périmé) remontent tout en haut.
4. Absence de date → tri après toutes les recettes urgentes.

Affichage : badge `PÉRIMÉ`, `J0` ou `J-#`. L’ingrédient conducteur est marqué par un simple contour orange.

## 4. Stack
| Élément | Technologie |
|---------|------------|
| Langage | TypeScript |
| Framework | React |
| Build/dev | Vite |
| Style | Tailwind CSS |
| Icônes | lucide-react |
| Persistance | localStorage |

## 5. Installation
```bash
git clone <repo>
cd Recipe-Manager
npm install
npm run dev
```
Ouvrir http://localhost:5173

Build production :
```bash
npm run build
npm run preview
```

## 6. Structure des données
| Clé localStorage | Forme |
|------------------|-------|
| ingredients | `{ [nom]: { inStock, price, parts, expiryDate? } }` |
| categories | `{ [categorie]: string[] }` |
| recettes | `[{ nom, categorie, ingredients[] }]` |
| shoppingHistory | `[{ id, date, items[], total }]` |
| lang | `'fr' | 'en'` |

## 7. Export / Import
Format JSON versionné (actuel: `1.1.0`). Validation : version, types, cohérence (filtrage ingrédients inexistants). Import = remplacement total des données.

## 8. Historique des courses
Chaque validation de liste crée une session (id, date ISO, items, total). Sélection multiple et purge globale possibles.

## 9. Accessibilité & Mobile
Interface monocolonne, zones clic larges, contraste renforcé, interactions minimales pour usage rapide en magasin.

## 10. Roadmap courte
| Idée | Statut |
|------|--------|
| Virtualisation listes longues | À faire |
| Mode sombre | À faire |
| Stats mensuelles / filtres historique | À faire |
| PWA / offline avancé | À faire |
| Synchronisation multi-appareils | À faire |
| Gestion parts consommées | À faire |
| Internationalisation avancée (extraction fichiers, pluriels, date/heure locale) | À faire |

## 11. Contributions
PR bienvenues. Convention de commits suggérée : `feat:`, `fix:`, `refactor:`, `docs:`, `perf:`, `chore:`.

## 12. Licence
ISC (modifiable selon besoin).

## 13. Remarques
Pas de backend, pas de multi-utilisateur concurrent. Les prix sont indicatifs (pas de gestion des formats). Optimisé pour usage personnel rapide.

---
Bonnes cuisines et zéro gaspillage 👨‍🍳
