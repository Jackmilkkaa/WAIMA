# Changelog — Waïma Wardrobe

Toutes les évolutions notables de l'application sont documentées ici, dans l'esprit de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/). Le versioning suit [Semantic Versioning](https://semver.org/lang/fr/) (MAJOR.MINOR.PATCH).

Ce fichier est la source de vérité. L'écran "Version" dans l'application en est un reflet de confort, pas la référence.

## [1.38.2] - 2026-08-17

### Corrigé
- **Badge de version et modale "Historique des versions" bloqués sur v1.10.0** : les trois fetchs vers le CHANGELOG (badge footer + modale + lien "source de vérité") pointaient encore vers l'ancien nom de repo `rep-WAIMA`, jamais mis à jour lors du renommage vers `WAIMA`. `raw.githubusercontent.com` ne redirige pas les repos renommés (contrairement à `github.com`), donc le fetch échouait silencieusement et le badge restait figé sur sa valeur par défaut codée en dur. Les trois URLs pointent maintenant vers `WAIMA`, et le badge par défaut affiche `…` en attendant le fetch plutôt qu'un numéro de version obsolète trompeur.

## [1.38.1] - 2026-08-17

### Corrigé
- **Filtres Catégorie/Sous-catégorie/Marque réinitialisés après modification d'une pièce** : `loadItems()` reconstruit ces trois `<select>` à chaque rechargement (après édition, ajout, upload photo) sans jamais restaurer la valeur précédemment sélectionnée, contrairement aux filtres à chips (Rôle, ADN, Texture, Saison, échelles) qui vivent dans des `Set` JS indépendants du DOM et survivaient déjà. Les trois `<select>` mémorisent maintenant leur valeur avant reconstruction et la réappliquent si elle existe toujours dans la nouvelle liste d'options.

## [1.38.0] - 2026-08-12

### Ajouté
- **Nouvelle famille Bleu marine (4 nuances)** : la palette de 42 couleurs avait un trou identifié par analyse teinte/saturation — aucune nuance froide+profonde+mate ne couvrait le navy ou le denim foncé (le Bleu Hiver existant est trop vif, saturé à 87%, pour représenter un navy réel à 47%). Ajout de Bleu marine Printemps (clair, #7B8FA6), Été (grisé, #8B98A8), Automne (denim, #2C3A4E) et Hiver (navy, #1B2A4A), avec alias (navy, denim foncé, jean délavé, chambray...).
- **22 pièces réassignées** depuis Bleu Hiver (qui servait d'approximation par défaut) vers la nuance Bleu marine appropriée : les 12 pièces "bleu marine" confirmées vers Hiver (navy), le reste (jeans/denim) réparti Printemps à Automne selon leur profondeur décrite.

## [1.37.0] - 2026-08-12

### Corrigé
- **ADN dominant manquant dans le détail d'une pièce** : la ligne "Intensité ADN dominant" s'affichait sans jamais nommer l'ADN dominant lui-même (seul l'ADN secondaire était nommé). Les deux lignes suivent maintenant le même format : "ADN dominant : nom (intensité)" / "ADN secondaire : nom (intensité)".
- **Lenteur au chargement de la liste principale** : `loadProfile()` et `loadReferenceData()` enchaînaient une vingtaine de requêtes Supabase en séquence (chacune attendant la précédente) avant que la liste ne commence à s'afficher. Toutes les requêtes indépendantes sont désormais lancées en parallèle (`Promise.all`), ce qui réduit le temps de chargement initial à la durée de la requête la plus longue plutôt qu'à leur somme.

### Retiré
- **Champ "Couleur principale" (texte libre)** retiré du formulaire d'ajout/édition et de l'affichage détail, devenu redondant depuis la liaison de toutes les pièces à la palette de 42 couleurs de référence. La colonne `couleur_principale` reste en base (historique, recherche texte) mais n'est plus éditable ni affichée.
- **Hex retiré de l'affichage couleur** (détail pièce et aperçu formulaire) : seule la pastille visuelle est conservée, avec libellé/saison/alias — le code hex n'apportait rien à l'usage.

## [1.36.1] - 2026-08-12

### Corrigé
- La modale de sélection de couleur passait derrière la fiche d'ajout/édition de pièce (z-index insuffisant, la modale couleur étant plus tôt dans le DOM). Elle a maintenant un z-index dédié, au-dessus de toutes les autres modales.
- Titre de la modale désormais contextuel : "Ajouter une couleur à ce tier" depuis le profil, "Choisir une couleur de référence" depuis la fiche pièce — au lieu d'un titre fixe qui ne correspondait plus à l'usage.

## [1.36.0] - 2026-08-12

### Ajouté
- **Sélecteur de couleur de référence dans le formulaire pièce** : le champ Couleur principale reste un texte libre, mais un nouveau bloc "Couleur de référence (42)" permet de lier explicitement une pièce (ajout ou édition) à une des 42 couleurs de la palette, via le même sélecteur que la palette teint (recherche par nom ou alias, aperçu pastille + libellé + saison + hex + alias). Auparavant cette liaison n'était possible qu'en base directement.

## [1.35.0] - 2026-08-12

### Ajouté
- **Colonne `wardrobe_items.palette_couleur_id`** : les 87 pièces de la garde-robe sont désormais reliées à une des 42 couleurs de référence (correspondance validée manuellement, voir table de correspondance dans le projet).
- **Détail d'une pièce** : la ligne Couleur affiche maintenant la teinte de référence associée (pastille + libellé + saison + hex + alias), en plus du libellé texte d'origine.
- **Analyse > Composition** : le graphique "Couleurs dominantes" regroupe maintenant par famille de la palette de référence (12 familles) au lieu de l'ancienne nomenclature garde-robe à 11 familles. Nouveau graphique "Saison colorimétrique de la garde-robe" (Printemps/Été/Automne/Hiver) montrant la répartition des pièces selon leur alignement avec le système de diagnostic teint.

## [1.34.0] - 2026-08-12

### Modifié — simplification de la palette colorimétrique (52 → 42 couleurs)
Suite à un retour terrain (plusieurs familles trop proches à l'œil, notamment Vert/Vert-jaune/Olive et les 4 nuances de Noir) :
- **Vert-jaune / Chartreuse supprimée**, fusionnée dans Vert. Vert Printemps prend une nouvelle teinte dérivée (plus tendre, plus claire que Vert Été).
- **Marron / Brun enrichi** : l'ancienne nuance "camel" passe de Printemps à Été ; une nouvelle nuance Printemps plus claire (ex-"Blanc Automne avoine", reclassée) comble le manque de clair signalé.
- **Blanc et Noir réduits à une seule nuance chacun** (les déclinaisons saisonnières étaient indiscernables à l'œil en usage réel). Le sélecteur de couleur n'affiche plus de sous-titre saison pour ces deux familles.
- Alias orphelins retirés, quelques-uns redistribués (ex : "beige grisé" déplacé vers Gris Automne taupe, "chartreuse"/"vert amande" vers le nouveau Vert Printemps).
- Les sélections S/A/B/D existantes liées aux teintes supprimées ont été purgées ; les teintes conservées gardent leur tier d'origine.

## [1.33.0] - 2026-08-12

### Ajouté
- **Alias sémantiques pour les 52 couleurs de référence** : nouvelle table `palette_couleur_alias` (150 alias, ~3 par couleur) reliant chaque nuance canonique à des noms courants du vocabulaire mode/vestiaire (ex : cognac, kaki, greige, navy, taupe...). Objectif : retrouver facilement la bonne référence même quand le nom utilisé sur une pièce ou une fiche produit diffère du libellé canonique.
- **Recherche dans le sélecteur de palette** : un champ de recherche filtre désormais les couleurs disponibles par libellé canonique ou par alias (ex : taper "cognac" retrouve "Brun Automne (profond)" et "Brun Printemps (camel)").
- **Tooltip alias** : survol d'une pastille de couleur (dans la matrice de tier list ou le sélecteur) affiche ses noms alternatifs.

## [1.32.0] - 2026-08-10

### Ajouté
- **Persistance du diagnostic colorimétrique** : le diagnostic (undertone/valeur/chroma/saison dominante) calculé par `analyser-palette` est désormais sauvegardé dans `profiles.diagnostic_teint` (jsonb) au lieu d'être seulement retourné à l'appel. La carte de diagnostic reste donc visible en rouvrant le profil, même sans relancer une analyse — corrige le comportement de la v1.31.0 où elle disparaissait à la fermeture de la modale.

### Modifié
- Migration additive `profiles.diagnostic_teint` (jsonb) + `profiles.diagnostic_teint_updated_at` (timestamptz).
- Edge Function `analyser-palette` passée en v3 : upsert du diagnostic dans `profiles` après le classement des couleurs.

## [1.31.0] - 2026-08-10

### Ajouté
- **Affichage du diagnostic colorimétrique après analyse IA de portrait** : la fonction `analyser-palette` (v2) détermine déjà un diagnostic explicite en 3 axes (undertone chaud/froid/neutre, valeur claire/moyenne/profonde, chroma vif/mat) avant de classer les 52 couleurs de référence — ce diagnostic était calculé mais jamais montré. Il s'affiche désormais dans une carte sous le bouton d'analyse : "On te lit plutôt comme {saison dominante} — {axes}, {justification}". Reste un point de départ visuel indicatif, pas un diagnostic professionnel.

## [1.30.1] - 2026-08-10

### Corrigé
- **Bouton "+ Ajouter" de la matrice couleur pas stylé** : utilisait une classe CSS différente (`color-add-btn`) jamais définie, au lieu de réutiliser `tier-add-btn` comme la matrice de style. Incohérence visuelle corrigée.
- **Pré-remplissage IA de la palette ne permettait pas de prendre une photo en direct** : un seul input générique sans l'attribut `capture`, ouvrant systématiquement la galerie selon les navigateurs. Remplacé par deux boutons séparés ("Prendre un portrait" avec `capture="user"` — caméra frontale — et "Depuis la galerie"), même principe que le formulaire d'ajout de pièce.

## [1.30.0] - 2026-08-10

### Ajouté
- **Palette de couleurs personnelle**, système séparé de la matrice de compatibilité entre pièces existante (`familles_couleur`) — celle-ci répond à "est-ce que cette couleur me met en valeur", pas "est-ce que deux pièces s'accordent". Vocation à devenir le système central à terme, migration prévue dans un second temps.
  - **Nouvelle table de référence `palette_couleurs`** : 13 familles de couleur (nomenclature ISCC-NBS, standard établi conjointement par l'Inter-Society Color Council et le National Bureau of Standards américain) × 4 tons saisonniers (Printemps/Été/Automne/Hiver, selon la théorie colorimétrique — undertone chaud/froid, clarté, saturation) = 52 couleurs de référence, avec code hexadécimal. Ajustable en base sans redéploiement.
  - **Nouvelle matrice tier list S/A/B/D** (Profil), glisser-déposer tactile identique à la matrice de style : S = "j'adore / ça me met en valeur", D = "je déteste / ça ne me va pas". Bouton "+ Ajouter" par ligne, sélecteur groupé par famille avec pastilles de couleur réelles.
  - **Pré-remplissage IA** ("🎨 Pré-remplir avec l'IA") : nouvelle Edge Function `analyser-palette` — à partir d'une photo de portrait, Claude classe les 52 couleurs en tier S/A/B/D selon une estimation visuelle du teint (undertone, contraste, clarté), explicitement présentée comme un point de départ à ajuster, pas un diagnostic professionnel. Résultat sauvegardé d'un coup (upsert), modifiable ensuite comme n'importe quelle sélection manuelle.
  - Intégration dans le formulaire d'ajout de pièce et Mercato (alerte si une couleur est en tier D) **pas encore construite** — prévue comme prochaine étape distincte.

## [1.29.1] - 2026-08-10

### Corrigé
- **Bibliothèque de mots de style non accordée au féminin** : les 16 mots (Structuré, Élégant, Sportif...) n'existaient qu'au masculin, sans équivalent pour un profil femme — même oubli que ce qu'on avait déjà corrigé pour l'ADN, pas reproduit ici initialement. Ajout d'une colonne `libelle_femme` sur `mots_style`, résolue à l'affichage selon le profil (comme pour l'ADN) — le stockage reste sur la forme canonique (masculin), seul l'affichage s'accorde. Les mots libres (hors bibliothèque) restent affichés tels que tapés, sans accord possible.
- La forme accordée est aussi utilisée côté serveur (`style-profil` v3, `smart-endpoint` v8) pour que le texte envoyé à Claude — et donc la description générée — respecte la grammaire du profil concerné.

## [1.29.0] - 2026-08-09

### Ajouté
- **Matrice tier list de style (S/A/B)**, en remplacement complet de l'ancien écran "Registres de style" (texte libre) et de la grille de photos séparée — les deux sont désormais unifiés dans une seule interface :
  - **Nouvelle table `mots_style`** : bibliothèque de mots/ambiances partagée (Structuré, Décontracté, Coloré, Sobre, Affirmé, Discret, Classique, Décalé, Épuré, Chaleureux, Précis, Spontané, Sportif, Élégant, Minimaliste, Audacieux), ajustable en base sans redéploiement.
  - **Nouvelle table `style_selections`** : chaque mot ou photo choisi par l'utilisateur est classé en tier S ("me définit le plus"), A ou B, avec glisser-déposer pour ajuster.
  - **Glisser-déposer tactile fait maison** (Pointer Events, souris + tactile unifiés) — pas de bibliothèque externe, cohérent avec le thème sombre de l'appli.
  - **Bouton "+ Ajouter" sur chaque ligne de tier** : choix dans la bibliothèque de mots, mot personnalisé libre, ou ajout direct d'une photo — l'élément atterrit directement dans le tier cliqué, déplaçable ensuite.
  - **Seuil minimum pour générer** : au moins 5 éléments au total dont 3 en tier S (mots et photos confondus) — le bouton "Régénérer mon style" reste désactivé avec message explicite tant que ce n'est pas atteint, contrôlé aussi côté serveur en défense.
  - **Onboarding** : l'étape "Registres de style" et l'étape "Photos de style" sont fusionnées en une seule étape "Ton style, en mots et en photos" utilisant la même matrice.
  - **`style-profil`** (v2) : le prompt distingue maintenant explicitement les tiers (poids décroissant S → A → B) dans le texte comme dans l'ordre de présentation des photos à Claude.
  - **`smart-endpoint`** (v7) : les registres texte libre sont remplacés par les mots de tier S/A comme contexte de style rapide, en complément de la description générée.
- Table `registres_style` conservée en base (données de Lionel non supprimées) mais plus utilisée par l'appli.

## [1.28.0] - 2026-08-09

### Ajouté
- **Feature "Photos de style" (préparation MCP — étape 1/3)** : chaque profil peut désormais fournir jusqu'à 20 photos qui représentent sa garde-robe ou le style qu'il vise, à partir desquelles Waïma génère une description de style (titre évocateur + paragraphe), affichée dans Profil.
  - **Nouvelle table `photos_style`** (RLS activée d'emblée, limite de 20 imposée par trigger côté base en plus du contrôle côté formulaire).
  - **Nouvelle étape d'onboarding** "Montre-moi ton style", entre Registres et Système — ajout de photos, optionnel.
  - **Section dédiée dans Profil** : grille de gestion (ajout/suppression à tout moment), affichage de la description générée, bouton "✨ Régénérer mon style".
  - **Génération à la demande uniquement** (jamais automatique à l'ajout/suppression d'une photo) — nouvelle Edge Function `style-profil`, qui envoie l'ensemble des photos à Claude en un seul appel multi-images, avec un ton assumé "fiche de caractère" (chaleureux, évocateur) mais ancré dans des observations visuelles concrètes (palette, coupes, formalité dominante), jamais de généralités vagues.
  - **Intégration dans `smart-endpoint`** (v6) : la description de style générée s'ajoute désormais au contexte du prompt d'analyse d'une pièce, aux côtés des registres de style — améliore la justesse de classification (ADN, formalité, polyvalence) d'une nouvelle pièce en donnant à Claude un repère visuel concret plutôt qu'une simple étiquette textuelle.

## [1.27.5] - 2026-08-07

### Corrigé
- **Bug racine identifié et corrigé** : la fonction serveur se connectait à Supabase sans préciser le schéma `waima` (contrairement au frontend qui le fait explicitement) — elle cherchait donc les tables `adn`, `categories`, `registres_style` dans le schéma `public`, vide. Résultat : la liste des codes ADN valides arrivait vide côté serveur, rendant la contrainte `enum` (ajoutée en 1.27.4) inopérante — Claude produisait alors un code ADN qui ne correspondait à aucune vraie valeur, d'où les chips jamais cochés malgré l'intensité correctement renseignée. Ajout de `db: { schema: 'waima' }` au client Supabase de la fonction.
- Garde-fou ajouté : un log d'erreur explicite se déclenche désormais si la liste des codes ADN arrive vide en base, pour repérer ce type de problème immédiatement plutôt qu'après plusieurs tentatives.

## [1.27.4] - 2026-08-07

### Corrigé
- **ADN toujours pas coché malgré deux tentatives de normalisation côté serveur (1.27.1, 1.27.3)** : abandon de l'approche "demander du JSON en texte libre puis deviner ce que Claude a voulu dire". Passage au **tool calling** de l'API Claude avec schéma strict (`enum` sur les codes ADN, texture, saison, `minimum`/`maximum` sur les échelles numériques) — l'API elle-même contraint la réponse à respecter le schéma, il n'y a plus de place pour qu'une variante mal formée ("Le Mâle" au lieu de "male") passe entre les mailles. Le format de réponse renvoyé à l'appli ne change pas, donc aucune modification frontend nécessaire.
- Logs enrichis avec la réponse Claude complète (pas seulement le JSON extrait) pour diagnostiquer plus vite en cas de nouveau souci.

## [1.27.3] - 2026-08-07

### Corrigé
- **ADN dominant/secondaire toujours pas coché malgré la normalisation 1.27.1** : le matching était encore trop strict (comparaison exacte code/libellé après juste trim+minuscule). Remplacé par un matching accent-insensible, article ignoré ("Le Mâle" → "male"), avec un recours en sous-chaîne en dernière instance — beaucoup plus tolérant à ce que Claude renvoie réellement malgré la consigne.
- **Logs ajoutés côté fonction serveur** (réponse brute de Claude + résultat normalisé) pour diagnostiquer précisément si un cas de figure similaire se reproduit, plutôt que de deviner à l'aveugle.

### Ajouté
- **ID suggéré automatiquement** après une analyse IA (ex. `PAN-Vert-Decontracte-CT`), en suivant la convention `CAT-Couleur-Type-Marque` déjà en usage. Ne s'applique qu'à l'ajout d'une nouvelle pièce (jamais en édition, le champ ID reste verrouillé) et seulement si le champ est encore vide.

## [1.27.2] - 2026-08-07

### Modifié
- **Fréquence et attachement à 3/5 par défaut après analyse IA**, plutôt que vides — un score provisoire se calcule immédiatement (au lieu de rester absent tant que ces deux champs ne sont pas remplis manuellement), à ajuster une fois la pièce réellement portée.

## [1.27.1] - 2026-08-07

### Corrigé
- **Photo depuis la galerie ne fonctionnait pas avec l'analyse IA** : le bouton reposait sur le fichier brut sélectionné, chemin de code fragile selon le picker Android utilisé. Unifié sur la photo déjà uploadée (`currentPhotoUrl`), le même chemin déjà éprouvé pour l'affichage — fonctionne pareil que la photo vienne de l'appareil photo, de la galerie, ou d'une pièce en cours d'édition.
- **Rôle jamais coché après analyse IA** : normal, ce n'est pas déductible d'une photo (comme fréquence/attachement) — mais laissé vide c'était plus gênant qu'utile. Mis sur "Rotation" par défaut désormais, comme pour une nouvelle pièce ajoutée manuellement.
- **ADN dominant/secondaire pas cochés** : Claude ne respectait pas toujours exactement le code attendu (ex. libellé complet au lieu du code technique). Ajout d'une couche de normalisation côté fonction serveur (`smart-endpoint`) qui valide/corrige texture, saison, codes ADN et clamp les échelles numériques avant de renvoyer le résultat à l'appli — protège aussi contre de futures dérives similaires sur les autres champs.
- **Description IA générique** : ajout d'un gabarit et d'un exemple réel dans le prompt pour que le texte généré suive le style des fiches existantes (matière/construction → registre ADN → lien avec le reste de la garde-robe → suggestion d'usage).

## [1.27.0] - 2026-08-07

### Ajouté
- **Feature 2 — Analyse IA embarquée** : bouton "✨ Analyser avec l'IA" dans le formulaire d'ajout, sous la zone photo.
  - **Backend** : nouvelle Edge Function Supabase (`smart-endpoint`, déployée manuellement via le dashboard) qui reçoit la photo, appelle l'API Claude (Sonnet 5, vision) avec un prompt qui embarque les registres de style personnels du profil connecté, les catégories déjà existantes et les archétypes ADN disponibles, puis renvoie un JSON structuré. La clé API Claude est stockée en secret Supabase (`WAIMA_CLAUDE`), jamais exposée côté navigateur.
  - **Frontend** : le clic envoie la photo (fraîchement sélectionnée ou déjà uploadée en édition) à la fonction, puis pré-remplit libellé, catégorie/sous-catégorie/marque (avec création à la volée si nouveauté), couleur, matière, texture, formalité, saison, ADN dominant/secondaire + intensités, polyvalence, premium perçu, qualité perçue, et description IA.
  - **Fréquence et attachement ne sont jamais pré-remplis par l'IA** — ce sont des estimations d'usage réel propres à la personne, pas déductibles d'une photo ; restent à saisir manuellement.
  - **Rien ne s'enregistre automatiquement** : les champs pré-remplis restent à valider/ajuster avant d'appuyer sur Enregistrer, comme n'importe quel remplissage manuel.

## [1.26.1] - 2026-08-07

### Corrigé
- **Bug de positionnement dans la visite guidée après l'étape "Rôle"** : l'ordre des étapes ne suivait pas l'ordre réel du formulaire (elle sautait au bloc ADN plus bas, puis remontait à Formalité juste après) — provoquait un aller-retour de scroll trop rapide pour le délai fixe utilisé, désynchronisant le cadre de surlignage. Deux corrections : l'ordre des étapes suit maintenant l'ordre réel du formulaire (Rôle → Formalité → Fréquence/Attachement → ADN dominant), et le scroll vers chaque champ est instantané plutôt qu'animé — élimine la dépendance à un délai deviné pour positionner le cadre correctement.

## [1.26.0] - 2026-08-07

### Ajouté
- **Onboarding complet**, déclenché automatiquement à la première connexion (basé sur `profiles.onboarding_complete`), rejouable à tout moment via un bouton "Relancer le tutoriel" dans Profil :
  - Étape 1 : prénom/nom (`profiles.prenom`, `profiles.nom`)
  - Étape 2 : philosophie Waïma (anti-accumulation, système évolutif)
  - Étape 3 : choix du profil homme/femme (existant, intégré au parcours)
  - Étape 4 : **registres de style personnels** — nouvelle table `waima.registres_style` (libellé + description, par utilisateur), distincte de l'ADN par pièce, éditable en ajoutant/retirant des lignes ; affichée en lecture dans Profil
  - Étape 5 : explication du système (rôles façon foot, score, cohérence)
  - Étape 6 : lancement optionnel d'une **visite guidée** du formulaire d'ajout, pièce réelle à la clé
- **Visite guidée maison** (surlignage + bulle d'explication positionnée sur le vrai champ, sans dépendance externe type Shepherd/Intro.js — implémentation légère cohérente avec le thème sombre de l'appli) : 8 étapes sur le formulaire (libellé, catégorie, prix, rôle, ADN dominant, formalité, fréquence/attachement, enregistrement). Navigable (précédent/suivant/terminer), saute proprement une étape si le champ ciblé n'est pas trouvé.
- **Compte de Lionel pré-marqué comme onboardé** (projet déjà mature) avec ses 4 registres de style déjà connus pré-remplis (Business contemporain structuré, British texturé, Élégance italienne lumineuse, Minimalisme premium moderne) — pas de tutoriel forcé au prochain chargement, mais rejouable s'il le souhaite.

## [1.25.5] - 2026-08-07

### Ajouté
- **Création de nouvelle catégorie principale** dans le formulaire d'ajout/édition — option "+ Nouvelle catégorie…" dans le menu Catégorie, avec champ texte, sur le même principe que Sous-catégorie et Marque (qui l'avaient déjà). Le backend supportait déjà la création à la volée ; il manquait l'option côté formulaire.

## [1.25.4] - 2026-08-07

### Modifié
- **"Voir les X autres" devient une vraie bascule** : re-cliquer replie la liste (bouton repasse à "Voir les X autres"), au lieu de disparaître définitivement après le premier clic.

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
