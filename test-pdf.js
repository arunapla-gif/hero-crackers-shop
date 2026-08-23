import { generateInvoicePDFBuffer } from './src/lib/pdfGenerator.js';
const order = { id: 'cms6gtgbx000104l4vqqhiny6', items: [], totalAmount: 0 };
generateInvoicePDFBuffer(order, []).then(buf => console.log('success', buf.length)).catch(console.error);
