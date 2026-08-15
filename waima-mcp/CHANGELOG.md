# Changelog — waima-mcp

Toutes les modifications notables de ce projet sont documentées ici.
Format inspiré de [Keep a Changelog](https://keepachangelog.com/), versionnage [semver](https://semver.org/).

## [0.4.0] — 2026-08-14

### Ajouté
- Ressources MCP `waima://doctrine` (statique, générique) et `waima://profile` (dynamique,
  lit `waima.profiles` + stats live de `wardrobe_items`, RLS appliqué par utilisateur).
- Outils `get_doctrine` et `get_profile` en doublon des ressources ci-dessus : le support
  du primitive "resources" par les clients MCP (claude.ai en particulier) n'est pas vérifiable
  depuis une conversation Claude standard, donc on garantit l'accès via `tools/call`
  (déjà prouvé fonctionnel) en plus d'exposer les ressources pour les clients qui les liraient.
- `capabilities.resources: {}` déclaré dans la réponse `initialize`.

## [0.3.0] — 2026-08-14

### Ajouté
- Filtres `categorie` et `sous_categorie` sur `search_items` (embed PostgREST sur
  `categories`, jointure `!inner` pour filtrage précis).
- Chaque résultat inclut désormais sa catégorie/sous-catégorie.

## [0.2.0] — 2026-08-14

### Changé
- Migration complète vers OAuth 2.1 via `@cloudflare/workers-oauth-provider`.
  Le token statique `wma_xxx` de l'étape 0 est abandonné.
- `/authorize` : écran de login Supabase (email/mot de passe), aucune clé admin.
- `tokenExchangeCallback` rafraîchit la session Supabase à chaque renouvellement du
  token OAuth et embarque un `access_token` Supabase frais dans les props du token —
  `search_items` n'a plus aucun échange à faire.
- Table `waima.mcp_tokens` et clé `SUPABASE_SERVICE_KEY` : obsolètes (supprimées côté
  infra dans la foulée de cette version).

### Ajouté
- Découverte OAuth (RFC 8414 / RFC 9728) et enregistrement dynamique de client (RFC 7591),
  gérés automatiquement par la librairie.
- Cron quotidien de purge des grants/tokens expirés (KV `OAUTH_KV`).

## [0.1.0] — 2026-08-14

### Ajouté
- Première version (étape 0) : Worker JSON-RPC/Streamable HTTP, outil `search_items`.
- Auth pré-OAuth par token personnel opaque (`wma_xxx`), table `waima.mcp_tokens`.
- Non testable depuis claude.ai (UI "Add custom connector" OAuth-only en compte perso) —
  limite ayant motivé la version 0.2.0.
