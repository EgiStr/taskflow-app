export type WebhookEvent =
  | "task.created"
  | "task.status_changed"
  | "task.payment_updated";

export type WebhookPayload = {
  event: WebhookEvent;
  timestamp: string;
  data: Record<string, unknown>;
};

/**
 * Fire-and-forget webhook to n8n.
 * Non-blocking — errors are logged but never thrown.
 */
export function fireWebhook(event: WebhookEvent, data: Record<string, unknown>) {
  // Sementara di-disable (langsung return) agar fitur webhook N8N 
  // tidak memblokir atau memperlambat fungsionalitas utama aplikasi
  return;

  /*
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn("[Webhook] N8N_WEBHOOK_URL is not configured, skipping.");
    return;
  }

  const payload: WebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    data,
  };

  // Fire-and-forget: do NOT await, but we MUST add a timeout
  // because Next.js tracks background fetches and will delay 
  // the server action response until the fetch resolves.
  fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(3000), // 3-second timeout
  }).catch((err) => {
    console.error(`[Webhook] Failed to fire event "${event}":`, err.message || err);
  });
  */
}

/**
 * Build the full tracking URL for a given trackingId.
 */
export function buildTrackingUrl(trackingId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}/track?id=${trackingId}`;
}
