/**
 * Scene 07 — the contact endpoint.
 *
 * The site is a static build, so the form has nowhere to post. This is that
 * somewhere: one function on the site's own domain, which checks the payload
 * and hands it to Resend, which emails it on.
 *
 * Because it is served from the origin the site is already on, the form posts
 * to a relative `/api/contact` — so there is no CORS to configure and no
 * build-time URL to keep in sync between two hosts.
 *
 * Environment, set on the Vercel project and never in the repo:
 *   RESEND_API_KEY      Required. From resend.com/api-keys.
 *   CONTACT_TO_EMAIL    Where the message lands.
 *   CONTACT_FROM_EMAIL  The sender. `onboarding@resend.dev` works until a
 *                       domain is verified — but Resend will then only deliver
 *                       to the address the Resend account itself belongs to.
 *   CONTACT_FROM_NAME   Display name on the notification.
 */

import type { IncomingMessage, ServerResponse } from "node:http";

const RESEND_API_KEY = (process.env.RESEND_API_KEY ?? "").trim();
const TO_EMAIL = (
  process.env.CONTACT_TO_EMAIL ?? "mail4shritejkoneru@gmail.com"
).trim();
const FROM_EMAIL = (
  process.env.CONTACT_FROM_EMAIL ?? "onboarding@resend.dev"
).trim();
const FROM_NAME = (
  process.env.CONTACT_FROM_NAME ?? "Portfolio contact form"
).trim();

/** Limits that protect the inbox rather than the function. */
const MAX_FIELD = 200;
const MAX_MESSAGE = 5000;
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

/** The honeypot. A real reader never sees it, let alone fills it in. */
const HONEYPOT = "website";

/** Fields the form may send, in the order they are validated. */
const TEXT_FIELDS = ["name", "company", "email", "message", HONEYPOT];

/**
 * Recent submissions per IP. A serverless instance only sees the requests it
 * happens to serve, so this throttles a persistent sender without pretending
 * to be a real rate limiter — the honeypot does most of the work.
 */
const recent = new Map<string, { count: number; resetAt: number }>();

type Payload = Record<string, unknown>;

const asString = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

function clientIp(request: IncomingMessage): string {
  const forwarded = request.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return request.socket.remoteAddress ?? "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = recent.get(ip);
  if (!entry || entry.resetAt <= now) {
    if (recent.size > 500) {
      for (const [key, value] of recent) {
        if (value.resetAt <= now) recent.delete(key);
      }
    }
    recent.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

/**
 * Vercel parses a JSON body before the handler runs, so `req.body` is normally
 * already an object. The stream fallback covers a direct call with a body type
 * Vercel leaves alone.
 */
async function readPayload(request: IncomingMessage): Promise<Payload | null> {
  const given = (request as IncomingMessage & { body?: unknown }).body;
  if (given && typeof given === "object") return given as Payload;
  if (typeof given === "string") {
    try {
      return JSON.parse(given) as Payload;
    } catch {
      return null;
    }
  }

  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(chunk as Buffer);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Payload;
  } catch {
    return null;
  }
}

/**
 * Check the payload and return both the cleaned fields and whatever is wrong
 * with them, so the browser can put an error beside the right input.
 */
function validate(payload: Payload) {
  const clean: Record<string, string> = {};
  const errors: Record<string, string> = {};

  for (const field of TEXT_FIELDS) clean[field] = asString(payload[field]);

  if (!clean.name) errors.name = "Name is required.";
  else if (clean.name.length > 120) errors.name = "Name is too long.";

  if (!clean.email) errors.email = "An email address is required.";
  else if (
    clean.email.length > MAX_FIELD ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clean.email)
  ) {
    errors.email = "That email address does not look right.";
  }

  if (!clean.message) errors.message = "A message is required.";
  else if (clean.message.length > MAX_MESSAGE)
    errors.message = "Message is too long.";

  if (clean.company.length > 120) errors.company = "Company is too long.";

  if (clean[HONEYPOT]) errors[HONEYPOT] = "Rejected.";

  return { clean, errors };
}

/** Everything about the submission that the visitor did not type. */
function buildMeta(payload: Payload, request: IncomingMessage, ip: string) {
  const clip = (value: unknown, max: number) => asString(value).slice(0, max);
  return {
    sentAt: `${new Date().toISOString().replace("T", " ").slice(0, 19)} UTC`,
    localTime: clip(payload.localTime, 80) || "—",
    timezone: clip(payload.timezone, 80) || "—",
    language: clip(payload.language, 80) || "—",
    page: clip(payload.url, 400) || "—",
    referrer: clip(payload.referrer, 400) || "—",
    browser: clip(request.headers["user-agent"], 300) || "—",
    ip,
  };
}

type Meta = ReturnType<typeof buildMeta>;

function buildEmail(clean: Record<string, string>, meta: Meta) {
  const subject = clean.company
    ? `New enquiry — ${clean.name} (${clean.company})`
    : `New enquiry — ${clean.name}`;

  const details = [
    { label: "Name", value: clean.name },
    { label: "Email", value: clean.email, href: `mailto:${clean.email}` },
    { label: "Company", value: clean.company || "—" },
    { label: "Sent", value: meta.sentAt },
    { label: "Their local time", value: meta.localTime },
    { label: "Timezone", value: meta.timezone },
    { label: "Language", value: meta.language },
    { label: "Sent from", value: meta.page, href: meta.page },
    { label: "Arrived via", value: meta.referrer, href: meta.referrer },
    { label: "Browser", value: meta.browser },
    { label: "IP address", value: meta.ip },
  ];

  const text = [
    "New enquiry from the portfolio.",
    "",
    ...details.map(({ label, value }) => `${label}: ${value}`),
    "",
    "Message",
    "-------",
    clean.message,
  ].join("\n");

  const rows = details
    .map(({ label, value, href }) => {
      const shown =
        href && href !== "—"
          ? `<a href="${escapeHtml(href)}" style="color:#5977E8;text-decoration:none">${escapeHtml(value)}</a>`
          : escapeHtml(value);
      return `<tr>
        <td style="padding:5px 14px 5px 0;color:#6B7280;white-space:nowrap;vertical-align:top">${escapeHtml(label)}</td>
        <td style="padding:5px 0;color:#111318;word-break:break-word">${shown}</td>
      </tr>`;
    })
    .join("\n");

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#F2F0E9">
    <div style="max-width:620px;margin:0 auto;background:#FFFFFF;border:1px solid #E4E1D8;border-radius:14px;padding:28px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#111318">
      <p style="margin:0 0 6px;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#5977E8">Portfolio enquiry</p>
      <h1 style="margin:0 0 22px;font-size:22px;line-height:1.3;font-weight:600">${escapeHtml(clean.name)}${clean.company ? ` · ${escapeHtml(clean.company)}` : ""}</h1>
      <div style="white-space:pre-wrap;font-size:16px;line-height:1.65;border-left:3px solid #5977E8;padding-left:16px;margin:0 0 30px">${escapeHtml(clean.message)}</div>
      <table style="width:100%;border-collapse:collapse;font-size:13px;line-height:1.5">${rows}</table>
      <p style="margin:26px 0 0;padding-top:16px;border-top:1px solid #E4E1D8;font-size:12px;color:#6B7280">
        Replying to this email goes straight back to ${escapeHtml(clean.email)}.
      </p>
    </div>
  </body>
</html>`;

  return { subject, text, html };
}

async function deliver({
  subject,
  text,
  html,
  replyTo,
}: {
  subject: string;
  text: string;
  html: string;
  replyTo: string;
}) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [TO_EMAIL],
      reply_to: replyTo,
      subject,
      text,
      html,
    }),
  });

  const result = (await response.json().catch(() => ({}))) as {
    id?: string;
    message?: string;
  };
  if (!response.ok) {
    throw new Error(result.message || `Resend responded ${response.status}.`);
  }
  return result.id;
}

function send(response: ServerResponse, status: number, payload: unknown) {
  const body = JSON.stringify(payload);
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store",
  });
  response.end(body);
}

export default async function handler(
  request: IncomingMessage,
  response: ServerResponse,
) {
  // A plain GET is a liveness check for uptime monitors and for us.
  if (request.method === "GET") {
    send(response, 200, { ok: true, service: "portfolio-contact" });
    return;
  }

  if (request.method !== "POST") {
    send(response, 405, { ok: false, error: "Use POST." });
    return;
  }

  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not set — refusing the submission.");
    send(response, 503, {
      ok: false,
      error: "The contact form is not configured yet.",
    });
    return;
  }

  const ip = clientIp(request);
  if (isRateLimited(ip)) {
    send(response, 429, {
      ok: false,
      error: "Too many messages from here just now. Try again in a minute.",
    });
    return;
  }

  const payload = await readPayload(request);
  if (!payload) {
    send(response, 400, { ok: false, error: "Malformed request." });
    return;
  }

  const { clean, errors } = validate(payload);
  if (Object.keys(errors).length > 0) {
    send(response, 400, {
      ok: false,
      error: Object.values(errors)[0],
      fields: errors,
    });
    return;
  }

  try {
    const id = await deliver({
      ...buildEmail(clean, buildMeta(payload, request, ip)),
      replyTo: clean.email,
    });
    console.log(`Contact form delivered from ${clean.email} — Resend id ${id}`);
    send(response, 200, { ok: true });
  } catch (error) {
    console.error("Contact form delivery failed:", error);
    send(response, 502, {
      ok: false,
      error: "The message could not be sent just now.",
    });
  }
}
