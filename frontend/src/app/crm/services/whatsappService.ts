/**
 * frontend/src/app/crm/services/whatsappService.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * CRM WhatsApp Outbound Notification Service
 *
 * Sends official WhatsApp messages via DNEX Backend (powered by MSG91 WhatsApp API)
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface WhatsAppPayload {
  to: string | string[];
  templateName?: string;
  components?: Record<string, any>;
  language?: { code: string; policy: string } | string;
  namespace?: string;
  integratedNumber?: string;
}

export interface WhatsAppStatusResponse {
  configured: boolean;
  integratedNumber: string;
  namespace: string;
  defaultTemplate: string;
  endpoint: string;
}

const getBackendUrl = () => {
  return import.meta.env.VITE_BACKEND_API_URL !== undefined && import.meta.env.VITE_BACKEND_API_URL !== ''
    ? import.meta.env.VITE_BACKEND_API_URL
    : '';
};

/**
 * Triggers official MSG91 WhatsApp template send via backend.
 */
export async function sendWhatsAppTemplateMessage(
  payload: WhatsAppPayload
): Promise<{ success: boolean; data?: any; error?: string; skipped?: boolean }> {
  try {
    const url = `${getBackendUrl()}/api/notify/whatsapp`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || `HTTP error ${res.status}`, data };
    }
    return data;
  } catch (err: any) {
    console.error('[WhatsAppService] Error sending WhatsApp message:', err);
    return { success: false, error: err.message || 'Network request failed' };
  }
}

/**
 * Convenience method to send welcome template to a client.
 */
export async function sendWelcomeWhatsAppMessage(
  phone: string
): Promise<{ success: boolean; data?: any; error?: string; skipped?: boolean }> {
  return sendWhatsAppTemplateMessage({
    to: phone,
    templateName: 'welcome_dnex',
  });
}

/**
 * Checks WhatsApp integration status from backend.
 */
export async function getWhatsAppStatus(): Promise<WhatsAppStatusResponse | null> {
  try {
    const url = `${getBackendUrl()}/api/notify/whatsapp/status`;
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

