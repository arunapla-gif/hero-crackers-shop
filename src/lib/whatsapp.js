export { generateInvoicePDFBuffer } from './pdfGenerator.js';


export async function uploadMediaToWhatsApp(buffer, filename) {
  const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
  const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
  
  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    console.log('Skipping WhatsApp Media Upload: Missing credentials in .env');
    return null;
  }

  const formData = new FormData();
  formData.append('file', new Blob([buffer], { type: 'application/pdf' }), filename);
  formData.append('messaging_product', 'whatsapp');
  formData.append('type', 'application/pdf');

  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_NUMBER_ID}/media`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`
      },
      body: formData
    });

    if (!res.ok) {
      console.error('WhatsApp Media Upload Failed:', await res.text());
      return null;
    }
    
    const data = await res.json();
    return data.id; // Returns the Media ID
  } catch (error) {
    console.error('WhatsApp Media Upload Error:', error);
    return null;
  }
}

export async function sendWhatsAppTemplate(phone, templateName, variables, mediaId = null) {
  const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
  const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
  
  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    console.log('Skipping WhatsApp Send: Missing credentials in .env');
    return;
  }

  if (!phone) return;
  const to = '91' + phone.replace(/[^0-9]/g, '').slice(-10);

  const payload = {
    messaging_product: 'whatsapp',
    to: to,
    type: 'template',
    template: {
      name: templateName,
      language: { code: 'en_US' },
      components: []
    }
  };

  if (mediaId) {
    payload.template.components.push({
      type: 'header',
      parameters: [
        {
          type: 'document',
          document: {
            id: mediaId,
            filename: 'Invoice.pdf'
          }
        }
      ]
    });
  }

  if (variables && variables.length > 0) {
    payload.template.components.push({
      type: 'body',
      parameters: variables.map(v => ({ type: 'text', text: String(v) }))
    });
  }

  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      console.error('WhatsApp Send Failed:', await res.text());
    } else {
      console.log(`WhatsApp Template '${templateName}' successfully sent to ${to}`);
    }
  } catch (error) {
    console.error('WhatsApp Send Error:', error);
  }
}
