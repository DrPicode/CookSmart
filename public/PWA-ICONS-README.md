# Génération des icônes PWA

Pour créer les icônes PWA, vous avez plusieurs options :

## Option 1: Utiliser un service en ligne
1. Allez sur https://www.pwabuilder.com/imageGenerator
2. Téléchargez votre logo (512x512 minimum recommandé)
3. Téléchargez les icônes générées
4. Placez `pwa-192x192.png` et `pwa-512x512.png` dans le dossier `public/`

## Option 2: Utiliser ImageMagick (si installé)
```bash
# Convertir le SVG en PNG 192x192
magick convert -background none -resize 192x192 favicon.svg pwa-192x192.png

# Convertir le SVG en PNG 512x512
magick convert -background none -resize 512x512 favicon.svg pwa-512x512.png
```

## Option 3: Créer manuellement avec un éditeur d'images
- Créez une image PNG de 192x192 pixels
- Créez une image PNG de 512x512 pixels
- Sauvegardez-les comme `pwa-192x192.png` et `pwa-512x512.png`

## Temporaire
Pour le moment, des icônes de placeholder ont été créées. Remplacez-les par vos propres icônes.
