# Changelog — Waïma Wardrobe

Toutes les évolutions notables de l'application sont documentées ici, dans l'esprit de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/). Le versioning suit [Semantic Versioning](https://semver.org/lang/fr/) (MAJOR.MINOR.PATCH).

Ce fichier est la source de vérité. L'écran "Version" dans l'application en est un reflet de confort, pas la référence.

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
