// src/authorize.js — écran /authorize.
//
// Lionel (ou Anna plus tard) s'authentifie avec ses identifiants Waïma existants
// (compte Supabase email/mot de passe, le même que pour l'appli). On vérifie ces
// identifiants directement contre l'API Auth Supabase avec la clé anon — aucune clé
// admin/service impliquée, exactement comme un login normal dans l'appli.

function page(clientName, error) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Connexion — Waïma MCP</title>
<style>
  :root {
    --bg: #14181c; --surface: #1b2126; --border: #2a3138;
    --text: #e8e6e1; --text-dim: #8b939b; --accent: #22c3dd; --err: #f87171;
    --sans: -apple-system, "Segoe UI", ui-sans-serif, system-ui, sans-serif;
    --mono: ui-monospace, "SF Mono", Consolas, monospace;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: var(--bg); color: var(--text); font-family: var(--sans);
  }
  .card {
    width: 360px; background: var(--surface); border: 1px solid var(--border);
    border-radius: 14px; padding: 28px;
  }
  .eyebrow {
    font-family: var(--mono); font-size: 11px; color: var(--accent);
    letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 6px;
  }
  h1 { font-size: 18px; margin: 0 0 4px; }
  .sub { font-size: 13px; color: var(--text-dim); margin-bottom: 22px; line-height: 1.4; }
  label { display: block; font-size: 12px; color: var(--text-dim); margin: 14px 0 6px; }
  input {
    width: 100%; background: #20272d; border: 1px solid var(--border); border-radius: 8px;
    color: var(--text); font-size: 14px; padding: 10px 12px; outline: none;
  }
  input:focus { border-color: var(--accent); }
  button {
    margin-top: 20px; width: 100%; background: var(--accent); color: #0d1417; border: none;
    border-radius: 8px; padding: 11px; font-weight: 600; font-size: 14px; cursor: pointer;
  }
  .error {
    margin-top: 14px; font-size: 12px; color: var(--err); background: #f8717114;
    border: 1px solid var(--err); border-radius: 6px; padding: 8px 10px;
  }
</style>
</head>
<body>
  <div class="card">
    <div class="eyebrow">Waïma MCP</div>
    <h1>Connexion requise</h1>
    <div class="sub">${clientName} demande l'accès à ta garde-robe Waïma. Utilise tes identifiants Waïma habituels.</div>
    <form method="POST">
      <label for="email">Email</label>
      <input id="email" name="email" type="email" required autofocus />
      <label for="password">Mot de passe</label>
      <input id="password" name="password" type="password" required />
      <button type="submit">Se connecter et autoriser</button>
      ${error ? `<div class="error">${error}</div>` : ""}
    </form>
  </div>
</body>
</html>`;
}

function html(body, status = 200) {
  return new Response(body, { status, headers: { "Content-Type": "text/html; charset=utf-8" } });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

export async function handleAuthorize(request, env) {
  const oauthReqInfo = await env.OAUTH_PROVIDER.parseAuthRequest(request);
  const clientInfo = await env.OAUTH_PROVIDER.lookupClient(oauthReqInfo.clientId);
  const clientName = escapeHtml((clientInfo && clientInfo.clientName) || oauthReqInfo.clientId);

  if (request.method === "GET") {
    return html(page(clientName, null));
  }

  const form = await request.formData();
  const email = String(form.get("email") || "").trim();
  const password = String(form.get("password") || "");

  const authResp = await fetch(`${env.SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: env.SUPABASE_ANON_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!authResp.ok) {
    return html(page(clientName, "Email ou mot de passe incorrect."));
  }

  const session = await authResp.json();
  const grantedScope = oauthReqInfo.scope && oauthReqInfo.scope.length ? oauthReqInfo.scope : ["wardrobe.read"];

  const { redirectTo } = await env.OAUTH_PROVIDER.completeAuthorization({
    request: oauthReqInfo,
    userId: session.user.id,
    metadata: { email: session.user.email },
    scope: grantedScope,
    props: {
      supabaseUserId: session.user.id,
      supabaseAccessToken: session.access_token,
      supabaseRefreshToken: session.refresh_token,
    },
  });

  return Response.redirect(redirectTo, 302);
}
