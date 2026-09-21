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
 * @param {string} [actualCustomerPhone] - The original customer phone (used for formatting)
 * @param {number} [orderNumber] - The integer order number
 * @param {string} [shippingAddress] - The shipping address to extract city
 */
export async function sendWhatsAppOrderConfirmation(customerPhone, customerName, orderId, totalAmount, actualCustomerPhone, orderNumber, shippingAddress) {
  if (!MSG91_AUTH_KEY) {
    console.warn('MSG91_AUTH_KEY is not defined in environment variables. Skipping WhatsApp notification.');
    return { success: false, error: 'MSG91_AUTH_KEY missing' };
  }

  // Clean the phone number (ensure it has 91 country code, assuming India for now)
  const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
  const toPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  // Build the public URL for the estimate PDF
  // Assuming the production domain is herocrackers.com
  let baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.herocrackers.com';
  // Force www to prevent 308 redirects which Meta bots will not follow for documents
  if (baseUrl === 'https://herocrackers.com') {
    baseUrl = 'https://www.herocrackers.com';
  }
  const estimateUrl = `${baseUrl}/api/orders/${orderId}/estimate`;

  // Extract city from shippingAddress (assumes last part after comma is city)
  let city = 'City';
  if (shippingAddress) {
    const parts = shippingAddress.split(',').map(s => s.trim());
    if (parts.length >= 3) {
      city = parts[parts.length - 2]; // Second to last is City
    } else if (parts.length === 2) {
      city = parts[1]; // Last is City
    } else {
      city = parts[0];
    }
  }
  const cleanCity = city.replace(/[^a-zA-Z0-9\s]/g, "").trim().substring(0, 15).replace(/\s+/g, "_");

  // Build the display string: Estimate - OrderNo(Last 3 digits) - Name - City
  const cleanName = (customerName || "Customer").replace(/[^a-zA-Z0-9\s]/g, "").trim().substring(0, 15).replace(/\s+/g, "_");
  
  const displayOrderNo = orderNumber ? String(orderNumber).padStart(3, '0').slice(-3) : String(orderId).substring(0, 3);
  const displayString = `Estimate-${displayOrderNo}-${cleanName}-${cleanCity}`;

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
                "filename": `${displayString}.pdf`
              },
              "body_1": {
                "type": "text",
                "value": customerName || "Customer"
              },
              "body_2": {
                "type": "text",
                "value": displayString
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

/**
 * Sends an automated copy of new estimate bookings to the business admin phone.
 */
export async function sendAdminOrderAlert(customerName, customerPhone, orderId, totalAmount) {
  const adminPhone = process.env.ADMIN_ALERT_PHONE || '919047488862';
  return sendWhatsAppOrderConfirmation(
    adminPhone,
    `New Order: ${customerName} (${customerPhone})`,
    orderId,
    totalAmount
  );
}

