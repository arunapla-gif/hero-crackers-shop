/**
 * Utility library for integrating with MSG91 APIs (specifically WhatsApp).
 */

const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;
const INTEGRATED_NUMBER = "916385830419"; // Hero Crackers Number

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
    return false;
  }

  // Clean the phone number (ensure it has 91 country code, assuming India for now)
  const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
  const toPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  // The components mapping assumes your MSG91 template 'order_confirmation' 
  // uses {{1}} for Name, {{2}} for Order ID, and {{3}} for Amount.
  // Update the 'body_1', 'body_2', etc. if your approved template is structured differently.
  const payload = {
    "integrated-number": INTEGRATED_NUMBER,
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
      return true;
    } else {
      console.error(`❌ MSG91 WhatsApp Error:`, result);
      return false;
    }
  } catch (error) {
    console.error(`❌ Failed to send MSG91 WhatsApp request:`, error);
    return false;
  }
}
