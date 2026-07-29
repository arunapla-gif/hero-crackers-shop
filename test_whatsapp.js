import 'dotenv/config';
import { sendWhatsAppTemplate } from './src/lib/whatsapp.js';

async function testWhatsApp() {
  // Replace with the phone number you verified in the Meta Dashboard
  const testPhoneNumber = "9047332778";

  console.log("Sending test WhatsApp message to:", testPhoneNumber);
  
  // 'hello_world' is the default template provided by Meta
  await sendWhatsAppTemplate(testPhoneNumber, 'hello_world', []);
  
  console.log("Test finished! Check your WhatsApp.");
}

testWhatsApp();
