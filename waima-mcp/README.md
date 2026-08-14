# waima-mcp

Serveur MCP (Model Context Protocol) pour Waïma, exposé en tant que Worker Cloudflare.

Permet à des clients MCP (claude.ai, Claude Desktop, ChatGPT en lecture seule à terme...)
d'interroger la garde-robe Waïma en langage naturel, via un outil `search_items` qui
requête `wardrobe_items` sur Supabase avec RLS appliqué.

## Déploiement

- URL : `https://waima-mcp.mycpage.workers.dev`
- Endpoint MCP (Streamable HTTP, JSON-RPC) : `/mcp`
- Auth : OAuth 2.1, via [`@cloudflare/workers-oauth-provider`](https://github.com/cloudflare/workers-oauth-provider)

## Architecture

- `src/index.js` — assemblage `OAuthProvider` (découverte RFC 8414/9728, enregistrement
  dynamique de client, `tokenExchangeCallback` qui rafraîchit la session Supabase à chaque
  renouvellement de token OAuth).
- `src/authorize.js` — écran `/authorize` (login email/mot de passe Supabase, aucune clé
  admin impliquée).
- `src/mcp.js` — logique métier MCP (JSON-RPC, outil `search_items`).

Aucune clé service/admin Supabase n'intervient dans le chemin d'une requête utilisateur :
chaque appel `search_items` utilise l'`access_token` Supabase propre à l'utilisateur
authentifié (RLS appliqué normalement), obtenu via le flow OAuth.

## Secrets Worker requis (`wrangler secret put`)

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

## Binding requis

- KV namespace `OAUTH_KV` (stockage chiffré des grants/tokens OAuth)

## Déploiement

```bash
npm install
npx wrangler deploy
```

Voir `CHANGELOG.md` pour l'historique des versions.
