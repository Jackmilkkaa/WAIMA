// src/index.js — point d'entrée du Worker waima-mcp, désormais un vrai serveur
// d'autorisation OAuth 2.1 (via @cloudflare/workers-oauth-provider) devant le serveur MCP.
//
// Pourquoi construire OAuthProvider à l'intérieur de fetch() plutôt qu'au niveau module :
// tokenExchangeCallback (option du constructeur) n'a pas accès à `env` dans ses paramètres
// (voir TokenExchangeCallbackOptions dans la lib — pas de champ env). Comme il a besoin de
// SUPABASE_URL/SUPABASE_ANON_KEY pour rafraîchir la session Supabase à chaque renouvellement
// de token OAuth, on capture `env` par fermeture en construisant le provider à chaque requête.
// Construction pure (pas d'I/O), coût négligeable.

import { OAuthProvider, OAuthError } from "@cloudflare/workers-oauth-provider";
import { mcpApiHandler } from "./mcp.js";
import { handleAuthorize } from "./authorize.js";

const RESOURCE_URL = "https://waima-mcp.mycpage.workers.dev/mcp";
const ISSUER_URL = "https://waima-mcp.mycpage.workers.dev";

async function refreshSupabaseSession(env, refreshToken) {
  const resp = await fetch(`${env.SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: { apikey: env.SUPABASE_ANON_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  if (!resp.ok) {
    const body = await resp.text();
    throw new OAuthError("invalid_grant", {
      description: `Session Supabase expirée ou révoquée (${resp.status}): ${body}`,
    });
  }
  return resp.json();
}

const defaultHandler = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/authorize") {
      return handleAuthorize(request, env);
    }

    if (url.pathname === "/" || url.pathname === "") {
      return new Response(
        JSON.stringify({ status: "ok", server: "waima-mcp", version: "0.2.0", auth: "oauth2.1" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response("Not found", { status: 404 });
  },
};

function buildProvider(env) {
  return new OAuthProvider({
    apiRoute: "/mcp",
    apiHandler: mcpApiHandler,
    defaultHandler,
    authorizeEndpoint: "/authorize",
    tokenEndpoint: "/token",
    clientRegistrationEndpoint: "/register",
    scopesSupported: ["wardrobe.read"],
    resourceMetadata: {
      resource: RESOURCE_URL,
      authorization_servers: [ISSUER_URL],
      scopes_supported: ["wardrobe.read"],
      resource_name: "Waïma — garde-robe de Lionel",
    },
    // À chaque émission ou renouvellement de token OAuth (côté claude.ai), on rafraîchit
    // la session Supabase correspondante et on embarque le nouvel access_token Supabase
    // directement dans les props du token — le handler MCP n'a donc plus jamais à faire
    // d'échange lui-même, et aucune clé admin/service n'intervient à aucun moment ici.
    tokenExchangeCallback: async (options) => {
      if (options.grantType === "authorization_code") {
        // props initiales déjà fraîches (posées par /authorize au moment du login) :
        // pas besoin de re-rafraîchir immédiatement.
        return {
          accessTokenProps: options.props,
          newProps: {
            supabaseUserId: options.props.supabaseUserId,
            supabaseRefreshToken: options.props.supabaseRefreshToken,
          },
        };
      }

      if (options.grantType === "refresh_token") {
        const session = await refreshSupabaseSession(env, options.props.supabaseRefreshToken);
        return {
          accessTokenProps: {
            supabaseUserId: session.user.id,
            supabaseAccessToken: session.access_token,
            supabaseRefreshToken: session.refresh_token,
          },
          newProps: {
            supabaseUserId: session.user.id,
            supabaseRefreshToken: session.refresh_token,
          },
          accessTokenTTL: session.expires_in,
        };
      }
    },
  });
}

export default {
  async fetch(request, env, ctx) {
    return buildProvider(env).fetch(request, env, ctx);
  },
  async scheduled(event, env, ctx) {
    const result = await buildProvider(env).purgeExpiredData(env, { batchSize: 100 });
    console.log(`waima-mcp cleanup — grants vérifiés: ${result.grantsChecked}, purgés: ${result.grantsPurged}`);
  },
};
