/* ===========================================================
   loops.uz — lead form → Telegram bot (edge proxy)
   The bot token lives ONLY as a Worker secret (env.TG_TOKEN),
   never in the repo or the public site. Deployed via wrangler.

   Route:  POST https://loops.uz/api/lead
   Body:   { name, contact, source, company? }   (company = honeypot)
   Secrets: TG_TOKEN  (wrangler secret put TG_TOKEN)
   Vars:    TG_CHAT   (wrangler.toml [vars])
   =========================================================== */

const ALLOW_ORIGIN = "https://loops.uz";

function cors(origin) {
  // allow the production origin (and bare apex) only
  const ok = origin === ALLOW_ORIGIN || origin === "https://www.loops.uz";
  return {
    "Access-Control-Allow-Origin": ok ? origin : ALLOW_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
}

function json(obj, status, headers) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

export default {
  async fetch(req, env) {
    const h = cors(req.headers.get("Origin") || "");

    if (req.method === "OPTIONS") return new Response(null, { headers: h });
    if (req.method !== "POST")
      return json({ ok: false, error: "method" }, 405, h);

    let data;
    try {
      data = await req.json();
    } catch {
      return json({ ok: false, error: "bad_json" }, 400, h);
    }

    // honeypot: real users never fill this hidden field → silently accept
    if (data && data.company) return json({ ok: true }, 200, h);

    const name = String((data && data.name) || "").trim().slice(0, 200);
    const contact = String((data && data.contact) || "").trim().slice(0, 200);
    const source = String((data && data.source) || "loops.uz").trim().slice(0, 80);

    if (!name || !contact) return json({ ok: false, error: "empty" }, 422, h);

    if (!env.TG_TOKEN || !env.TG_CHAT)
      return json({ ok: false, error: "not_configured" }, 500, h);

    const text =
      `🟡 Новая заявка с сайта (${source})\n\n` +
      `👤 Имя: ${name}\n` +
      `📞 Контакт: ${contact}`;

    let tg;
    try {
      tg = await fetch(
        `https://api.telegram.org/bot${env.TG_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: env.TG_CHAT,
            text,
            disable_web_page_preview: true,
          }),
        }
      );
    } catch {
      return json({ ok: false, error: "tg_unreachable" }, 502, h);
    }

    if (!tg.ok) return json({ ok: false, error: "tg_failed" }, 502, h);
    return json({ ok: true }, 200, h);
  },
};
