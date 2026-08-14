// src/mcp.js — Serveur MCP JSON-RPC (Streamable HTTP), outil search_items.
//
// Ce handler n'est appelé QUE pour des requêtes déjà authentifiées par OAuthProvider
// (Bearer <token OAuth émis par notre propre Worker>). ctx.props contient déjà un
// access_token Supabase frais (voir tokenExchangeCallback dans index.js) — ce fichier
// n'a donc plus aucun échange de token à faire, juste la requête RLS elle-même.

const PROTOCOL_VERSION_DEFAULT = "2025-06-18";

function jsonRpcResult(id, result) {
  return { jsonrpc: "2.0", id, result };
}
function jsonRpcError(id, code, message) {
  return { jsonrpc: "2.0", id, error: { code, message } };
}
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Mcp-Session-Id, Accept",
    "Access-Control-Expose-Headers": "Mcp-Session-Id",
  };
}
function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders() },
  });
}

const SEARCH_ITEMS_TOOL = {
  name: "search_items",
  description:
    "Recherche des pièces dans la garde-robe Waïma de l'utilisateur authentifié. " +
    "Recherche libre sur libellé/description/couleur/matière, avec filtres optionnels " +
    "sur le rôle stratégique et le niveau de formalité (1=ultra casual, 5=business strict formel).",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Texte libre à rechercher (libellé, description IA, couleur, matière).",
      },
      role_code: {
        type: "string",
        description:
          "Filtrer par rôle exact (insensible à la casse) : capitaine, titulaire, rotation, " +
          "remplacant, transfert, spectateur, retraite, recrue_potentielle.",
      },
      categorie: {
        type: "string",
        description:
          "Filtrer par catégorie (insensible à la casse, préfixe accepté) : Chemises, Pantalons, " +
          "Chaussures, Mailles, Costumes, Vestes, Manteaux, etc.",
      },
      sous_categorie: {
        type: "string",
        description:
          "Filtrer par sous-catégorie (insensible à la casse, préfixe accepté), ex : Twill, Popeline, " +
          "Lin, Oxford, Denim, Q-zip, Boots, Richelieu, Sneakers cuir, Chino, Jean brut.",
      },
      formalite_min: {
        type: "integer",
        minimum: 1,
        maximum: 5,
        description: "Niveau de formalité minimum (1 à 5).",
      },
      formalite_max: {
        type: "integer",
        minimum: 1,
        maximum: 5,
        description: "Niveau de formalité maximum (1 à 5).",
      },
      limit: {
        type: "integer",
        minimum: 1,
        maximum: 50,
        description: "Nombre maximum de résultats (défaut 20).",
      },
    },
  },
};

async function searchItems(env, accessToken, args) {
  const hasCategoryFilter = !!(args.categorie || args.sous_categorie);
  const categoriesEmbed = hasCategoryFilter ? "categories!inner(categorie,sous_categorie)" : "categories(categorie,sous_categorie)";

  const params = new URLSearchParams();
  params.set(
    "select",
    `id,libelle,couleur_principale,matiere,texture,formalite,role_code,adn_dominant_code,polyvalence,premium_percu,score,description_ia,${categoriesEmbed}`
  );

  if (args.role_code) {
    params.set("role_code", `eq.${String(args.role_code).toLowerCase().trim()}`);
  }
  if (args.categorie) {
    params.set("categories.categorie", `ilike.*${String(args.categorie).trim()}*`);
  }
  if (args.sous_categorie) {
    params.set("categories.sous_categorie", `ilike.*${String(args.sous_categorie).trim()}*`);
  }
  if (typeof args.formalite_min === "number" && typeof args.formalite_max === "number") {
    params.set("and", `(formalite.gte.${args.formalite_min},formalite.lte.${args.formalite_max})`);
  } else if (typeof args.formalite_min === "number") {
    params.set("formalite", `gte.${args.formalite_min}`);
  } else if (typeof args.formalite_max === "number") {
    params.set("formalite", `lte.${args.formalite_max}`);
  }

  let url = `${env.SUPABASE_URL}/rest/v1/wardrobe_items?${params.toString()}`;

  if (args.query) {
    const q = String(args.query).replace(/[,()]/g, " ").trim();
    url += `&or=(libelle.ilike.*${q}*,description_ia.ilike.*${q}*,couleur_principale.ilike.*${q}*,matiere.ilike.*${q}*)`;
  }

  const limit = Math.min(Math.max(parseInt(args.limit, 10) || 20, 1), 50);
  url += `&limit=${limit}&order=score.desc.nullslast`;

  const resp = await fetch(url, {
    headers: {
      apikey: env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${accessToken}`,
      "Accept-Profile": "waima",
    },
  });

  if (!resp.ok) {
    const errBody = await resp.text();
    throw new Error(`Requête wardrobe_items échouée (${resp.status}): ${errBody}`);
  }
  return resp.json();
}

async function handleRpcMessage(msg, env, props) {
  const { id, method, params } = msg;
  const isNotification = id === undefined || id === null;

  try {
    if (method === "initialize") {
      const clientVersion = params && params.protocolVersion;
      return jsonRpcResult(id, {
        protocolVersion: clientVersion || PROTOCOL_VERSION_DEFAULT,
        capabilities: { tools: {} },
        serverInfo: { name: "waima-mcp", version: "0.3.0" },
      });
    }
    if (method === "notifications/initialized" || method === "notifications/cancelled") {
      return null;
    }
    if (method === "ping") {
      return jsonRpcResult(id, {});
    }
    if (method === "tools/list") {
      return jsonRpcResult(id, { tools: [SEARCH_ITEMS_TOOL] });
    }
    if (method === "tools/call") {
      const toolName = params && params.name;
      const args = (params && params.arguments) || {};
      if (toolName !== "search_items") {
        return jsonRpcError(id, -32602, `Outil inconnu: ${toolName}`);
      }
      if (!props || !props.supabaseAccessToken) {
        return jsonRpcError(id, -32001, "Session Supabase manquante — réautorisation nécessaire.");
      }
      const items = await searchItems(env, props.supabaseAccessToken, args);
      return jsonRpcResult(id, {
        content: [{ type: "text", text: JSON.stringify(items, null, 2) }],
        isError: false,
      });
    }
    if (isNotification) return null;
    return jsonRpcError(id, -32601, `Méthode inconnue: ${method}`);
  } catch (e) {
    if (isNotification) return null;
    return jsonRpcError(id, -32000, e.message || "Erreur interne du serveur MCP.");
  }
}

export const mcpApiHandler = {
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }
    if (request.method === "GET") {
      return jsonResponse({ status: "ok", server: "waima-mcp", version: "0.3.0" });
    }
    if (request.method !== "POST") {
      return jsonResponse({ error: "Méthode non supportée" }, 405);
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return jsonResponse(jsonRpcError(null, -32700, "JSON invalide"), 400);
    }

    const props = ctx.props;
    const messages = Array.isArray(body) ? body : [body];
    const responses = [];
    for (const msg of messages) {
      const result = await handleRpcMessage(msg, env, props);
      if (result !== null) responses.push(result);
    }

    if (responses.length === 0) {
      return new Response(null, { status: 202, headers: corsHeaders() });
    }

    const payload = Array.isArray(body) ? responses : responses[0];
    return jsonResponse(payload, 200);
  },
};
