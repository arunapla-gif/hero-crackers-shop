/**
 * Utility library for integrating with MSG91 APIs (specifically WhatsApp).
 */

const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;
const INTEGRATED_NUMBER = "919047488862"; // Number where the template was approved

/**
 * Sends an automated order confirmation message via MSG91 WhatsApp API.
 * 
 * @param {string} customerPhone - The customer's 10-digit phone number
 * @param {string} customerName - The customer's name
 * @param {string|number} orderId - The generated order ID
 * @param {string|number} totalAmount - The total order amount
 */
export async function sendWhatsAppOrderConfirmation(customerPhone, customerName, orderId, totalAmount) {
  if (!MSG91_AUTH_KEY) {
    console.warn('MSG91_AUTH_KEY is not defined in environment variables. Skipping WhatsApp notification.');
    return { success: false, error: 'MSG91_AUTH_KEY missing' };
  }

  // Clean the phone number (ensure it has 91 country code, assuming India for now)
  const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
  const toPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  // Build the public URL for the estimate PDF
  // Assuming the production domain is herocrackers.com
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://herocrackers.com';
  const estimateUrl = `${baseUrl}/api/orders/${orderId}/estimate`;

  // The components mapping assumes your MSG91 template 'order_confirmation' 
  // uses {{1}} for Name, {{2}} for Order ID, and {{3}} for Amount,
  // AND has a Document header.
  const payload = {
    "integrated_number": INTEGRATED_NUMBER,
    "content_type": "template",
    "payload": {
      "messaging_product": "whatsapp",
      "type": "template",
      "template": {
        "name": "order_confirmation",
        "language": {
          "code": "en",
          "policy": "deterministic"
        },
        "to_and_components": [
          {
            "to": [toPhone],
            "components": {
              "header_1": {
                "type": "document",
                "value": estimateUrl,
                "filename": `Estimate_${orderId.substring(0, 8)}.pdf`
              },
              "body_1": {
                "type": "text",
                "value": customerName || "Customer"
              },
              "body_2": {
                "type": "text",
                "value": String(orderId)
              },
              "body_3": {
                "type": "text",
                "value": String(totalAmount)
              }
            }
          }
        ]
      }
    }
  };

  try {
    const response = await fetch('https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/', {
      method: 'POST',
      headers: {
        'authkey': MSG91_AUTH_KEY,
        'accept': 'application/json',
        'content-type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    
    if (response.ok && !result.hasError) {
      console.log(`✅ WhatsApp order confirmation sent to ${toPhone} for Order ${orderId}`);
      return { success: true };
    } else {
      console.error(`❌ MSG91 WhatsApp Error:`, result);
      return { success: false, error: result };
    }
  } catch (error) {
    console.error(`❌ Failed to send MSG91 WhatsApp request:`, error);
    return { success: false, error: error.message };
  }
}
