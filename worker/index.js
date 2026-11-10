/* ===========================================================
   loops.uz — lead form → Telegram bot (edge proxy)
   The bot token lives ONLY as a Worker secret (env.TG_TOKEN),
   never in the repo or the public site. Deployed via wrangler.

   Route:  POST https://loops.uz/api/lead
   Body:   { name, contact, source, business?, service?, message?, page?, company? }
           company = honeypot (real form sends the business as `business`).
           contact must be a phone or a Telegram username — see normalizeContact.
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

/* Phone or Telegram only. Returns a clean contact or null.
   Same rule as normalizeContact in the site form (App.jsx) — change both. */
export function normalizeContact(raw) {
  const s = String(raw || "").trim();
  const tg = s.match(/^(?:@|(?:https?:\/\/)?t(?:elegram)?\.me\/)([A-Za-z][A-Za-z0-9_]{4,31})\/?$/i);
  if (tg) return "@" + tg[1];
  if (!/^[+\d\s()\-.]+$/.test(s)) return null;
  const d = s.replace(/\D/g, "");
  if (d.length === 9) return "+998" + d;                       // 90 123 45 67
  if (d.length === 12 && d.startsWith("998")) return "+" + d;   // 998 90 123 45 67
  if (s.startsWith("+") && d.length >= 10 && d.length <= 15) return "+" + d;
  return null;
}

const clip = (v, n) => String(v || "").trim().slice(0, n);

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

    const name = clip(data && data.name, 200);
    const contact = normalizeContact(data && data.contact);
    const source = clip(data && data.source, 80) || "loops.uz";
    const business = clip(data && data.business, 200);
    const service = clip(data && data.service, 120);
    const message = clip(data && data.message, 2000);
    const page = clip(data && data.page, 200);

    if (!name) return json({ ok: false, error: "empty" }, 422, h);
    if (!contact) return json({ ok: false, error: "bad_contact" }, 422, h);

    if (!env.TG_TOKEN || !env.TG_CHAT)
      return json({ ok: false, error: "not_configured" }, 500, h);

    // Telegram makes phone numbers tappable itself; usernames get a link.
    const link = contact.startsWith("@") ? ` — https://t.me/${contact.slice(1)}` : "";
    const text =
      `🟡 Новая заявка с сайта (${source})\n\n` +
      `👤 Имя: ${name}\n` +
      `📞 Контакт: ${contact}${link}\n` +
      (business ? `🏢 Бизнес: ${business}\n` : "") +
      (service ? `🎯 Задача: ${service}\n` : "") +
      (message ? `\n💬 ${message}\n` : "") +
      (page ? `\n📄 Страница: ${page}` : "");

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
