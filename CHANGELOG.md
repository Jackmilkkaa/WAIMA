# Changelog — Waïma Wardrobe

Toutes les évolutions notables de l'application sont documentées ici, dans l'esprit de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/). Le versioning suit [Semantic Versioning](https://semver.org/lang/fr/) (MAJOR.MINOR.PATCH).

Ce fichier est la source de vérité. L'écran "Version" dans l'application en est un reflet de confort, pas la référence.

## [1.25.3] - 2026-08-07

### Ajouté
- **Lien "Voir les X autres" par famille** dans Associations : les 3 premiers résultats restent affichés par défaut, un clic révèle le reste (tous les tiers, y compris B/C/D) sans limite — utile quand le top 3 n'est pas terrible et qu'il faut voir la suite.

## [1.25.2] - 2026-08-07

### Modifié
- **Associations repliée par défaut** au sein d'une fiche dépliée — c'est maintenant un second niveau de pli (clic sur "Associations" pour la calculer et l'afficher), plutôt qu'automatique dès qu'on ouvre la fiche.

## [1.25.1] - 2026-08-07

### Corrigé
- **Chemises et Mailles (pulls, q-zip) ne se matchaient jamais entre elles**, alors qu'elles se portent ensemble en layering (chemise dessous, pull dessus) plutôt qu'en alternative. Même souci entre Vestes et Manteaux (blazer sous un manteau). L'exclusion se fait maintenant sur la catégorie exacte plutôt que sur la famille de tenue entière — deux chemises entre elles restent exclues, mais chemise+maille et veste+manteau sont maintenant proposées.
- Affichage de la catégorie exacte à côté de la marque dans les résultats, pour distinguer chemise/maille au sein du groupe "Haut" (et veste/manteau).

## [1.25.0] - 2026-08-07

### Ajouté
- **Feature "Associations" (matchmaking de tenues)** : sur chaque fiche pièce (au clic pour déplier), une nouvelle section propose les meilleures pièces d'autres familles (Haut, Bas, Chaussures, Veste/Manteau, Costume — Accessoires exclus pour l'instant) avec un % de compatibilité et un tier façon foot (S = automatisme, A = association solide, B = ça fonctionne, C = jouable à travailler, D = décousu). Cliquer une association ouvre directement sa fiche.
- **Nouvelle table `waima.compatibilite_couleurs`** : matrice de compatibilité entre les 11 familles de couleur (66 paires), basée sur les règles classiques du vestiaire masculin (navy+beige fort, marron+noir évité, etc.). Ajustable manuellement en base sans redéploiement.
- **Score composite de compatibilité** entre deux pièces : couleur (45%), chevauchement de formalité (25%), chevauchement de saison (15%), cohérence ADN dominant/secondaire (10%), écart de gamme perçue (5%). Calculé à la volée au moment où une fiche est dépliée (pas de pré-calcul global, pour rester léger).

## [1.24.2] - 2026-08-06

### Corrigé
- **Retour arrière sur le correctif 1.24.1** : ce n'était pas un bug. Analyse s'appuie sur la liste filtrée par design — pour inclure les recrues dans "Scores par rôle" et "Écarts au groupe", il suffit de les cocher dans le filtre Rôle, comme pour tout le reste de l'écran.

### Modifié
- **"Statistiques" devient repliable**, comme "Cohérence" — même mécanique (titre cliquable, flèche).
- **Les deux blocs (Statistiques et Cohérence) sont dépliés par défaut** à l'ouverture d'Analyse.
- **Textes d'aide allégés** : suppression des paragraphes explicatifs sous les titres de graphiques et sous-sections de Cohérence (ADN secondaire, Catégorie, Marques, Écarts au groupe, Désaccord, Qualité par formalité) — le détail reste dans ce changelog plutôt que sur l'écran.

## [1.24.1] - 2026-08-06

### Corrigé
- **"Scores par rôle" et "Écarts au groupe" ignoraient les rôles masqués par défaut** (Retraité, Recrue potentielle) : ces deux blocs comparent maintenant TOUS les rôles quel que soit le filtre Rôle actif sur la liste principale, tout en respectant les autres filtres (catégorie, marque, recherche…). Un tableau censé comparer les rôles entre eux n'a pas de sens s'il en fait disparaître certains parce qu'ils sont masqués ailleurs dans l'appli.

## [1.24.0] - 2026-08-06

### Ajouté
- **Nouveau bloc "Cohérence"** dans Analyse, placé sous Statistiques, repliable (fermé par défaut, badge indiquant le nombre total de signaux). Regroupe :
  - **Tensions Rôle / Score** (déplacée depuis le haut de la modale, comportement inchangé, seuil Rotation relevé à 8 au lieu de 7,5 — trop de pièces déclenchaient le signal avec l'ancien seuil).
  - **Scores par rôle** : tableau N / moyenne / médiane / min / max / écart-type par rôle, sur le périmètre filtré actuel.
  - **Écarts au groupe** : pièces Spectateur/Transfert/Retraité dont le score dépasse la moyenne de leur rôle de plus d'un écart-type — signale un potentiel sous-évalué (sortie peut-être liée à autre chose qu'un problème de qualité).
  - **Désaccord score / vécu réel** : pièces où fréquence et attachement élevés contredisent un score modeste (sous-évaluation probable), ou l'inverse (score généreux mais usage réel faible).
  - **Équilibre de l'effectif** : poids du noyau dur (Capitaine + Titulaire) dans la garde-robe active, avec une lecture alternative incluant Rotation.
  - **Qualité par formalité** : score moyen par niveau de formalité, signale un niveau bien couvert en nombre mais faible en qualité moyenne (&lt;7).

## [1.23.2] - 2026-08-06

### Modifié
- **Seuil de tension Rotation relevé** : signalé désormais uniquement au-dessus de 8 (au lieu de 7,5) — "Potentiel sous-exploité" ne se déclenche que pour une Rotation vraiment au niveau Titulaire, pas dès qu'elle dépasse légèrement 7,5. Trop de pièces déclenchaient le signal avec l'ancien seuil.

## [1.23.1] - 2026-08-06

### Ajouté
- **Graphique Marques dans l'onglet Composition** (Analyse) : placé en dernier, pleine largeur (beaucoup de marques distinctes). Clique une marque pour voir la répartition de ses pièces par catégorie, puis clique une catégorie pour voir la liste des pièces — même mécanique de drill-down que le graphique Catégorie.

## [1.23.0] - 2026-08-06

### Ajouté
- **Feature Mercato** : possibilité de cartographier des pièces pas encore possédées ("recrues potentielles"), avec toute la richesse de la fiche existante (catégorie, ADN, formalité, couleur, texture, description...).
  - **Nouveau rôle "Recrue potentielle"** (8ᵉ valeur dans `waima.roles`, couleur cyan `#06b6d4`, en dernière position) : une recrue devient une pièce active de la garde-robe simplement en changeant son rôle (Titulaire, Rotation...) via le formulaire existant — pas de champ de statut séparé, pas de cérémonie de "promotion" dédiée.
  - **Nouveaux champs `prix_achat` et `url_marchand`**, disponibles pour toutes les pièces (garde-robe et recrues) — nouvelle section "Achat" dans le formulaire d'ajout/édition. Le prix et le lien vers la fiche produit s'affichent dans le détail de la carte quand ils sont renseignés.
  - **Écran Mercato** (nouveau bouton dans la barre de contrôles, avec badge indiquant le nombre de recrues) : deux sections — *Recrues* (rôle Recrue potentielle) et *Départs potentiels* (rôle Transfert, réutilise le mécanisme existant, aucun nouveau schéma). Chaque ligne cliquable ouvre directement la fiche pour éditer ou changer le rôle.
  - **Recrue potentielle exclue de la liste principale par défaut**, comme Retraité aujourd'hui — accessible via le filtre Rôle ou l'écran Mercato, pour ne pas mélanger garde-robe active et pièces convoitées.
  - **Aucune tension Rôle/Score** générée pour les recrues (comme Transfert/Spectateur/Retraité) — ce n'est pas une pièce mal classée, juste pas encore décidée.
  - **Intégration Analyse sans code dédié** : le rôle Recrue potentielle apparaît automatiquement comme chip filtrable dans Filtres (peuplé dynamiquement depuis la table `roles`). Cocher ce chip suffit à faire entrer les recrues dans le scope de l'écran Analyse (`getFiltered()`) et donc dans toutes les statistiques — pas de case à cocher spécifique nécessaire.

## [1.22.0] - 2026-08-06

### Ajouté
- **Bouton Fermer fixe (✕) généralisé à toutes les modales** : Filtres, Ajouter/éditer une pièce, Profil, et Historique des versions ont désormais le même en-tête sticky que la modale Analyse, avec un ✕ toujours visible en haut à droite — plus besoin de descendre tout en bas pour fermer, notamment sur la modale Filtres (longue liste de critères) et la modale d'édition d'une pièce (formulaire long).

### Modifié
- Les boutons "Fermer" redondants en bas de page sont retirés (Changelog, Filtres, Profil) — seule l'action "Réinitialiser" reste en bas de la modale Filtres, à côté du ✕ désormais en haut. Sur la modale d'édition, "Annuler" et "Enregistrer" restent en bas comme avant ; le ✕ en haut fait la même chose qu'"Annuler" (ferme sans enregistrer).

## [1.21.2] - 2026-08-06

### Corrigé
- **Vraie cause du bug de largeur identifiée** : ce n'était pas un problème de resize Chart.js (déjà corrigé en 1.21.1 mais le symptôme persistait), mais un comportement standard de CSS Grid — par défaut, une cellule de grille ne peut pas rétrécir en dessous de la taille intrinsèque de son contenu (`min-width: auto` implicite). La résolution interne du `<canvas>` (potentiellement bien plus large que sa taille affichée sur un écran haute densité) forçait sa colonne à s'élargir, cassant le partage 50/50 en 1/3-2/3.
  Ajout de `min-width: 0` et `overflow: hidden` sur `.chart-card`, et `max-width: 100%` sur les canvas — la correctif CSS Grid standard pour ce cas précis.

## [1.21.1] - 2026-08-06

### Corrigé
- **Bug de resize persistant** : la v1.21.0 tentait de corriger le blocage de taille via `chart.resize()` différé, mais le problème persistait — le canvas gardait une taille interne héritée de l'état agrandi et débordait de sa carte, décalant toute la page horizontalement. Cause réelle : `chart.resize()` réutilise des mesures internes de l'instance Chart.js existante, qui peuvent rester incohérentes après un changement de `grid-column`/`display`.
  Remplacé par une reconstruction complète du graphique (destruction + nouvelle instance `Chart`) à chaque agrandissement ou réduction de carte : une instance neuve mesure toujours son conteneur à zéro, ce qui élimine la classe de bug entière. Les paramètres de construction de chaque graphique sont mis en cache pour permettre cette reconstruction sans perdre les données ni la liste de détail ouverte.

## [1.21.0] - 2026-08-06

### Ajouté
- **Section Tensions Rôle/Score repliable** : repliée par défaut (avec compteur affiché à côté du titre), dépliable au clic. Évite qu'elle monopolise le haut de l'écran quand il n'y a rien à signaler ou que l'utilisateur veut aller direct aux statistiques.
- **Bouton Fermer fixe** : un bouton ✕ est maintenant collé en haut de la modale Analyse (à côté du titre, toujours visible même en scrollant), pour lever l'ambiguïté avec les interactions de zoom/détail sur les graphiques. L'ancien bouton "Fermer" en bas de page est retiré (redondant).

### Corrigé
- **Bug de redimensionnement au repli d'une carte agrandie** : après avoir agrandi puis réduit un graphique, celui-ci pouvait rester visuellement bloqué sur une taille intermédiaire au lieu de revenir à sa taille normale. Le recalcul de taille (`chart.resize()`) est désormais différé après le prochain repaint du navigateur (`requestAnimationFrame`), le temps que les changements de classes CSS (grid-column, display) soient pleinement appliqués avant que Chart.js ne mesure le conteneur.
- Réduire une carte agrandie ferme maintenant proprement la liste de détail associée (elle ne restait pas ouverte "orpheline" en arrière-plan).

### Modifié — couleurs
- **Qualité perçue** : dégradé rouge → vert (aligné sur la logique déjà en place pour les scores), remplace l'ancien dégradé de gris monochrome. Mis à jour directement dans `waima.echelle_qualite`.
- **Formalité** : abandon du dégradé rouge → vert (qui laissait croire qu'un niveau de formalité élevé était "meilleur"). Remplacé par un dégradé bleu clair → bleu marine, neutre, qui suit la progression casual → strict sans jugement de valeur. Mis à jour dans `waima.echelle_formalite`.
- **Catégories et Saison** : sortent du monochrome. Nouvelle palette qualitative (bleu, mauve, teal, rose, moutarde, ardoise, brun, indigo…) appliquée par position, volontairement hors registre rouge/orange/vert pour ne pas être confondue avec une échelle de qualité.

## [1.20.0] - 2026-08-06

### Modifié
- **Réorganisation complète de l'écran Analyse (statistiques)** : les 4 onglets de la v1.19.0 sont remplacés par 3 onglets suivant une logique éditoriale (pourquoi ça compte → de quoi c'est fait → comment ça sert) :
  - **Identité** : Rôles, Scores, ADN dominant, ADN secondaire (désormais séparés au lieu d'être cumulés dans un seul graphique).
  - **Composition** : Catégorie/sous-catégorie (drill-down), Couleurs, Qualité, Premium perçu, Formalité.
  - **Usage** : Fréquence de portage, Attachement, Polyvalence, Saison.
- **Plein écran par carte** : chaque graphique a un bouton d'agrandissement (⤢/⤡) qui le passe en pleine largeur et masque temporairement les autres cartes du même onglet.
- **Détail cliquable universel** : cliquer sur une part de camembert ou une barre affiche, sous le graphique (qui passe automatiquement en plein écran), la liste des pièces qui la composent — chaque ligne cliquable ouvre directement la fiche de la pièce concernée. S'applique à tous les graphiques, y compris Rôles, Scores et les sous-catégories issues du drill-down Catégorie.

### Note technique
- Nouveau moteur générique `renderBarChart(cardKey, canvas, entries, opts)` qui construit indifféremment camemberts et barres à partir d'`entries` typées `{label, color, items}` — remplace les fonctions de graphique dupliquées de la v1.19.0. `groupBy` remplace `countBy` : il retourne désormais les pièces elles-mêmes (pas seulement leur nombre), nécessaire pour la liste de détail au clic.

## [1.19.0] - 2026-08-06

### Ajouté
- **Écran Analyse — statistiques réorganisées en 4 onglets** : *Vue d'ensemble* (rôles, scores, formalité, qualité), *Catégories* (répartition par catégorie avec drill-down au clic vers les sous-catégories), *Usage & valeur* (fréquence de portage, attachement, polyvalence, premium perçu — jusqu'ici absents des statistiques) et *Style & saison* (ADN, couleurs, saison).
- **Graphique Saison** : nouvelle répartition par saison (un article multi-saison compte dans chaque saison qu'il couvre).
- **Graphique Catégorie/Sous-catégorie interactif** : clic sur une barre de catégorie → bascule sur le détail des sous-catégories de cette catégorie, avec bouton retour.

### Modifié
- **Graphique ADN** : intègre désormais l'ADN secondaire en plus du dominant (une pièce alimente les deux registres qu'elle porte), au lieu du seul ADN dominant. Le titre précise la méthode de cumul.
- Les graphiques ne sont construits que pour l'onglet actif (lazy build), et détruits au changement d'onglet — évite les soucis de dimensionnement de Chart.js sur des canvas cachés et allège le rendu.

## [1.18.0] - 2026-08-04

### Ajouté
- **Relais photo via Claude** : nouvelle table `photos_en_attente` — quand une photo est envoyée à Claude en conversation (au lieu de l'appli), Claude la dépose en base (encodée) plutôt que de demander un ré-upload manuel. À l'ouverture de l'appli, `processPendingPhotos()` détecte silencieusement les photos en attente pour l'utilisateur connecté, les décode, les envoie dans le bucket `wardrobe-photos` (avec les vrais droits d'écriture Storage de la session), met à jour `photo_url`/`photo_fit` de la pièce concernée, puis nettoie la table. Contourne la limite technique de Claude (pas d'accès en écriture au Storage Supabase, seulement à la base de données).

## [1.17.2] - 2026-08-04

### Corrigé
- Infobulles ADN affichant `&amp;` au lieu de `&` — le texte était échappé HTML avant d'être affecté directement en propriété JS (`.title =`), qui ne décode jamais les entités. L'échappement est maintenant appliqué seulement là où le texte est réellement injecté dans du HTML (badges, ligne de détail), plus sur l'affectation directe des chips de filtre.

## [1.17.1] - 2026-08-04

### Modifié
- Sélecteur Profil (Homme/Femme) redessiné : interrupteur pilule compact et centré avec icônes, au lieu de deux gros boutons pleine largeur.

## [1.17.0] - 2026-08-04

### Ajouté
- **Système ADN bi-genré** : les 6 archétypes (Patriarche/Stratège/Leader/Dandy/Homme Moderne/Mâle) ont désormais un libellé homme ET un libellé femme (La Patronne, La Stratège, La Rayonnante, L'Élégante, L'Essentielle, La Déterminée) — même code, même couleur, même logique de scoring, seul le mot affiché change. Chaque archétype a aussi une signature visuelle par genre (coupes, matières, couleurs typiques), affichée en infobulle sur les badges ADN.
- **Écran Profil** (bouton dans la barre d'outils) : bascule Homme/Femme qui détermine quel jeu de libellés ADN s'affiche partout (cartes, filtres, formulaire, graphiques). Table `profiles` conçue pour accueillir d'autres réglages personnels à l'avenir.

## [1.16.0] - 2026-08-04

### Modifié
- **Consolidation infra** : le projet Supabase Waïma (renommé `LR_Perso` dans le dashboard, ref inchangée `dqqsggolhfoehmjeibxp`) héberge maintenant aussi l'app Bass, dans un schéma Postgres séparé (`bass`). Les tables Waïma sont déplacées de `public` vers un schéma dédié `waima`. Le client Supabase JS cible désormais explicitement `db:{schema:'waima'}`.
- **Action manuelle requise côté dashboard** : ajouter `waima` et `bass` dans Project Settings → API → Exposed Schemas, sinon l'API ne sert aucune requête.

## [1.15.0] - 2026-08-04

### Modifié
- La photo en vue détail (`object-fit`) passe de "Remplir" (recadrage centré, parfois moche/aléatoire) à **"Contenir" par défaut** : plus aucune photo n'est rognée, l'image entière est toujours visible avec un léger fond neutre si besoin.

### Ajouté
- Interrupteur **Contenir / Remplir** dans le formulaire photo, par pièce — pour les cas où le recadrage "Remplir" rend en fait mieux (photo déjà bien cadrée par exemple), on peut le choisir manuellement plutôt que de le subir par défaut.

## [1.14.1] - 2026-08-04

### Modifié
- L'écran Analyse (tensions + graphiques) s'appuie désormais sur le même périmètre filtré que la liste principale (catégorie, rôle, ADN, recherche, etc.), au lieu de toujours afficher les 83 pièces. Filtre la liste, ouvre Analyse : les tensions et les graphiques ne portent que sur ce que tu vois.

## [1.14.0] - 2026-08-04

### Ajouté
- Nouveau champ **famille de couleur** (`famille_couleur`), normalisation automatique de `couleur_principale` en 10 familles (Bleu, Bleu marine, Blanc, Gris, Beige/Sable/Camel, Vert, Rose/Parme/Lilas, Rouge/Bordeaux, Marron/Cognac, Noir) via trigger — se reclasse tout seul à chaque modification de la couleur, y compris pour les futures pièces.
- Le graphique "Couleurs dominantes" de l'écran Analyse utilise ce nouveau champ au lieu du texte brut, qui fragmentait trop les nuances pour être lisible (ex. "Bleu marine", "Bleu marine profond", "Navy" ne se regroupaient pas).

## [1.13.0] - 2026-08-04

### Ajouté
- **Indicateur de tension Rôle / Score**, inline sur chaque carte (pastille ▼/▲ à côté du Score) et récapitulatif complet dans le nouvel écran Analyse. Seuils : Capitaine ≥8,5 · Titulaire ≥7,5 · Remplaçant fenêtre 6,5–7,5 (signalé dans les deux sens) · Rotation : signalé seulement si ≥7,5 (potentiel sous-exploité). Spectateur/Transfert/Retraité non concernés (rôles de contexte, pas de qualité).
- **Écran Analyse** (bouton dans la barre d'outils) : liste des tensions triée par sévérité, cliquable vers la fiche pièce (même modale que la vue principale — pas de composant dupliqué) + 6 graphiques (répartition des rôles, distribution des scores, équilibre ADN, couverture formalité, répartition Qualité, couleurs dominantes), via Chart.js.

## [1.12.0] - 2026-08-04

### Ajouté
- Nouveau critère **Qualité** (matière + fabrication), échelle 1-5 : Bas de gamme / Modeste / Standard / Solide / Premium. Distinct de "Premium perçu" qui reste une mesure purement visuelle.
- Code couleur sur le Score affiché (carte pièce), basé sur les bandes déjà documentées dans `Waima_DataDictionary.md` §3 (9-10 majeure, 8-8,9 très bonne, 7-7,9 utile, 6-6,9 correcte, 5-5,9 fragile, <5 sortie probable).
- Filtre par Qualité dans le panneau de filtres, au même endroit que Polyvalence/Premium perçu.

### Modifié
- Le **Score** n'est plus un champ éditable manuellement dans le formulaire : il est recalculé automatiquement en base (trigger Postgres) dès qu'un critère d'entrée change (Polyvalence, Qualité, Premium perçu, Fréquence, Attachement, Intensité ADN dominant), à partir de la formule Waïma figée le 04/08/2026. Le champ Score du formulaire devient un affichage en lecture seule.
- Les pièces au rôle **Retraité** conservent leur score historique figé — non recalculé par la formule, à titre de mémoire du système.

## [1.11.1] - 2026-08-04

### Corrigé
- Le libellé du bouton version (footer, bas de l'appli) était codé en dur dans le HTML et ne suivait pas le CHANGELOG.md, contrairement au contenu de la fenêtre qu'il ouvre. Il est désormais lu dynamiquement depuis le CHANGELOG.md au démarrage de l'app (et rafraîchi au clic) — plus besoin de le mettre à jour manuellement à chaque release.

## [1.11.0] - 2026-08-04

### Modifié
- Formulaire d'ajout/modification d'une pièce : les champs des groupes Évaluation (Rôle, Formalité, Fréquence, Attachement, Polyvalence, Premium perçu) et ADN (ADN dominant, ADN secondaire) passent des menus déroulants à des chips boutons colorées, dans le même esprit que les filtres. Sélection plus rapide, couleurs reprises des tables de référence Supabase (roles, adn, echelle_*). Le groupe Caractéristiques (couleur, matière, texture) reste en saisie libre, trop de valeurs possibles pour des chips.
- Nouveau mécanisme de gouvernance technique : le token GitHub est désormais stocké côté Supabase (table `app_secrets`, clé `github_pat`) plutôt que redemandé en clair à chaque conversation. Voir `Waima_App_Technique.md` §6.

## [1.10.0] - 2026-08-03

### Modifié
- Filtres Formalité, Fréquence, Attachement, Polyvalence et Premium perçu : remplacement des boutons de seuil minimum (`≥1`...`≥5`, un seul actif à la fois) par des chips multi-sélection par valeur exacte, dans le même esprit que les filtres Rôle et ADN. Permet notamment de sélectionner uniquement la valeur 1, impossible avec l'ancien système de seuil.

## [1.9.0] - 2026-08-03

### Ajouté
- Bouton "Afficher / Masquer" sur le champ mot de passe de l'écran de connexion.

## [1.8.1] - 2026-08-03

### Modifié
- Ajout de `wrangler.jsonc` à la racine du dépôt, pour permettre la bascule de l'hébergement de Netlify vers Cloudflare Pages (limite de crédits mensuels sur Netlify, sans équivalent chez Cloudflare pour ce volume d'usage).

## [1.8.0] - 2026-08-03

### Ajouté
- Système de changelog versionné (ce fichier) comme source de vérité, indépendant des échanges de conversation.
- Numéro de version affiché en bas de l'application, cliquable, ouvrant l'historique complet des versions.
- Tags Git `vX.Y.Z` sur chaque commit de release pour retrouver l'état exact du code d'une version donnée.

## [1.7.0] - 2026-08-03

### Ajouté
- Upload de photo par pièce, depuis l'appareil photo du mobile ou la galerie.
- Bucket de stockage dédié (Supabase Storage), écriture restreinte au propriétaire, lecture publique.
- Vignette photo sur chaque carte, photo agrandie dans le détail déplié.

### Modifié
- Cartes de pièces redessinées en format compact (vignette + titre tronqué sur une ligne) pour afficher davantage de pièces à l'écran.
- Bord gauche des cartes coloré selon le rôle, en remplacement du badge de rôle dans la vue par défaut.

## [1.6.0] - 2026-08-02

### Modifié
- Les rôles sont tous actifs par défaut à l'ouverture, à l'exception de "Retraité" (masqué par défaut).
- Le bouton "Réinitialiser" du panneau de filtres restaure cet état par défaut plutôt que de tout décocher.

## [1.5.1] - 2026-08-02

### Corrigé
- Doublons dans la liste déroulante du filtre Catégorie après un ajout ou une modification.

## [1.5.0] - 2026-08-02

### Modifié
- Remplacement du flux de saisie par copier-coller par un formulaire structuré (menus déroulants, cases à cocher) pour l'ajout et la modification des pièces.

## [1.4.0] - 2026-08-02

### Ajouté
- Modification et suppression des pièces existantes directement depuis l'application.

## [1.3.0] - 2026-08-02

### Ajouté
- Filtre par sous-catégorie, en cascade selon la catégorie sélectionnée.

## [1.2.0] - 2026-08-02

### Ajouté
- Panneau de filtres dédié : catégorie, marque, rôle, ADN dominant, texture, saison, seuils minimums sur les 5 échelles de notation.

### Modifié
- Écran principal épuré : recherche, tri et bouton "Filtres" avec badge du nombre de critères actifs.

## [1.1.0] - 2026-08-02

### Ajouté
- Filtre par ADN dominant (chips cumulables comme le filtre Rôle).

### Modifié
- Pastilles de notation affichées en toutes lettres ("Formalité 5") au lieu de codes abrégés ("F5") peu lisibles.

## [1.0.0] - 2026-08-02

### Ajouté
- Version initiale de l'application : connexion (email/mot de passe), liste des pièces de la garde-robe, recherche, filtre par catégorie et par rôle, tri, ajout d'une nouvelle pièce.
- Schéma de données complet dans Supabase (pièces + nomenclatures : catégories, marques, rôles, ADN, échelles de notation), avec cloisonnement des données par utilisateur (RLS).
- Reprise des 83 pièces de l'inventaire Excel historique.
