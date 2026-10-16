/**
 * Scene 07 — the contact endpoint.
 *
 * The site is a static build, so the form has nowhere to post. This is that
 * somewhere: one HTTP handler that takes the form's payload, checks it, and
 * hands it to Resend, which delivers it as an email.
 *
 * It has no dependencies on purpose. Node's `fetch` talks to Resend's REST API
 * directly, so the service is this file plus a package.json that only pins the
 * Node version — which keeps the cold start on a free instance short, since
 * there is nothing to install.
 *
 * Environment:
 *   RESEND_API_KEY      Required. From resend.com/api-keys.
 *   CONTACT_TO_EMAIL    Where the message lands.
 *   CONTACT_FROM_EMAIL  The sender. `onboarding@resend.dev` works until a
 *                       domain is verified — but Resend will then only deliver
 *                       to the address the Resend account itself belongs to.
 *   CONTACT_FROM_NAME   Display name on the notification.
 *   ALLOWED_ORIGINS     Comma-separated list of allowed origins. Unset means
 *                       any origin, which is safe here: the endpoint holds no
 *                       session, no cookie and no stored data. It validates a
 *                       message, forwards it and forgets it.
 */

import { createServer } from "node:http";

const PORT = Number(process.env.PORT ?? 10000);
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
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

/** Limits that protect the inbox rather than the server. */
const MAX_BODY_BYTES = 16 * 1024;
const MAX_FIELD = 200;
const MAX_MESSAGE = 5000;
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

/** The honeypot. A real reader never sees it, let alone fills it in. */
const HONEYPOT_FIELD = "website";

/** Fields the form is allowed to send, in the order they are validated. */
const TEXT_FIELDS = ["name", "company", "email", "message", HONEYPOT_FIELD];

/** Recent submissions per IP: `{ count, resetAt }`, pruned as it is read. */
const recentSubmissions = new Map();

const asString = (value) => (typeof value === "string" ? value.trim() : "");

const escapeHtml = (value) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

function clientIp(request) {
  const forwarded = request.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return request.socket.remoteAddress ?? "unknown";
}

function prune(submissions) {
  if (submissions.size < 500) return;
  const now = Date.now();
  for (const [key, entry] of submissions) {
    if (entry.resetAt <= now) submissions.delete(key);
  }
}

function isRateLimited(ip) {
  const now = Date.now();
  const entry = recentSubmissions.get(ip);
  if (!entry || entry.resetAt <= now) {
    recentSubmissions.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    request.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error("Request body too large."));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    request.on("error", reject);
  });
}

function corsHeaders(origin) {
  if (!origin) return {};
  // No configured list means any origin is fine — see the file header.
  const permitted =
    ALLOWED_ORIGINS.length === 0 || ALLOWED_ORIGINS.includes(origin);
  if (!permitted) return { Vary: "Origin" };
  return { "Access-Control-Allow-Origin": origin, Vary: "Origin" };
}

function sendJson(response, status, payload, extraHeaders = {}) {
  const body = JSON.stringify(payload);
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store",
    ...extraHeaders,
  });
  response.end(body);
}

/**
 * Check the payload and return both the cleaned fields and whatever is wrong
 * with them, so the browser can put the error beside the right input.
 */
function validate(payload) {
  const source = payload && typeof payload === "object" ? payload : {};
  const clean = {};
  const errors = {};

  for (const field of TEXT_FIELDS) clean[field] = asString(source[field]);

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

  if (clean[HONEYPOT_FIELD]) errors[HONEYPOT_FIELD] = "Rejected.";

  return { clean, errors };
}

/** Everything about the submission that the visitor did not type. */
function buildMeta(payload, request, ip) {
  const at = new Date();
  const context = payload && typeof payload === "object" ? payload : {};
  const clip = (value, max) => asString(value).slice(0, max);

  return {
    sentAt: `${at.toISOString().replace("T", " ").slice(0, 19)} UTC`,
    localTime: clip(context.localTime, 80) || "—",
    timezone: clip(context.timezone, 80) || "—",
    language: clip(context.language, 80) || "—",
    page: clip(context.url, 400) || "—",
    referrer: clip(context.referrer, 400) || "—",
    browser: clip(request.headers["user-agent"], 300) || "—",
    ip,
  };
}

function buildEmail(clean, meta) {
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

async function deliver({ subject, text, html, replyTo }) {
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

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.message || `Resend responded ${response.status}.`);
  }
  return result.id;
}

const server = createServer(async (request, response) => {
  const cors = corsHeaders(request.headers.origin);

  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      ...cors,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    });
    response.end();
    return;
  }

  // Uptime monitors and the keep-warm ping land here.
  if (request.method === "GET" && (request.url === "/" || request.url === "/health")) {
    sendJson(response, 200, { ok: true, service: "portfolio-contact" }, cors);
    return;
  }

  if (request.method !== "POST" || !request.url?.startsWith("/api/contact")) {
    sendJson(response, 404, { ok: false, error: "Not found." }, cors);
    return;
  }

  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not set — refusing the submission.");
    sendJson(
      response,
      503,
      { ok: false, error: "The contact form is not configured yet." },
      cors,
    );
    return;
  }

  const ip = clientIp(request);
  prune(recentSubmissions);
  if (isRateLimited(ip)) {
    sendJson(
      response,
      429,
      { ok: false, error: "Too many messages from here just now. Try again in a minute." },
      cors,
    );
    return;
  }

  let payload;
  try {
    payload = JSON.parse(await readBody(request));
  } catch {
    sendJson(response, 400, { ok: false, error: "Malformed request." }, cors);
    return;
  }

  const { clean, errors } = validate(payload);
  if (Object.keys(errors).length > 0) {
    const firstError = Object.values(errors)[0];
    sendJson(
      response,
      400,
      { ok: false, error: firstError, fields: errors },
      cors,
    );
    return;
  }

  const meta = buildMeta(payload, request, ip);

  try {
    const id = await deliver({ ...buildEmail(clean, meta), replyTo: clean.email });
    console.log(`Contact form delivered from ${clean.email} — Resend id ${id}`);
    sendJson(response, 200, { ok: true }, cors);
  } catch (error) {
    console.error("Contact form delivery failed:", error);
    sendJson(
      response,
      502,
      { ok: false, error: "The message could not be sent just now." },
      cors,
    );
  }
});

server.listen(PORT, () => {
  console.log(`Contact endpoint listening on port ${PORT}.`);
  console.log(
    RESEND_API_KEY
      ? `Delivering to ${TO_EMAIL} from ${FROM_EMAIL}.`
      : "RESEND_API_KEY missing — submissions will be refused.",
  );
});
