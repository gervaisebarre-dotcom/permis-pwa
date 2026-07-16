# Application PWA — Code de la route

Application HTML/CSS/JavaScript sans framework ni backend. Elle sépare trois univers : Panneaux, Infractions et points, et Révision complète du Code.

## Infractions, amendes et points

Le module charge les 39 infractions approuvées depuis `data/infractions_code.json`. Il comprend un accueil et des statistiques propres, quatre formats de flashcards, des quiz adaptatifs, les révisions du jour, les erreurs, un examen différé, une bibliothèque filtrable et des fiches détaillées. Les questions portant sur une amende ou une classe ne sont créées que lorsque la valeur correspondante existe.

La progression utilise `infractions_progress_v1`, les préférences `infractions_settings_v1` et les examens `infractions_exam_history_v1`. Ces clés ne remplacent jamais les clés `panneaux_*` existantes.

Le mode « Révision complète du Code » propose des quiz, flashcards ou examens mixtes avec une proportion 50/50, 75/25 ou 25/75. Chaque réponse alimente uniquement la progression de son module.

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

Le service worker `permis-pwa-v5` précharge l’interface, les données, les composants de réponses et de récapitulatif, le mode ciblé sur les erreurs, ainsi que les 243 images. L’application complète reste disponible hors ligne après la première installation réussie. L’événement `activate` supprime les anciens caches.

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

## Améliorations bêta

La séance du jour conserve réellement un objectif de 40 cartes dans `panneaux_daily_session_v1`, avec reprise jusque dans les trois dernières cartes, compteur unique, restant et répétitions. Sa jauge dépend uniquement des cartes uniques terminées. Les anciennes clés de progression ne changent pas.

Deux cours originaux et hors ligne sont accessibles depuis les accueils Panneaux et Infractions. Le cours Infractions détaille les cinq classes, les quatre montants et comprend un tableau responsive. Les quiz et examens utilisent les mêmes états de réponse accessibles et un récapitulatif complet. Le cache `permis-pwa-v5` inclut tous ces composants.

## Uniquement mes erreurs

Ce mode réunit les panneaux et infractions ayant au moins une mauvaise réponse enregistrée. Il peut cibler un module ou les deux et fonctionner en Flashcards, Quiz ou Examen, pour 10, 20, 40 ou toutes les erreurs disponibles. Une demande supérieure au stock réel utilise automatiquement tout le stock.

L’ordre par défaut privilégie la récence, le nombre d’erreurs, le taux de réussite puis l’échéance de révision. Le mélange est optionnel. Une erreur reste prioritaire après une seule bonne réponse et peut quitter la liste principale après deux bonnes réponses consécutives. Le filtre « Inclure les erreurs déjà corrigées récemment » permet de la retrouver.
