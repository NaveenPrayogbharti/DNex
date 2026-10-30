/**
 * backend/server/services/whatsappService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * MSG91 WhatsApp Outbound Messaging Service
 *
 * Integrates with MSG91 WhatsApp Outbound Bulk Message API:
 *   Endpoint: https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/
 *   Headers:  authkey: <MSG91_AUTH_KEY>
 *             Content-Type: application/json
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * Normalizes a phone number for MSG91 WhatsApp API:
 * - Strips all non-digit characters (+, spaces, dashes, etc.)
 * - Removes leading international '00'
 * - Auto-formats local UAE numbers:
 *     05xxxxxxxx -> 9715xxxxxxxx
 *     5xxxxxxxx (9 digits) -> 9715xxxxxxxx
 * - Preserves other international country codes
 *
 * @param {string|number} phone
 * @returns {string} E.164-compatible digits without '+'
 */
function formatWhatsAppNumber(phone) {
  if (!phone) return '';
  let cleaned = String(phone).replace(/\D/g, '');

  if (cleaned.startsWith('00')) {
    cleaned = cleaned.slice(2);
  }

  // UAE local mobile numbers: e.g. 0581685389 -> 971581685389
  if (cleaned.startsWith('05') && cleaned.length === 10) {
    cleaned = '971' + cleaned.slice(1);
  } else if (cleaned.startsWith('5') && cleaned.length === 9) {
    // 9 digits without leading 0: 581685389 -> 971581685389
    cleaned = '971' + cleaned;
  }

  return cleaned;
}

/**
 * Sends a WhatsApp message via MSG91 Bulk Outbound API.
 *
 * @param {Object} options
 * @param {string|string[]} options.to - Single phone number or array of phone numbers
 * @param {string} [options.templateName='welcome_dnex'] - Registered WhatsApp template name
 * @param {Object} [options.components={}] - Template components / variables
 * @param {Object|string} [options.language] - Language object or code (default: { code: 'en', policy: 'deterministic' })
 * @param {string} [options.namespace] - Template namespace (default from env or fallback)
 * @param {string} [options.integratedNumber] - Integrated WhatsApp sender number (default from env or 971581685389)
 * @returns {Promise<{ success: boolean, skipped?: boolean, data?: any, error?: string }>}
 */
async function sendWhatsAppMessage({
  to,
  templateName = 'welcome_dnex',
  components = {},
  language = { code: 'en', policy: 'deterministic' },
  namespace,
  integratedNumber,
}) {
  if (!to) {
    return { success: false, error: 'Recipient phone number is required' };
  }

  const rawList = Array.isArray(to) ? to : [to];
  const formattedNumbers = rawList
    .map(p => formatWhatsAppNumber(p))
    .filter(p => Boolean(p) && p.length >= 7);

  if (formattedNumbers.length === 0) {
    return { success: false, error: 'No valid phone numbers found after formatting' };
  }

  const authKey = process.env.MSG91_AUTH_KEY;
  if (!authKey) {
    console.warn(`⚠️ [WhatsApp] MSG91_AUTH_KEY is not configured in .env. Message skipped for: ${formattedNumbers.join(', ')}`);
    return {
      success: false,
      skipped: true,
      error: 'MSG91_AUTH_KEY is not configured in environment variables'
    };
  }

  const integrated_number = integratedNumber || process.env.MSG91_INTEGRATED_NUMBER || '971581685389';
  const templateNamespace = namespace || process.env.MSG91_WHATSAPP_NAMESPACE || 'f707324d_45ec_4013_be13_01700f343b40';
  const name = templateName || 'welcome_dnex';
  const langObj = typeof language === 'string'
    ? { code: language, policy: 'deterministic' }
    : (language || { code: 'en', policy: 'deterministic' });

  const payload = {
    integrated_number,
    content_type: 'template',
    payload: {
      messaging_product: 'whatsapp',
      type: 'template',
      template: {
        name,
        language: langObj,
        namespace: templateNamespace,
        to_and_components: [
          {
            to: formattedNumbers,
            components: components || {}
          }
        ]
      }
    }
  };

  const apiUrl = process.env.MSG91_WHATSAPP_URL || 'https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/';

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authkey': authKey
      },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { message: responseText };
    }

    if (!response.ok) {
      console.error(`❌ [WhatsApp] MSG91 API error (${response.status}):`, responseData);
      return {
        success: false,
        status: response.status,
        error: responseData.message || responseData.error || responseText,
        data: responseData
      };
    }

    console.log(`✅ [WhatsApp] Message sent via template "${name}" to: ${formattedNumbers.join(', ')}`);
    return {
      success: true,
      data: responseData
    };
  } catch (error) {
    console.error('❌ [WhatsApp] Network error while calling MSG91 API:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Convenience helper to send the 'welcome_dnex' template to a phone number.
 *
 * @param {string|string[]} phone
 * @param {Object} [components={}]
 * @returns {Promise<{ success: boolean, data?: any, error?: string }>}
 */
async function sendWelcomeWhatsApp(phone, components = {}) {
  return sendWhatsAppMessage({
    to: phone,
    templateName: 'welcome_dnex',
    components
  });
}

/**
 * Returns current WhatsApp integration status and configured defaults.
 */
function getWhatsAppStatus() {
  return {
    configured: Boolean(process.env.MSG91_AUTH_KEY),
    integratedNumber: process.env.MSG91_INTEGRATED_NUMBER || '971581685389',
    namespace: process.env.MSG91_WHATSAPP_NAMESPACE || 'f707324d_45ec_4013_be13_01700f343b40',
    defaultTemplate: 'welcome_dnex',
    endpoint: process.env.MSG91_WHATSAPP_URL || 'https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/'
  };
}

module.exports = {
  formatWhatsAppNumber,
  sendWhatsAppMessage,
  sendWelcomeWhatsApp,
  getWhatsAppStatus
};

