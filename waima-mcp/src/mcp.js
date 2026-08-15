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

const RESOURCES = [
  {
    uri: "waima://doctrine",
    name: "Doctrine Waïma",
    description:
      "Méthodologie générale du système Waïma : grille de formalité, système de rôles, " +
      "archétypes ADN, règles budgétaires, grille d'évaluation d'achat. Contenu générique, " +
      "indépendant de l'utilisateur authentifié.",
    mimeType: "text/markdown",
  },
  {
    uri: "waima://profile",
    name: "Profil de l'utilisateur authentifié",
    description:
      "Profil de style (diagnostic colorimétrique, description de style) et état actuel de la " +
      "garde-robe (répartition par rôle, pièces Capitaine) de l'utilisateur connecté. Contenu " +
      "dynamique, propre à chaque utilisateur.",
    mimeType: "text/markdown",
  },
];

const DOCTRINE_MD = `# Doctrine Waïma — méthodologie générale

Waïma est un système de cohérence personnelle appliqué à la garde-robe : chaque pièce doit
avoir une fonction, renforcer l'ensemble, et justifier sa place. Question centrale avant tout
achat : "Est-ce que cette pièce améliore réellement le système global ?"

## Grille de formalité (1 à 5)

1. Ultra casual / week-end décontracté
2. Casual maîtrisé / Friday propre
3. Casual business standard
4. Business structuré
5. Business strict formel

## Système de rôles (centralité décroissante)

1. **Capitaine** — pièce identitaire, fondation de l'image.
2. **Titulaire** — pilier fiable, porté très régulièrement.
3. **Rotation** — bonne pièce, non essentielle.
4. **Remplaçant** — usage ponctuel, mission spécifique.
5. **Transfert** — à challenger : désalignée ou redondante, décision pas encore tranchée.
6. **Spectateur** — usage week-end/vacances, hors périmètre professionnel actif.
7. **Retraité** — sortie définitive du système actif, conservée comme mémoire historique.
8. **Recrue potentielle** — piste d'achat identifiée, pas encore acquise.

## ADN dominant (6 archétypes, sans hiérarchie de valeur)

- **Le Patriarche** → Autorité & Respect
- **Le Stratège** → Intelligence & Maîtrise
- **Le Leader** → Charisme & Énergie positive
- **Le Dandy** → Classe & Élégance
- **L'Homme Moderne** → Simplicité & Humilité
- **Le Mâle** → Confiance & Force tranquille

## Règles budgétaires de référence

- Chaussures : 200–300 € OK si construction sérieuse (Goodyear).
- Veste cuir : 300 € max sauf pièce majeure.
- Blazer : 250 € max sauf pièce majeure.
- Pull : 100 € max sauf cachemire exceptionnel.
- Pantalon : 80 € max sauf pièce exceptionnelle.
- Manteau : 300 € max sauf pièce majeure.
- Chemise : 60 € max sauf pièce exceptionnelle.
- T-shirt : 30 € max sauf pièce exceptionnelle.

Un dépassement se justifie seulement si la pièce augmente fortement la cohérence globale,
apporte une vraie longévité, couvre un manque identifié, ou renforce l'image cible.

## Grille d'évaluation rapide d'un achat (10 critères)

Cohérence avec l'archétype directeur, usage réel, polyvalence, niveau de formalité couvert,
compatibilité couleurs, compatibilité avec les pièces existantes, qualité perçue, longévité,
rapport qualité/prix, absence de redondance.

- 8 critères ou plus validés → achat probablement stratégique.
- 6 à 7 → achat possible mais à challenger.
- 4 à 5 → achat faible.
- Moins de 4 → achat à éviter.

## Statuts d'achat

Achat stratégique · Achat utile mais non prioritaire · Achat plaisir acceptable ·
Achat redondant · Achat faible · Achat à éviter.

## Règle anti-coup de cœur

Un coup de cœur n'est pas interdit, mais il doit être nommé comme tel : pourquoi il plaît,
pourquoi il peut être dangereux, s'il reste acceptable, ce qu'il remplace ou complète, quel
usage réel il aura. Un achat plaisir acceptable doit rester rare et assumé.
`;

async function buildProfileResource(env, accessToken, userId) {
  const profResp = await fetch(
    `${env.SUPABASE_URL}/rest/v1/profiles?select=display_name,prenom,nom,style_titre,style_description,diagnostic_teint&user_id=eq.${userId}`,
    {
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${accessToken}`,
        "Accept-Profile": "waima",
      },
    }
  );
  if (!profResp.ok) {
    throw new Error(`Requête profiles échouée (${profResp.status}): ${await profResp.text()}`);
  }
  const profRows = await profResp.json();
  const profile = profRows[0] || null;

  const rolesResp = await fetch(`${env.SUPABASE_URL}/rest/v1/wardrobe_items?select=role_code`, {
    headers: {
      apikey: env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${accessToken}`,
      "Accept-Profile": "waima",
    },
  });
  if (!rolesResp.ok) {
    throw new Error(`Requête wardrobe_items (stats rôles) échouée (${rolesResp.status}): ${await rolesResp.text()}`);
  }
  const roleRows = await rolesResp.json();
  const roleCounts = {};
  for (const row of roleRows) {
    const r = row.role_code || "non_renseigné";
    roleCounts[r] = (roleCounts[r] || 0) + 1;
  }
  const totalPieces = roleRows.length;

  const capResp = await fetch(
    `${env.SUPABASE_URL}/rest/v1/wardrobe_items?select=libelle,score,categories(categorie)&role_code=eq.capitaine&order=score.desc.nullslast&limit=8`,
    {
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${accessToken}`,
        "Accept-Profile": "waima",
      },
    }
  );
  if (!capResp.ok) {
    throw new Error(`Requête wardrobe_items (pièces Capitaine) échouée (${capResp.status}): ${await capResp.text()}`);
  }
  const capItems = await capResp.json();

  const lines = [];
  lines.push("# Profil de l'utilisateur authentifié\n");

  if (profile) {
    const name = profile.prenom || profile.display_name || "Utilisateur";
    lines.push(`**Nom** : ${name}${profile.nom ? " " + profile.nom : ""}\n`);
    if (profile.style_titre) {
      lines.push(`## Style : ${profile.style_titre}\n`);
    }
    if (profile.style_description) {
      lines.push(profile.style_description + "\n");
    }
    if (profile.diagnostic_teint) {
      const d = profile.diagnostic_teint;
      lines.push("## Diagnostic colorimétrique\n");
      lines.push(
        `- Saison dominante : ${d.saison_dominante || "?"}\n` +
          `- Undertone : ${d.undertone || "?"}\n` +
          `- Valeur : ${d.valeur || "?"} · Chroma : ${d.chroma || "?"}\n` +
          (d.notes ? `- Notes : ${d.notes}\n` : "")
      );
    }
  } else {
    lines.push("_Aucune fiche de style enregistrée pour cet utilisateur._\n");
  }

  lines.push(`## État de la garde-robe (${totalPieces} pièces recensées)\n`);
  const roleOrder = ["capitaine", "titulaire", "rotation", "remplacant", "transfert", "spectateur", "retraite", "recrue_potentielle"];
  for (const r of roleOrder) {
    if (roleCounts[r]) lines.push(`- ${r} : ${roleCounts[r]}`);
  }
  for (const r of Object.keys(roleCounts)) {
    if (!roleOrder.includes(r)) lines.push(`- ${r} : ${roleCounts[r]}`);
  }
  lines.push("");

  if (capItems.length > 0) {
    lines.push("## Pièces Capitaine (identitaires, fondations de l'image)\n");
    for (const item of capItems) {
      const cat = (item.categories && item.categories.categorie) || "?";
      lines.push(`- ${item.libelle} (${cat}, score ${item.score ?? "?"})`);
    }
  }

  return lines.join("\n");
}

const GET_DOCTRINE_TOOL = {
  name: "get_doctrine",
  description:
    "Renvoie la doctrine générale du système Waïma : grille de formalité, système de rôles, " +
    "archétypes ADN, règles budgétaires, grille d'évaluation d'achat. Contenu générique, " +
    "identique pour tout utilisateur.",
  inputSchema: { type: "object", properties: {} },
};

const GET_PROFILE_TOOL = {
  name: "get_profile",
  description:
    "Renvoie le profil de style (diagnostic colorimétrique, description de style) et l'état " +
    "actuel de la garde-robe (répartition par rôle, pièces Capitaine) de l'utilisateur authentifié.",
  inputSchema: { type: "object", properties: {} },
};

const TOOLS = [SEARCH_ITEMS_TOOL, GET_DOCTRINE_TOOL, GET_PROFILE_TOOL];

async function handleRpcMessage(msg, env, props) {
  const { id, method, params } = msg;
  const isNotification = id === undefined || id === null;

  try {
    if (method === "initialize") {
      const clientVersion = params && params.protocolVersion;
      return jsonRpcResult(id, {
        protocolVersion: clientVersion || PROTOCOL_VERSION_DEFAULT,
        capabilities: { tools: {}, resources: {} },
        serverInfo: { name: "waima-mcp", version: "0.4.0" },
      });
    }
    if (method === "notifications/initialized" || method === "notifications/cancelled") {
      return null;
    }
    if (method === "ping") {
      return jsonRpcResult(id, {});
    }
    if (method === "tools/list") {
      return jsonRpcResult(id, { tools: TOOLS });
    }
    if (method === "resources/list") {
      return jsonRpcResult(id, { resources: RESOURCES });
    }
    if (method === "resources/read") {
      const uri = params && params.uri;
      if (uri === "waima://doctrine") {
        return jsonRpcResult(id, {
          contents: [{ uri, mimeType: "text/markdown", text: DOCTRINE_MD }],
        });
      }
      if (uri === "waima://profile") {
        if (!props || !props.supabaseAccessToken || !props.supabaseUserId) {
          return jsonRpcError(id, -32001, "Session Supabase manquante — réautorisation nécessaire.");
        }
        const text = await buildProfileResource(env, props.supabaseAccessToken, props.supabaseUserId);
        return jsonRpcResult(id, {
          contents: [{ uri, mimeType: "text/markdown", text }],
        });
      }
      return jsonRpcError(id, -32602, `Ressource inconnue: ${uri}`);
    }
    if (method === "tools/call") {
      const toolName = params && params.name;
      const args = (params && params.arguments) || {};

      if (toolName === "search_items") {
        if (!props || !props.supabaseAccessToken) {
          return jsonRpcError(id, -32001, "Session Supabase manquante — réautorisation nécessaire.");
        }
        const items = await searchItems(env, props.supabaseAccessToken, args);
        return jsonRpcResult(id, {
          content: [{ type: "text", text: JSON.stringify(items, null, 2) }],
          isError: false,
        });
      }

      if (toolName === "get_doctrine") {
        return jsonRpcResult(id, {
          content: [{ type: "text", text: DOCTRINE_MD }],
          isError: false,
        });
      }

      if (toolName === "get_profile") {
        if (!props || !props.supabaseAccessToken || !props.supabaseUserId) {
          return jsonRpcError(id, -32001, "Session Supabase manquante — réautorisation nécessaire.");
        }
        const text = await buildProfileResource(env, props.supabaseAccessToken, props.supabaseUserId);
        return jsonRpcResult(id, {
          content: [{ type: "text", text }],
          isError: false,
        });
      }

      return jsonRpcError(id, -32602, `Outil inconnu: ${toolName}`);
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
      return jsonResponse({ status: "ok", server: "waima-mcp", version: "0.4.0" });
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
