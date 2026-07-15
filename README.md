# Application PWA — Code de la route

Application HTML/CSS/JavaScript sans framework ni backend. Elle sépare trois univers : Panneaux, Infractions et points, et Révision complète du Code.

## Infractions, amendes et points

Le module charge les 39 infractions approuvées depuis `data/infractions_code.json`. Il comprend un accueil et des statistiques propres, quatre formats de flashcards, des quiz adaptatifs, les révisions du jour, les erreurs, un examen différé, une bibliothèque filtrable et des fiches détaillées. Les questions portant sur une amende ou une classe ne sont créées que lorsque la valeur correspondante existe.

La progression utilise `infractions_progress_v1`, les préférences `infractions_settings_v1` et les examens `infractions_exam_history_v1`. Ces clés ne remplacent jamais les clés `panneaux_*` existantes.

Le mode « Révision complète du Code » propose des quiz ou flashcards mixtes avec une proportion 50/50, 75/25 ou 25/75. Chaque réponse alimente uniquement la progression de son module.

## Lancement local

Depuis la racine du projet :

```powershell
python -m http.server 8000
```

Puis ouvrir `http://localhost:8000/quiz/`. Sous Windows, `start_local_server.bat` effectue la même opération. Le double-clic sur `index.html` ne fonctionne pas : `fetch` et le service worker exigent HTTP ou HTTPS.

## Installer sur iPhone

1. Ouvrir l’URL publiée dans Safari.
2. Toucher le bouton Partager.
3. Choisir « Sur l’écran d’accueil ».
4. Ouvrir l’application depuis l’icône.
5. Lancer une première session en ligne pour remplir progressivement le cache des images.

## Hors ligne

Le service worker `permis-pwa-v2` précharge l’interface, `data/panneaux_code.json`, `data/infractions_code.json`, les modules JavaScript et les 243 images. L’application complète reste donc disponible hors ligne après la première installation réussie. L’événement `activate` supprime les anciens caches.

## Flashcards

Le mode Flashcards est indépendant du quiz et propose trois sens : Image → Signification, Signification → Image et Nom → Image. La réponse reste masquée jusqu'au bouton « Retourner ». Après retournement, les évaluations À revoir, Difficile, Correct et Facile utilisent le même moteur de répétition espacée que les autres modes. Le paquet peut être filtré par catégorie, difficulté, échéance ou erreurs, mélangé et recommencé.

Les paramètres permettent de choisir le type par défaut, l'animation, l'affichage du code officiel et celui des pièges.

## Jeu infini

La rubrique « Révision » regroupe le Mode QCM classique, les Flashcards et le défi infini. Le défi infini propose trois vies et laisse choisir entre quatre réponses ou une réponse à écrire soi-même. Une partie peut être sauvegardée et quittée, puis reprise depuis le même score, le même nombre de vies et le même type de réponse. Le bouton « Abandonner » termine la partie tout en enregistrant la progression et le score. Le record est conservé localement. Une série de 273 bonnes réponses débloque le titre « Big Boss des panneaux ».

## Répétition espacée et données

Intervalles : 0, 1, 3, 7, 14, 30 et 60 jours. Une erreur revient dans la session et le lendemain ; Difficile revient sous un jour ; Correct et Facile avancent progressivement. La maîtrise demande au moins trois réponses consécutives et un intervalle de 14 jours. La session quotidienne prévoit jusqu'à 40 cartes, en donnant la priorité aux cartes dues puis aux nouvelles.

La progression, les paramètres, les examens et les records du jeu restent dans `localStorage`. Paramètres permet d’exporter/importer un JSON versionné ou de tout réinitialiser. Le JSON source n’est jamais modifié. Après fusion de la validation manuelle, 219 fiches suffisamment complètes sont actives ; les 24 autres restent visibles dans la galerie mais sont exclues des sessions.

## GitHub Pages

Copier **le contenu** de `quiz/` à la racine du dépôt GitHub Pages. Ce dossier contient désormais ses données et images ; aucun fichier parent n’est requis. Tous les chemins sont relatifs et fonctionnent sous `https://gervaisebarre-dotcom.github.io/permis-pwa/`.

Avant publication, exécuter :

```powershell
node scripts/sync_quiz_publish_data.mjs
node quiz/tests/publish-layout.mjs
```
